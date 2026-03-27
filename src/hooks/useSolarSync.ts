import { useState } from 'react';
import { APsystemsEnergyService } from '../lib/services/apsystemsEnergy';
import { logAuditEvent } from './useAuditLog';
import { Client } from './useClients';
import { System } from './useSystems';
import { getProvider } from '../lib/providers';
import { MappedSystem } from '../utils/xlsImporter';

interface UseSolarSyncProps {
    activeTab: string;
    clients: Client[];
    systems: System[];
    createClient: (input: any) => Promise<any>;
    updateClient: (id: string, data: any) => Promise<any>;
    upsertSystem: (data: any) => Promise<any>;
    refetchClients: () => Promise<void>;
    refetchSystems: () => Promise<void>;
}

export function useSolarSync({
    activeTab,
    clients,
    systems,
    createClient,
    updateClient,
    upsertSystem,
    refetchClients,
    refetchSystems
}: UseSolarSyncProps) {
    const [isSyncingAPI, setIsSyncingAPI] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importList, setImportList] = useState<any[]>([]);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncTotal, setSyncTotal] = useState(0);

    const currentProvider = getProvider(['APsystems', 'Sungrow', 'GoodWe'].includes(activeTab) ? activeTab : 'APsystems');

    const syncSystemsFromAPI = async (targetId?: string, targetSid?: string) => {
        setIsSyncingAPI(true);
        setSyncProgress(0);
        console.log(`[SYNC STATUS] Iniciando sincronização controlada com ${currentProvider.name}...`);

        try {
            // MODO NOVO: Sincronização profunda (Módulo 6) com suporte em todas as telas
            // Se for um sistema individual, verificamos se é APsystems
            const isIndividualAPsystems = targetId && (
                clients.find(c => c.id === targetId)?.platform === 'APsystems' ||
                systems.find(s => s.id === targetId)?.fonte?.includes('apsystems')
            );

            // Se for batch sync nas telas principais ou individual no APsystems, usamos o service especializado
            // Se o batch sync for acionado em uma dessas telas
            if (['APsystems', 'Painel', 'Frota', 'Faturas'].includes(activeTab) || isIndividualAPsystems) {
                if (targetId && targetSid) {
                    const currentSystem = systems.find(s => s.sid === targetSid);
                    // Se não for APsystems, avisamos que ainda não tem suporte profundo
                    if (!isIndividualAPsystems) {
                        alert(`Sincronização individual ainda indisponível para esta plataforma.`);
                        setIsSyncingAPI(false);
                        return;
                    }

                    const res = await APsystemsEnergyService.syncSingleSystem(targetId, targetSid, currentSystem?.tem_meter === true, true);

                    if (res.success) {
                        await logAuditEvent('SYSTEM_SYNC_INDIVIDUAL', targetId, null, { sid: targetSid, platform: 'APsystems' });
                        alert(`Sincronização do sistema ${targetSid} concluída!`);
                    } else {
                        alert(`Erro ao sincronizar ${targetSid}: ${res.message}`);
                    }
                } else {
                    // Batch sync (Módulo 6) - Máximo 5 por vez respeitando rate limit
                    const result = await APsystemsEnergyService.syncEnergyData();
                    await logAuditEvent('SYSTEM_SYNC_BATCH', null, null, {
                        count: result.sucesso,
                        platform: 'APsystems',
                        total: result.total_processados,
                        aborted: result.aborted
                    });

                    if (result.aborted) {
                        alert(`Alerta: Limite excedido (Erro 2005).\nO sistema parou para evitar bloqueios.\nSistemas atualizados agora: ${result.sucesso}`);
                    } else if (result.total_processados === 0) {
                        alert(`Todos os sistemas já foram sincronizados hoje.\nNenhuma nova tentativa necessária agora.`);
                    } else {
                        alert(`Lote de sistemas atualizado com sucesso!\nSincronizados: ${result.sucesso}\nFalhas: ${result.falhas}\nTempo: ${result.tempo_execucao}s`);
                    }
                }

                await refetchSystems();
                await refetchClients();
                setIsSyncingAPI(false);
                return;
            }

            // Fallback: Modo legado para outras plataformas (Sungrow, GoodWe)
            const systemsResult = await currentProvider.importSystems();

            if (systemsResult.length === 0) {
                console.warn(`[Deep Sync] Nenhum sistema encontrado para ${currentProvider.name}.`);
                setIsSyncingAPI(false);
                return;
            }

            setSyncTotal(systemsResult.length);
            let count = 0;
            for (const sys of systemsResult) {
                count++;
                setSyncProgress(count);

                const sid = (sys?.sid || sys?.id || sys?.systemId || sys?.system_id || '').toString();
                const ecuId = (sys?.ecuId || sys?.ecu?.[0] || sys?.ecu_id || '').toString();

                if (!sid) continue;

                let details: any = null;
                try { details = await currentProvider.getSystemDetails(sid, ecuId); } catch (e) { }

                let stats: any = null;
                try {
                    if ((currentProvider as any).getSystemStats) {
                        stats = await (currentProvider as any).getSystemStats(sid);
                    }
                } catch (e) { }

                const existing = (clients || []).find(c => c?.system_id === sid);
                const metadata = currentProvider.mapResponseToMetadata(details, stats?.data, sys, existing?.city);

                if (existing) await updateClient(existing.id, metadata);
                else await createClient({ ...metadata as any, uc: `ID_${sid}`, platform: currentProvider.platform, system_id: sid, investment: 0 });
            }

            await logAuditEvent('SYSTEM_SYNC_BATCH', null, null, { count: systemsResult.length, platform: currentProvider.platform });
            alert(`Sincronização de ${systemsResult.length} sistemas (${currentProvider.name}) concluída!`);
            await refetchClients();
        } catch (err: any) {
            console.error("[SYNC STATUS] Erro crítico:", err.message);
            alert(`Erro no Sync Engine: ${err.message}`);
        } finally {
            setIsSyncingAPI(false);
            setSyncProgress(0);
        }
    };

    const handleFetchSystems = async () => {
        setIsImporting(true);
        try {
            const systems = await currentProvider.importSystems();
            setImportList(systems);
            return systems;
        } catch (err: any) { alert(`Erro: ${err.message}`); }
        setIsImporting(false);
    };

    const handleImportSystem = async (sys: any) => {
        const id = sys.sid || sys.id || sys.systemId || sys.system_id;
        const metadata = currentProvider.mapResponseToMetadata(null, null, sys);
        const name = metadata.name || `Usina ${id}`;
        const city = metadata.city || 'Cidade não inf.';

        if (clients.some(c => c.system_id === id)) {
            alert(`Já cadastrado.`);
            return;
        }

        try {
            await createClient({
                ...metadata as any,
                name,
                city,
                uc: `PENDENTE_${id}`,
                platform: currentProvider.platform,
                system_id: id,
                investment: 0
            });
            setImportList(prev => prev.filter(s => (s.sid || s.id || s.systemId || s.system_id) !== id));
            await refetchClients();
        } catch (err: any) { alert(`Erro: ${err.message}`); }
    };

    const handleImportAll = async () => {
        const toImport = importList.filter(s => {
            const id = s.sid || s.id || s.systemId || s.system_id;
            return !clients.some(c => c.system_id === id);
        });

        if (toImport.length === 0) {
            alert('Nenhum novo sistema para importar.');
            return;
        }
        if (!confirm(`Deseja importar todos os ${toImport.length} sistemas encontrados?`)) return;

        setIsSyncingAPI(true);
        setSyncTotal(toImport.length);
        let count = 0;

        for (const sys of toImport) {
            count++;
            setSyncProgress(count);
            const id = sys.sid || sys.id || sys.systemId || sys.system_id;
            const metadata = currentProvider.mapResponseToMetadata(null, null, sys);
            const name = metadata.name || `Usina ${id}`;
            const city = metadata.city || 'Cidade não inf.';

            try {
                await createClient({
                    ...metadata as any,
                    name,
                    city,
                    uc: `PENDENTE_${id}`,
                    platform: currentProvider.platform,
                    system_id: id,
                    investment: 0
                });
            } catch (e) { console.error(`Falha ao importar ${id}`, e); }
        }

        setIsSyncingAPI(false);
        setSyncProgress(0);
        alert(`${toImport.length} sistemas importados com sucesso!`);
        await refetchClients();
    };

    const handleXLSImportComplete = async (incomingSystems: MappedSystem[]) => {
        setIsSyncingAPI(true);
        setSyncTotal(incomingSystems.length);
        let count = 0;
        let success = 0;

        for (const sys of incomingSystems) {
            count++;
            setSyncProgress(count);

            const systemData = {
                sid: sys.sid,
                cliente: sys.cliente,
                account: sys.account,
                cidade: sys.cidade,
                estado: sys.estado,
                pais: sys.pais,
                potencia_kwp: sys.potencia_kwp,
                tipo: sys.tipo,
                tem_meter: sys.tem_meter,
                data_instalacao: sys.data_instalacao,
                status: sys.status,
                fonte: sys.fonte,
            };

            try {
                await upsertSystem(systemData);
                success++;
            } catch (err) {
                console.error(`Falha ao importar sistema XLS ${sys.sid}:`, err);
            }
        }

        setIsSyncingAPI(false);
        setSyncProgress(0);
        alert(`${success} sistemas processados via XLS com sucesso!`);
        await refetchSystems();
    };

    return {
        isSyncingAPI,
        isImporting,
        importList,
        setImportList,
        syncProgress,
        syncTotal,
        syncSystemsFromAPI,
        handleFetchSystems,
        handleImportSystem,
        handleImportAll,
        handleXLSImportComplete
    };
}
