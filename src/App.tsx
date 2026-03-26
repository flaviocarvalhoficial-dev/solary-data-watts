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

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientsListView from './components/ClientsListView';
import ClientDetailView from './components/ClientDetailView';
import { NewClientModal, ImportModal, XLSImportModal } from './components/Modals';
import { MappedSystem } from './utils/xlsImporter';

import { ActiveClient, calcStats, clientStatus } from './utils/solarHelpers';
import { getProvider } from './lib/providers';

function App() {
    const { user, signOut } = useAuth();
    const { clients, loading: clientsLoading, refetch: refetchClients, create: createClient, update: updateClient, remove: removeClient } = useClients();
    const { systems, refetch: refetchSystems, upsert: upsertSystem } = useSystems();
    const { bills, create: createBill, update: updateBill } = useBills();

    const [activeTab, setActiveTab] = useState('Dashboard');
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Bill>>({});
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [newClientForm, setNewClientForm] = useState({ name: '', uc: '', platform: 'APsystems', system_id: '', investment: 0 });
    const [isSavingClient, setIsSavingClient] = useState(false);
    const [isSyncingAPI, setIsSyncingAPI] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importList, setImportList] = useState<any[]>([]);
    const [showImportModal, setShowImportModal] = useState(false);
    const [syncProgress, setSyncProgress] = useState(0);
    const [syncTotal, setSyncTotal] = useState(0);
    const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
    const [showXLSImportModal, setShowXLSImportModal] = useState(false);

    const billMap = useMemo(() => {
        const map = new Map<string, Bill>();
        bills.forEach(b => {
            const existing = map.get(b.client_id);
            if (!existing || (b.created_at ?? '') > (existing.created_at ?? '')) {
                map.set(b.client_id, b);
            }
        });
        return map;
    }, [bills]);

    const currentProvider = useMemo(() => {
        if (['APsystems', 'Sungrow', 'GoodWe'].includes(activeTab)) {
            return getProvider(activeTab);
        }
        return getProvider('APsystems'); // Fallback
    }, [activeTab]);

    const syncSystemsFromAPI = async () => {
        setIsSyncingAPI(true);
        setSyncProgress(0);
        console.log(`[SYNC STATUS] Iniciando sincronização profunda com ${currentProvider.name}...`);

        try {
            // ESPECIAL: APsystems Refatorado (Módulo 6)
            if (activeTab === 'APsystems') {
                const result = await APsystemsEnergyService.syncEnergyData();
                await logAuditEvent('SYSTEM_SYNC_BATCH', null, null, { count: result.total_processados, platform: 'APsystems' });
                alert(`Sincronização APsystems concluída!\nSucesso: ${result.sucesso}\nFalhas: ${result.falhas}\nTempo: ${result.tempo_execucao}s`);
                refetchSystems();
                setIsSyncingAPI(false);
                return;
            }

            // OUTRAS PLATAFORMAS (Legado mantido por enquanto)
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
                uc: 'PENDENTE', // Systems from XLS don't have UC yet
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);
        for (const file of Array.from(e.target.files)) {
            try {
                const parsed = await parseFaturaPDF(file);
                const client = clients.find(c => c.uc === parsed.uc);
                if (!client) { alert(`UC ${parsed.uc} não encontrada.`); continue; }
                await createBill({
                    client_id: client.id, competency: parsed.competency,
                    consumption: parsed.consumption, injected_energy: parsed.injectedEnergy,
                    total_value: parsed.totalValue, street_lighting: parsed.streetLighting,
                    confidence: parsed.confidence,
                });
                await logAuditEvent('PDF_UPLOAD', client.id, null, { competency: parsed.competency });
            } catch (err: any) { alert(`Erro: ${err.message}`); }
        }
        setIsUploading(false);
    };

    const handleExportPDF = async (ac: ActiveClient) => {
        const bill = ac.latestBill;
        if (!bill) return alert('Vincule uma fatura.');
        const s = calcStats(ac.generation, bill, ac.investment ?? 0);
        await generateClientReport('report-content', {
            clientName: ac.name, uc: ac.uc, competency: bill.competency,
            generation: `${ac.generation.toFixed(0)} kWh`,
            economy: `R$ ${s.economyValue.toFixed(2)}`,
            reduction: `${s.reductionPercent}%`,
            payback: `${s.payback} anos`,
            injected: `${bill.injected_energy} kWh`,
            totalValue: `R$ ${bill.total_value.toFixed(2)}`,
        });
    };

    const handleBatchExport = async () => {
        const valid = enrichedClients.filter(c => c.status === 'Completo' && c.latestBill);
        if (!valid.length) return alert('Nenhum sistema "Completo".');
        setIsUploading(true);
        const zip = new JSZip();
        for (const ac of valid) {
            setSelectedClientId(ac.id);
            await new Promise(r => setTimeout(r, 700));
            const bill = ac.latestBill!;
            const s = calcStats(ac.generation, bill, ac.investment ?? 0);
            const blob = await generateClientReport('report-content', {
                clientName: ac.name, uc: ac.uc, competency: bill.competency,
                generation: `${ac.generation.toFixed(0)} kWh`,
                economy: `R$ ${s.economyValue.toFixed(2)}`,
                reduction: `${s.reductionPercent}%`, payback: `${s.payback} anos`,
                injected: `${bill.injected_energy} kWh`, totalValue: `R$ ${bill.total_value.toFixed(2)}`,
            }, false);
            if (blob) zip.file(`relatorio_${ac.name.replace(/\s/g, '_')}.pdf`, blob);
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
        try {
            if (existingBill?.id) await updateBill(existingBill.id, editData);
            else await createBill({ ...editData as any, client_id: selectedClientId });
            setIsEditing(false);
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
    const selectedStats = selectedAC && selectedBill ? calcStats(selectedAC.generation, selectedBill, (selectedAC as any).investment ?? 0) : null;

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

            <Sidebar
                user={user as any} activeTab={activeTab} setActiveTab={setActiveTab}
                selectedClientId={selectedClientId} setSelectedClientId={setSelectedClientId}
                clientsCount={clients.length} incompleteCount={enrichedClients.filter(c => c.status === 'Incompleto').length}
                signOut={signOut} handleExportPDF={handleExportPDF} handleStartEdit={() => {
                    setEditData(selectedBill ? { ...selectedBill } : { client_id: selectedClientId!, competency: 'MAR/2026', total_value: 0, consumption: 0, injected_energy: 0, street_lighting: 0, confidence: 0.5 });
                    setIsEditing(true);
                }}
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
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                                <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    style={{ width: '200px', padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '13px' }} />
                            </div>
                            <button onClick={refetchClients} className="btn-icon"><RefreshCw size={18} /></button>
                            <button className="btn-icon" style={{ position: 'relative' }}>
                                <Bell size={20} />
                                {enrichedClients.filter(c => c.status === 'Incompleto').length > 0 && <div className="badge-dot" />}
                            </button>
                        </div>
                    </header>
                )}

                <div className="content-area">
                    {selectedAC ? (
                        <ClientDetailView
                            selectedAC={selectedAC} selectedBill={selectedBill} selectedStats={selectedStats}
                            isEditing={isEditing} editData={editData} setEditData={setEditData}
                            handleSaveEdit={handleSaveEdit} setIsEditing={setIsEditing}
                            handleStartEdit={() => setIsEditing(true)}
                            setSelectedClientId={setSelectedClientId}
                            handleExportPDF={handleExportPDF}
                            syncSystemsFromAPI={syncSystemsFromAPI}
                            isSyncingAPI={isSyncingAPI}
                            updateClientName={(newName) => updateClient(selectedAC.id, { name: newName })}
                        />
                    ) : activeTab === 'Dashboard' ? (
                        <DashboardView
                            clients={clients} enrichedClients={enrichedClients}
                            totalGeneration={enrichedClients.reduce((a, c) => a + (c.generation || 0), 0)}
                            totalEconomy={enrichedClients.reduce((a, c) => {
                                const bill = c.latestBill;
                                if (!bill) return a;
                                return a + calcStats(c.generation, bill, (c as any).investment ?? 0).economyValue;
                            }, 0)}
                            incompleteCount={enrichedClients.filter(c => c.status === 'Incompleto').length}
                            handleBatchExport={handleBatchExport} isUploading={isUploading}
                            setSelectedClientId={setSelectedClientId} setActiveTab={setActiveTab}
                            syncSystemsFromAPI={syncSystemsFromAPI}
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
                            isSyncingAPI={isSyncingAPI} syncSystemsFromAPI={syncSystemsFromAPI}
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
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
