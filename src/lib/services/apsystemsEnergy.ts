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

        const apiData = data?.data;
        // Check for Edge-level Rate Limit
        if (!data?.success && data?.error === 'RATE_LIMIT_EXCEEDED') {
            throw new Error(`APsystems (RATE_LIMIT_EXCEEDED): ${data.message || 'Limite mensal atingido'}`);
        }

        const code = String(apiData?.code || '0');

        if (code !== '0' && code !== 'SUCCESS' && code !== 'undefined') {
            const msg = ERROR_MESSAGES[code] || apiData?.msg || apiData?.message || 'Erro desconhecido na APsystems';

            console.error(`[API ERROR] Endpoint: ${payload.action} | SID: ${payload.system_id || 'N/A'}`, {
                code,
                msg,
                timestamp: new Date().toISOString()
            });

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

    async buildEnergySnapshot(system: { sid: string }): Promise<EnergySnapshot> {
        const sid = system.sid;
        try {
            const summaryData = await this.getSystemSummary(sid);
            return {
                sid,
                generation: {
                    today: Number(summaryData?.today) || 0,
                    month: Number(summaryData?.month) || 0,
                    year: Number(summaryData?.year) || 0,
                    lifetime: Number(summaryData?.lifetime) || 0
                },
                meter: null
            };
        } catch (error: any) {
            throw error;
        }
    },

    async syncSingleSystem(id: string, sid: string, force: boolean = false) {
        // Módulo 4: Lock de Recursos (Semáforo)
        // 1. Verificar se já não está sincronizando ou se foi atualizado hoje
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: current } = await supabase
            .from('systems')
            .select('last_sync, sync_status')
            .eq('id', id)
            .single();

        if (current?.sync_status === 'SYNCING') {
            console.warn(`[SYNC LOCK] Sistema ${sid} já está em processo de sincronização.`);
            return { success: false, error: 'SYNCING', message: 'Já sendo sincronizado' };
        }

        if (!force && current?.last_sync && current.last_sync.startsWith(todayStr)) {
            console.log(`[SYNC CACHE] Sistema ${sid} já atualizado hoje. Ignorando.`);
            return { success: true, cached: true };
        }

        // 2. Travar recurso
        await supabase.from('systems').update({ sync_status: 'SYNCING', sync_error: null }).eq('id', id);

        try {
            const snapshot = await this.buildEnergySnapshot({ sid });

            // 3. Sucesso: Atualizar dados e liberar
            const { error: updateError } = await supabase
                .from('systems')
                .update({
                    last_generation: snapshot.generation.lifetime,
                    energy_today: snapshot.generation.today,
                    last_sync: new Date().toISOString(),
                    sync_status: 'IDLE',
                    sync_error: null
                })
                .eq('id', id);

            if (updateError) throw updateError;

            console.log(`[SYNC SUCCESS] Sistema ${sid} atualizado.`);
            return { success: true, snapshot };
        } catch (err: any) {
            const isRateLimit = err.message?.includes('RATE_LIMIT_EXCEEDED') ||
                err.message?.includes('2005') ||
                err.message?.includes('Limite');

            console.error(`[SYNC ERROR] Sistema ${sid}:`, err.message);

            // 4. Falha: Registrar erro e liberar
            await supabase
                .from('systems')
                .update({
                    sync_status: isRateLimit ? 'IDLE' : 'ERROR',
                    sync_error: err.message
                })
                .eq('id', id);

            if (isRateLimit) {
                return { success: false, error: 'RATE_LIMIT', message: err.message };
            }
            return { success: false, error: 'FAILURE', message: err.message };
        }
    },

    async syncEnergyData() {
        const MAX_BATCH_SIZE = 5;
        const startTime = Date.now();
        const todayStr = new Date().toISOString().split('T')[0];

        // Buscar sistemas priorizando os que não sincronizaram hoje e NÃO estão em erro ou sincronizando
        const { data: dbSystems, error: dbError } = await supabase
            .from('systems')
            .select('id, sid, last_sync, sync_status')
            .or(`last_sync.is.null,last_sync.lt.${todayStr}`)
            .eq('sync_status', 'IDLE') // Apenas os que não estão travados
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

        if (!dbSystems || dbSystems.length === 0) return result;

        for (const sys of dbSystems) {
            const syncRes = await this.syncSingleSystem(sys.id, sys.sid);
            if (syncRes.success) result.sucesso++;
            else {
                result.falhas++;
                if (syncRes.error === 'RATE_LIMIT') {
                    result.aborted = true;
                    break;
                }
            }
            // Delay de segurança deliberado
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        result.tempo_execucao = Math.ceil((Date.now() - startTime) / 1000);
        return result;
    }
};
