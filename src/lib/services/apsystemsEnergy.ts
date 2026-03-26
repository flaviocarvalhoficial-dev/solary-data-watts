import { supabase } from '../supabase';
import { apsSystemsQueue } from '../../utils/apiQueue';

export interface EnergySnapshot {
    sid: string;
    generation: {
        today: number;
        month: number;
        year: number;
        lifetime: number;
    };
    meter: {
        consumed: number;
        produced: number;
        imported: number;
        exported: number;
    } | null;
}

const ERROR_MESSAGES: Record<string, string> = {
    '2005': 'Limite diário da API APsystems excedido.',
    '7002': 'Muitas requisições simultâneas. Tente novamente em instantes.',
    '2004': 'Erro de autorização. Verifique as credenciais da APsystems.',
    '4000': 'Assinatura inválida (Sign Error). Verifique AppSecret.',
};

async function apsFetch(payload: { action: string; system_id?: string;[key: string]: any }) {
    return apsSystemsQueue.add(async () => {
        const { data, error } = await supabase.functions.invoke('aps-proxy-deep-sync', {
            body: payload
        });

        if (error) {
            console.error(`[SYNC FATAL] Supabase function error:`, error);
            throw new Error(`Erro na conexão com Supabase: ${error.message}`);
        }

        // SE response.code != 0: TRATAMENTO ESTRITO (Módulo 5)
        const apiData = data?.data;
        const code = String(apiData?.code || '0');

        if (code !== '0' && code !== 'SUCCESS' && code !== 'undefined') {
            const msg = ERROR_MESSAGES[code] || apiData?.msg || apiData?.message || 'Erro desconhecido na APsystems';

            console.error(`[API ERROR] Endpoint: ${payload.action} | SID: ${payload.system_id || 'N/A'}`, {
                code,
                msg,
                timestamp: new Date().toISOString(),
                payloadSummary: payload
            });

            // INTERROMPER FLUXO (Não retornar lista vazia)
            throw new Error(`APsystems (${code}): ${msg}`);
        }

        if (!data?.success) {
            throw new Error(data?.error || 'Erro desconhecido no proxy');
        }

        return apiData;
    });
}

export const APsystemsEnergyService = {
    async getSystemSummary(sid: string) {
        const res = await apsFetch({ action: 'stats', system_id: sid });
        return res?.data || res;
    },

    async getSystemEnergy(sid: string, energyLevel: string = 'daily', dateRange?: string) {
        const res = await apsFetch({ action: 'energy', system_id: sid, energy_level: energyLevel, date_range: dateRange });
        return res?.data || res;
    },

    async getSystemMeters(sid: string) {
        const res = await apsFetch({ action: 'meters', system_id: sid });
        return res?.data || res;
    },

    async getMeterSummary(sid: string, eid: string) {
        const res = await apsFetch({ action: 'meter_summary', system_id: sid, eid });
        return res?.data || res;
    },

    async buildEnergySnapshot(system: { sid: string; tem_meter?: boolean }): Promise<EnergySnapshot> {
        const sid = system.sid;

        try {
            // 1. Get Summary (Geração)
            const summaryData = await this.getSystemSummary(sid);

            // 2. Get Meter Data (Consumo/Injeção) se tem_meter for true
            let meterData = null;
            if (system.tem_meter) {
                try {
                    const meters = await this.getSystemMeters(sid);
                    const meterList = Array.isArray(meters) ? meters : [meters];
                    const eid = meterList.find(m => m?.eid)?.eid;

                    if (eid) {
                        const mSum = await this.getMeterSummary(sid, eid);
                        if (mSum) {
                            meterData = {
                                consumed: Number(mSum.consumed) || 0,
                                produced: Number(mSum.produced) || 0,
                                imported: Number(mSum.imported) || 0,
                                exported: Number(mSum.exported) || 0
                            };
                        }
                    }
                } catch (e: any) {
                    console.warn(`[SYNC WARNING] Falha sutil no medidor para ${sid}: ${e.message}`);
                }
            }

            return {
                sid,
                generation: {
                    today: Number(summaryData?.today) || 0,
                    month: Number(summaryData?.month) || 0,
                    year: Number(summaryData?.year) || 0,
                    lifetime: Number(summaryData?.lifetime) || 0
                },
                meter: meterData
            };
        } catch (error: any) {
            // PROPAGAR ERRO (Módulo 5)
            throw error;
        }
    },

    async syncSingleSystem(id: string, sid: string, tem_meter: boolean, force: boolean = false) {
        console.log(`[SYNC INDIVIDUAL] Sincronizando sistema ${sid}${force ? ' (FORCE SYNC)' : ''}...`);

        // 1. Verificar cache (Módulo 5: Não buscar dados repetidos no mesmo dia)
        // Se force=true, ignoramos o cache.
        if (!force) {
            const todayStr = new Date().toISOString().split('T')[0];
            const { data: current, error: checkError } = await supabase
                .from('systems')
                .select('last_sync')
                .eq('id', id)
                .single();

            if (current?.last_sync && current.last_sync.startsWith(todayStr)) {
                console.log(`[SYNC CACHE] Sistema ${sid} já atualizado hoje. Ignorando.`);
                return { success: true, cached: true };
            }
        }

        try {
            const snapshot = await this.buildEnergySnapshot({ sid, tem_meter });

            const { error: updateError } = await supabase
                .from('systems')
                .update({
                    last_generation: snapshot.generation.lifetime,
                    energy_today: snapshot.generation.today,
                    meter_data: snapshot.meter as any,
                    last_sync: new Date().toISOString()
                })
                .eq('id', id);

            if (updateError) throw updateError;

            console.log(`[SYNC SUCCESS] Sistema ${sid} atualizado.`);
            return { success: true, snapshot };
        } catch (err: any) {
            const code = String(err.message || '').match(/\(([^)]+)\)/)?.[1] || '';
            const isRateLimit = code === '2005' || err.message?.includes('2005');

            console.error(`[SYNC ERROR] Sistema ${sid}:`, err.message);

            if (isRateLimit) {
                return { success: false, error: 'RATE_LIMIT', message: err.message };
            }
            return { success: false, error: 'FAILURE', message: err.message };
        }
    },

    /**
     * Sincronização em Lote Controlado (Módulo 6)
     * Processa um pequeno grupo de sistemas (máximo 5) para evitar blocks.
     */
    async syncEnergyData() {
        const MAX_BATCH_SIZE = 5;
        const startTime = Date.now();
        const todayStr = new Date().toISOString().split('T')[0];

        console.log("[SYNC BATCH] Iniciando ciclo de sincronização controlada...");

        // 1. Buscar apenas sistemas que ainda não foram sincronizados hoje e priorizar os mais antigos
        const { data: dbSystems, error: dbError } = await supabase
            .from('systems')
            .select('id, sid, tem_meter, last_sync')
            .or(`last_sync.is.null,last_sync.lt.${todayStr}`)
            .order('last_sync', { ascending: true, nullsFirst: true })
            .limit(MAX_BATCH_SIZE);

        if (dbError) throw new Error(`Erro ao buscar sistemas para lote: ${dbError.message}`);

        const result = {
            total_processados: dbSystems?.length || 0,
            sucesso: 0,
            falhas: 0,
            aborted: false,
            tempo_execucao: 0
        };

        if (!dbSystems || dbSystems.length === 0) {
            console.log("[SYNC BATCH] Nenhum sistema pendente para sincronizar hoje.");
            return result;
        }

        // 2. Processar de forma sequencial (não em massa!) para respeitar limite e permitir interrupção
        for (const sys of dbSystems) {
            const syncRes = await this.syncSingleSystem(sys.id, sys.sid, sys.tem_meter === true);

            if (syncRes.success) {
                result.sucesso++;
            } else {
                result.falhas++;
                // 3. Bloqueio Imediato (Módulo 4: Se 2005, parar loop)
                if (syncRes.error === 'RATE_LIMIT') {
                    console.error("[SYNC FATAL] Limite diário atingido (Erro 2005). Abortando lote.");
                    result.aborted = true;
                    break;
                }
            }

            // Delays entre requisições já são tratados pela apsSystemsQueue (600ms+)
            // Mas podemos adicionar um delay extra deliberado de 1 segundo conforme Módulo 2
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        result.tempo_execucao = Math.ceil((Date.now() - startTime) / 1000);
        console.log("[SYNC BATCH] Lote concluído:", result);

        return result;
    }
};
