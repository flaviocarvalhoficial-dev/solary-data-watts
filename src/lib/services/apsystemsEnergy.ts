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

    async syncSingleSystem(id: string, sid: string, tem_meter: boolean = false, force: boolean = false) {
        // Módulo 4: Lock de Recursos (Semáforo)
        const todayStr = new Date().toISOString().split('T')[0];
        const { data: current } = await supabase
            .from('systems')
            .select('last_sync, sync_status')
            .eq('id', id)
            .single();

        if (!force && current?.last_sync && current.last_sync.startsWith(todayStr)) {
            console.log(`[SYNC CACHE] Sistema ${sid} já atualizado hoje. Ignorando.`);
            return { success: true, cached: true };
        }

        // Enfileirar para processamento em background
        const { data, error } = await supabase.functions.invoke('sync-enqueue', {
            body: { system_ids: [id], platform: 'APsystems' }
        });

        if (error || !data?.success) {
            throw new Error(`Erro ao enfileirar: ${error?.message || data?.error}`);
        }

        return { success: true, is_background: true, message: 'Adicionado à fila de processamento' };
    },

    async syncEnergyData() {
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Buscar sistemas que não sincronizaram hoje
        const { data: dbSystems, error: dbError } = await supabase
            .from('systems')
            .select('id, sid')
            .or(`last_sync.is.null,last_sync.lt.${todayStr}`)
            .eq('sync_status', 'IDLE')
            .order('last_sync', { ascending: true, nullsFirst: true });

        if (dbError) throw new Error(`Erro ao buscar sistemas: ${dbError.message}`);

        if (!dbSystems || dbSystems.length === 0) {
            return { total_processados: 0, sucesso: 0, falhas: 0, already_synced: true };
        }

        const systemIds = dbSystems.map(s => s.id);

        // 2. Enfileirar no Backend
        const { data, error: enqueueError } = await supabase.functions.invoke('sync-enqueue', {
            body: { system_ids: systemIds, platform: 'APsystems' }
        });

        if (enqueueError || !data?.success) {
            throw new Error(`Erro ao enfileirar sincronização: ${enqueueError?.message || data?.error}`);
        }

        return {
            total_processados: dbSystems.length,
            sucesso: data.enqueued,
            falhas: dbSystems.length - data.enqueued,
            is_background: true
        };
    }
};
