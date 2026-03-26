import React, { useState, useMemo } from 'react';
import { Search, Bell, RefreshCw, FileText, Plus } from 'lucide-react';
import JSZip from 'jszip';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { APsystemsEnergyService } from './lib/services/apsystemsEnergy';
import { useClients, Client } from './hooks/useClients';
import { useSystems, System } from './hooks/useSystems';
import { useBills, Bill } from './hooks/useBills';
import { logAuditEvent } from './hooks/useAuditLog';
import { parseFaturaPDF } from './utils/pdfParser';
import { generateClientReport } from './utils/reportGenerator';

import ExecutiveReport from './components/ExecutiveReport';
import SettingsView from './components/SettingsView';

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientsListView from './components/ClientsListView';
import ClientDetailView from './components/ClientDetailView';
import { NewClientModal, ImportModal, XLSImportModal } from './components/Modals';
import { MappedSystem } from './utils/xlsImporter';

import { ActiveClient, calculateFinalReport, clientStatus } from './utils/solarHelpers';
import { getProvider } from './lib/providers';

function App() {
    const { user, signOut } = useAuth();
    const { clients, loading: clientsLoading, refetch: refetchClients, create: createClient, update: updateClient, remove: removeClient } = useClients();
    const { systems, refetch: refetchSystems, upsert: upsertSystem, update: updateSystem } = useSystems();
    const { bills, create: createBill, update: updateBill, resetForClient } = useBills();

    const handleUpdateClientOrSystem = async (id: string, data: any) => {
        try {
            if (clients.some(c => c.id === id)) {
                await updateClient(id, data);
            } else {
                // Mapear 'uc' para o campo 'account' na tabela systems (usado como fallback de UC)
                const mappedData = { ...data };
                if (mappedData.uc) {
                    mappedData.account = mappedData.uc;
                    delete mappedData.uc;
                }
                await updateSystem(id, mappedData);
            }
        } catch (err: any) {
            alert(`Erro ao salvar alteração: ${err.message}`);
        }
    };

    const [activeTab, setActiveTab] = useState('Dashboard');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [branding, setBranding] = useState({
        company_name: 'Solary Data',
        primary_color: '#E8593C',
        secondary_color: '#1A1A1A',
        logo_url: '',
        report_footer: 'Este relatório executivo foi gerado pelo sistema Solary Data • Veselty Engine.'
    });

    // Load Branding
    React.useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`solary_branding_${user.id}`);
            if (saved) setBranding(JSON.parse(saved));
        }
    }, [user]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Bill>>({});
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', uc: '', platform: 'APsystems', system_id: '', investment: 0, current_kwh_value: 0.95 });
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [isSyncingAPI, setIsSyncingAPI] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importList, setImportList] = useState<any[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncTotal, setSyncTotal] = useState(0);
    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [showXLSImportModal, setShowXLSImportModal] = useState(false);
    const availableCompetencies = useMemo(() => {
        const set = new Set<string>();
        bills.forEach(b => {
            if (b.competency) set.add(b.competency);
        });
        return Array.from(set).sort().reverse();
    }, [bills]);

    const [selectedCompetency, setSelectedCompetency] = useState<string>('');

    // Update selectedCompetency when bills are loaded for the first time
    React.useEffect(() => {
        if (!selectedCompetency && availableCompetencies.length > 0) {
            setSelectedCompetency(availableCompetencies[0]);
        }
    }, [availableCompetencies]);

    const billMap = useMemo(() => {
        const map = new Map<string, Bill>();
        // Filter bills by selectedCompetency
        const filteredBills = bills.filter(b => b.competency === selectedCompetency);

        filteredBills.forEach(b => {
            const existing = map.get(b.client_id);
            if (!existing || (b.created_at ?? '') > (existing.created_at ?? '')) {
                map.set(b.client_id, b);
            }
        });
        return map;
    }, [bills, selectedCompetency]);

    const currentProvider = useMemo(() => {
        if (['APsystems', 'Sungrow', 'GoodWe'].includes(activeTab)) {
            return getProvider(activeTab);
        }
        return getProvider('APsystems'); // Fallback
    }, [activeTab]);

    const syncSystemsFromAPI = async (targetId?: string, targetSid?: string) => {
        setIsSyncingAPI(true);
        setSyncProgress(0);
        console.log(`[SYNC STATUS] Iniciando sincronização controlada com ${currentProvider.name}...`);

        try {
            // MODO NOVO: APsystems Refatorado (Módulo 6: Batch 5 ou Individual)
            if (activeTab === 'APsystems') {
                if (targetId && targetSid) {
                    // Modo Individual (Forçado pelo clique - bypass cache)
                    const currentSystem = systems.find(s => s.sid === targetSid);
                    const res = await APsystemsEnergyService.syncSingleSystem(targetId, targetSid, currentSystem?.tem_meter === true, true);

                    if (res.success) {
                        await logAuditEvent('SYSTEM_SYNC_INDIVIDUAL', targetId, null, { sid: targetSid, platform: 'APsystems' });
                        alert(`Sincronização do sistema ${targetSid} concluída!`);
                    } else {
                        alert(`Erro ao sincronizar ${targetSid}: ${res.message}`);
                    }
                } else {
                    // Modo Lote (Módulo 6: Máximo 5 por vez)
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
                        alert(`Lote concluído com sucesso (Máx 5).\nSistemas atualizados: ${result.sucesso}\nFalhas: ${result.falhas}\nTempo: ${result.tempo_execucao}s`);
                    }
                }

                refetchSystems();
                setIsSyncingAPI(false);
                return;
            }

            // OUTRAS PLATAFORMAS (Legado mantido com controle básico)
            const systemsResult = await currentProvider.importSystems();
            // ... resto do código legado se necessário, mas APsystems é o foco.

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
            refetchClients();
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
            setShowImportModal(true);
        } catch (err: any) { alert(`Erro: ${err.message}`); }
        setIsImporting(false);
    };

    const handleImportSystem = async (sys: any) => {
        const id = sys.sid || sys.id || sys.systemId || sys.system_id;

        const metadata = currentProvider.mapResponseToMetadata(null, null, sys);
        const name = metadata.name || `Usina ${id}`;
        const city = metadata.city || 'Cidade não inf.';

        if (clients.some(c => c.system_id === id)) return alert(`Já cadastrado.`);

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
            refetchClients();
        } catch (err: any) { alert(`Erro: ${err.message}`); }
    };

    const handleImportAll = async () => {
        const toImport = importList.filter(s => {
            const id = s.sid || s.id || s.systemId || s.system_id;
            return !clients.some(c => c.system_id === id);
        });

        if (toImport.length === 0) return alert('Nenhum novo sistema para importar.');
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
        setShowImportModal(false);
        alert(`${toImport.length} sistemas importados com sucesso!`);
        refetchClients();
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
        setShowXLSImportModal(false);
        alert(`${success} sistemas processados via XLS com sucesso!`);
        refetchSystems();
    };

    const enrichedClients = useMemo(() => {
        const platformClients = clients.map(c => {
            const bill = billMap.get(c.id) || null;
            return {
                ...c,
                generation: (c as any).last_generation || 0,
                latestBill: bill,
                status: clientStatus(bill),
            } as ActiveClient;
        });

        const appSystemsOnly = systems.map(s => {
            return {
                id: s.id,
                name: s.cliente,
                uc: s.account || 'PENDENTE',
                platform: 'APsystems',
                system_id: s.sid,
                city: s.cidade || '—',
                state: s.estado || '—',
                country: s.pais || '—',
                system_size: s.potencia_kwp || 0,
                activation_date: s.data_instalacao,
                api_status: s.status === 'normal' ? 'Normal' : s.status === 'alerta' ? 'Atenção' : 'Erro',
                generation: 0,
                latestBill: null,
                status: 'Incompleto',
                source: s.fonte || 'apsystems_xls',
            } as any as ActiveClient;
        });

        // Mix clients from clients table + the new systems table
        // Filter out those from systems table that might already exist in clients by system_id
        const filteredSystems = appSystemsOnly.filter(s => !platformClients.some(pc => pc.system_id === s.system_id));

        return [...platformClients, ...filteredSystems];
    }, [clients, systems, billMap]);

    const filteredClients = useMemo(() =>
        enrichedClients.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.uc.includes(searchTerm);
            const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;

            // Filtro por plataforma se estiver em uma aba de plataforma
            if (['APsystems', 'Sungrow', 'GoodWe'].includes(activeTab)) {
                if (c.platform !== activeTab) return false;
            }

            return matchSearch && matchStatus;
        }), [enrichedClients, searchTerm, statusFilter, activeTab]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetClientId?: string) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        const files = Array.from(e.target.files);

        for (const file of files) {
            try {
                // 1. Parse PDF para obter dados (Competência, UC, etc)
                const parsed = await parseFaturaPDF(file);

                let client: any = null;

                if (targetClientId) {
                    // MODO INDIVIDUAL: Forçamos o cliente selecionado
                    client = clients.find(c => c.id === targetClientId) || systems.find(s => s.id === targetClientId);
                } else {
                    // MODO LOTE: Busca automática por UC (Fuzzy Match)
                    const normalizeUC = (val: string) => val.replace(/\D/g, '').replace(/^0+/, '');
                    const targetUC = normalizeUC(parsed.uc);

                    client = clients.find(c => {
                        const dbUC = normalizeUC(c.uc);
                        return dbUC === targetUC || dbUC.endsWith(targetUC) || targetUC.endsWith(dbUC);
                    });

                    if (!client) {
                        // Se não achar no clients, tenta no discovery (systems table)
                        client = systems.find(s => {
                            const dbUC = normalizeUC(s.account || '');
                            return dbUC === targetUC || (dbUC.length > 5 && (dbUC.endsWith(targetUC) || targetUC.endsWith(dbUC)));
                        });
                    }
                }

                if (!client) {
                    alert(`UC ${parsed.uc} encontrada no PDF (${file.name}), mas não há nenhum cliente ou sistema cadastrado com esse número.\n\nVerifique o cadastro.`);
                    continue;
                }

                // 1.5 AUTO-IMPORT: Se o "cliente" for na verdade apenas um "sistema" do XLS (Discovery), importamos agora
                const isAlreadyRegistered = clients.some(c => c.id === client.id);
                let finalClientId = client.id;

                if (!isAlreadyRegistered) {
                    try {
                        const newClient = await createClient({
                            name: client.cliente || `Usina ${client.sid}`,
                            uc: parsed.uc || client.account || 'PENDENTE',
                            platform: 'APsystems',
                            system_id: client.sid,
                            city: client.cidade || '—',
                            investment: 0
                        });
                        finalClientId = newClient.id;
                        if (selectedClientId === client.id) {
                            setSelectedClientId(newClient.id);
                        }
                        await logAuditEvent('SYSTEM_IMPORT', newClient.id, null, { reason: 'PDF_UPLOAD_AUTO_LINK', original_sys_id: client.id });
                    } catch (importErr: any) {
                        alert(`Erro auto-import: ${importErr.message}`);
                        continue;
                    }
                }

                // 2. Subir para Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${finalClientId}_${parsed.competency.replace('/', '_')}_${Date.now()}.${fileExt}`;
                const filePath = `${user?.id}/${fileName}`;
                const { data: uploadData } = await supabase.storage.from('bills').upload(filePath, file);

                // 3. Criar registro no banco
                await createBill({
                    client_id: finalClientId, // USAR O ID DO CLIENTE FINAL (SALVO NO BANCO)
                    competency: parsed.competency,
                    consumption: parsed.gridConsumption,
                    compensated_energy: parsed.compensatedEnergy,
                    credit_balance: parsed.creditBalance,
                    injected_energy: parsed.injectedEnergy,
                    total_value: parsed.totalValue,
                    street_lighting: parsed.streetLighting,
                    tariff_kwh: parsed.tariffKwh,
                    confidence: parsed.confidence,
                    storage_path: uploadData?.path || null
                });

                await logAuditEvent('PDF_UPLOAD', finalClientId, null, { competency: parsed.competency, mode: targetClientId ? 'Individual' : 'Auto' });
            } catch (err: any) {
                alert(`Erro ao processar ${file.name}: ${err.message}`);
            }
        }
        setIsUploading(false);
        refetchClients(); // Para ver o status mudar para Completo/Divergente
    };

    const handleExportPDF = async (ac: ActiveClient) => {
        const bill = ac.latestBill;
        if (!bill) return alert('Vincule uma fatura.');

        const reportData = calculateFinalReport(ac, bill, ac.generation);

        // Pequeno delay p/ garantir renderização do template oculto
        await new Promise(r => setTimeout(r, 100));

        await generateClientReport('executive-report-template', reportData);
    };

    const handleBatchExport = async () => {
        const valid = enrichedClients.filter(c => c.status === 'Completo' && c.latestBill);
        if (!valid.length) return alert('Nenhum sistema "Completo".');
        setIsUploading(true);
        const zip = new JSZip();
        for (const ac of valid) {
            setSelectedClientId(ac.id);
            const bill = ac.latestBill!;

            // Sync rendering delay
            await new Promise(r => setTimeout(r, 200));

            const reportData = calculateFinalReport(ac, bill, ac.generation);
            const blob = await generateClientReport('executive-report-template', reportData, false);

            if (blob) {
                zip.file(`relatorio_${ac.name.replace(/\s/g, '_')}_${bill.competency.replace(/\//g, '-')}.pdf`, blob);
            }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(zipBlob);
        a.download = `relatorios.zip`; a.click();
        setIsUploading(false);
        setSelectedClientId(null);
    };

    const handleSaveEdit = async () => {
        if (!selectedClientId) return;
        const ac = enrichedClients.find(c => c.id === selectedClientId)!;
        const existingBill = ac.latestBill;

        // Extrair geração se foi alterada manualmente (Cáculo Manual)
        const { generation, ...billData } = editData as any;

        try {
            // 1. Salvar Fatura
            if (existingBill?.id) await updateBill(existingBill.id, billData);
            else await createBill({ ...billData, client_id: selectedClientId });

            // 2. Se a geração foi alterada manualmente, atualizar o cliente (Modo Fallback/Manual)
            if (generation !== undefined && generation !== ac.generation) {
                await updateClient(selectedClientId, { last_generation: generation });
                await logAuditEvent('MANUAL_EDIT', selectedClientId, { oldGen: ac.generation }, { newGen: generation });
            }

            setIsEditing(false);
            refetchClients();
            alert("Dados salvos com sucesso!");
        } catch (err: any) { alert(`Erro: ${err.message}`); }
    };

    const handleDeleteSelected = async () => {
        if (!selectedClientIds.length) return;
        if (!confirm(`Deseja excluir os ${selectedClientIds.length} sistemas selecionados?`)) return;
        try {
            for (const id of selectedClientIds) {
                await removeClient(id);
            }
            setSelectedClientIds([]);
            refetchClients();
            alert("Sistemas excluídos com sucesso.");
        } catch (err: any) { alert(`Erro ao excluir: ${err.message}`); }
    };

    const handleResetClientData = async (clientId: string) => {
        if (!confirm('Deseja RESETAR todos os dados (Faturas/Geração) deste cliente? \n\nIsso removerá as associações de PDF e lançamentos manuais, voltando o sistema ao estado inicial.')) return;
        try {
            setIsSyncingAPI(true);
            await resetForClient(clientId);
            await refetchClients();
            setSelectedClientId(null);
            alert('Dados resetados com sucesso.');
        } catch (err: any) {
            alert(`Erro ao resetar: ${err.message}`);
        } finally {
            setIsSyncingAPI(false);
        }
    };

    const handleClearAll = async () => {
        if (!clients.length) return;
        if (!confirm("⚠️ ATENÇÃO: Deseja excluir TODOS os sistemas do seu banco de dados? Esta ação não pode ser desfeita.")) return;
        try {
            for (const c of clients) {
                await removeClient(c.id);
            }
            setSelectedClientIds([]);
            refetchClients();
            alert("Base de dados limpa.");
        } catch (err: any) { alert(`Erro ao limpar: ${err.message}`); }
    };

    const selectedAC = enrichedClients.find(c => c.id === selectedClientId) ?? null;
    const selectedBill = selectedAC?.latestBill ?? null;
    const selectedReport = selectedAC && selectedBill ? calculateFinalReport(selectedAC, selectedBill, selectedAC.generation) : null;

    const triggerStartEdit = () => {
        if (!selectedClientId) return;
        setEditData(selectedBill ? { ...selectedBill } : {
            client_id: selectedClientId,
            competency: (selectedBill as any)?.competency || 'MAR/2026',
            total_value: (selectedBill as any)?.total_value || 0,
            consumption: (selectedBill as any)?.consumption || 0,
            compensated_energy: (selectedBill as any)?.compensated_energy || 0,
            credit_balance: (selectedBill as any)?.credit_balance || 0,
            injected_energy: (selectedBill as any)?.injected_energy || 0,
            tariff_kwh: (selectedBill as any)?.tariff_kwh || 0.95,
            street_lighting: (selectedBill as any)?.street_lighting || 0,
            confidence: 0.5
        });
        setIsEditing(true);
    };

    return (
        <div className="app-shell">
            <NewClientModal show={showNewClientModal} setShow={setShowNewClientModal} onSubmit={async (e) => {
                e.preventDefault(); setIsSavingClient(true);
                try { await createClient(newClientForm as any); setShowNewClientModal(false); } catch (err: any) { alert(err.message); }
                setIsSavingClient(false);
            }} form={newClientForm} setForm={setNewClientForm} loading={isSavingClient} />

            <ImportModal show={showImportModal} setShow={setShowImportModal} list={importList} onImport={handleImportSystem} onImportAll={handleImportAll} />

            <XLSImportModal
                show={showXLSImportModal}
                setShow={setShowXLSImportModal}
                existingSids={systems.map(s => s.sid)}
                onImportComplete={handleXLSImportComplete}
            />

            {/* Hidden Executive Report Template for PDF Capture */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', pointerEvents: 'none' }}>
                {selectedReport && <ExecutiveReport data={selectedReport} branding={branding} />}
            </div>

            <Sidebar
                user={user as any} activeTab={activeTab} setActiveTab={setActiveTab}
                selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId}
                clientsCount={clients.length} incompleteCount={enrichedClients.filter(c => c.status === 'Incompleto').length}
                signOut={signOut} handleExportPDF={handleExportPDF} handleStartEdit={triggerStartEdit}
                removeClient={removeClient}
                selectedAC={selectedAC}
            />

            <main className="main-content">
                {!selectedClientId && (
                    <header className="topbar">
                        <h2 className="text-page-title">
                            {activeTab === 'Dashboard' ? 'Dashboard' :
                                activeTab === 'Bills' ? 'Central de Faturas' :
                                    `Sistemas ${activeTab}`}
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '200px', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }}
                                />
                            </div>

                            {/* Competency Filter */}
                            {availableCompetencies.length > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-sidebar)', padding: '5px 12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Período</span>
                                    <select
                                        value={selectedCompetency}
                                        onChange={(e) => setSelectedCompetency(e.target.value)}
                                        style={{ border: 'none', background: 'none', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', cursor: 'pointer', outline: 'none' }}
                                    >
                                        {availableCompetencies.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Global Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button onClick={refetchClients} className="btn-icon"><RefreshCw size={18} /></button>
                                <button className="btn-icon" style={{ position: 'relative' }}>
                                    <Bell size={20} />
                                    {enrichedClients.filter(c => c.status === 'Incompleto').length > 0 && <div className="badge-dot" />}
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                <div className="content-area">
                    {selectedAC ? (
                        <ClientDetailView
                            selectedAC={selectedAC} selectedBill={selectedBill} selectedStats={selectedReport}
                            isEditing={isEditing} editData={editData} setEditData={setEditData}
                            handleSaveEdit={handleSaveEdit} setIsEditing={setIsEditing}
                            handleStartEdit={triggerStartEdit}
                            setSelectedClientId={setSelectedClientId}
                            handleExportPDF={handleExportPDF}
                            syncSystemsFromAPI={() => syncSystemsFromAPI(selectedAC.id, selectedAC.system_id)}
                            isSyncingAPI={isSyncingAPI}
                            updateClientName={(newName) => updateClient(selectedAC.id, { name: newName })}
                            handleFileUpload={(e) => handleFileUpload(e, selectedAC.id)}
                            isUploading={isUploading}
                            branding={branding}
                            handleResetData={handleResetClientData}
                            selectedCompetency={selectedCompetency}
                            setSelectedCompetency={setSelectedCompetency}
                            availableCompetencies={availableCompetencies}
                            clientBills={bills.filter(b => b.client_id === selectedAC.id)}
                        />
                    ) : activeTab === 'Settings' ? (
                        <SettingsView user={user} branding={branding} setBranding={setBranding} />
                    ) : activeTab === 'Dashboard' ? (
                        <DashboardView
                            clients={clients} enrichedClients={enrichedClients}
                            totalGeneration={enrichedClients.reduce((a, c) => a + (c.generation || 0), 0)}
                            totalEconomy={enrichedClients.reduce((a, c) => {
                                const bill = c.latestBill;
                                if (!bill) return a;
                                return a + calculateFinalReport(c, bill, c.generation).resultado.economia_mensal;
                            }, 0)}
                            incompleteCount={enrichedClients.filter(c => c.status === 'Incompleto').length}
                            handleBatchExport={handleBatchExport} isUploading={isUploading}
                            setSelectedClientId={setSelectedClientId} setActiveTab={setActiveTab}
                            syncSystemsFromAPI={() => syncSystemsFromAPI()}
                            isSyncingAPI={isSyncingAPI}
                            syncProgress={syncProgress}
                            syncTotal={syncTotal}
                        />
                    ) : activeTab === 'Bills' ? (
                        <div className="empty-state">
                            <div className="empty-icon"><FileText size={28} color="#6366F1" /></div>
                            <h3>Envio Automático de Faturas</h3>
                            <p>O sistema identifica a UC automaticamente e vincula ao sistema correspondente.</p>
                            <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                                <Plus size={16} /> {isUploading ? 'Processando...' : 'Selecionar Faturas PDF'}
                                <input type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        </div>
                    ) : (
                        <ClientsListView
                            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
                            isSyncingAPI={isSyncingAPI} syncSystemsFromAPI={(id, sid) => syncSystemsFromAPI(id, sid)}
                            handleFetchSystems={handleFetchSystems} isImporting={isImporting}
                            handleBatchExport={handleBatchExport} isUploading={isUploading}
                            setShowNewClientModal={setShowNewClientModal}
                            filteredClients={filteredClients}
                            selectedIds={selectedClientIds}
                            setSelectedIds={setSelectedClientIds}
                            handleDeleteSelected={handleDeleteSelected}
                            handleClearAll={handleClearAll}
                            setSelectedClientId={setSelectedClientId}
                            handleExportPDF={handleExportPDF}
                            currentPlatform={['APsystems', 'Sungrow', 'GoodWe'].includes(activeTab) ? (activeTab as any) : undefined}
                            setShowXLSImportModal={setShowXLSImportModal}
                            updateClient={handleUpdateClientOrSystem}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
