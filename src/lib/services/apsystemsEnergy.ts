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

    /**
     * Sincronização em Massa (Módulo 6)
     * Orquestra o sync de todos os sistemas, persistindo no banco
     */
    async syncEnergyData() {
        const startTime = Date.now();
        console.log("[SYNC ORCHESTRATOR] Starting mass synchronization...");

        // 1. Buscar sistemas do banco (Fonte oficial)
        const { data: dbSystems, error: dbError } = await supabase
            .from('systems')
            .select('id, sid, tem_meter');

        if (dbError) throw new Error(`Erro ao ler sistemas: ${dbError.message}`);

        const result = {
            total_processados: dbSystems?.length || 0,
            sucesso: 0,
            falhas: 0,
            tempo_execucao: 0
        };

        if (!dbSystems || dbSystems.length === 0) {
            console.log("[SYNC ORCHESTRATOR] No systems found to sync.");
            return result;
        }

        // 2. Iterar com controle de fila
        const tasks = dbSystems.map(async (sys) => {
            try {
                // buildEnergySnapshot já executa dentro da fila (via apsFetch)
                const snapshot = await this.buildEnergySnapshot({ sid: sys.sid, tem_meter: sys.tem_meter });

                // 3. Salvar resultados no banco (Update system)
                const { error: updateError } = await supabase
                    .from('systems')
                    .update({
                        last_generation: snapshot.generation.lifetime,
                        energy_today: snapshot.generation.today,
                        meter_data: snapshot.meter as any,
                        last_sync: new Date().toISOString()
                    })
                    .eq('id', sys.id);

                if (updateError) throw updateError;
                result.sucesso++;
            } catch (err: any) {
                console.error(`[SYNC ORCHESTRATOR] Falha no sistema ${sys.sid}:`, err.message);
                result.falhas++;
            }
        });

        // Esperar conclusão de todas os processos enfileirados
        await Promise.all(tasks);

        result.tempo_execucao = Math.ceil((Date.now() - startTime) / 1000);
        console.log("[SYNC ORCHESTRATOR] Mass sync complete:", result);

        return result;
    }
};
