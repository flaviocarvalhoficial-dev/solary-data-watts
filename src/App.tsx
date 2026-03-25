import React, { useState, useMemo } from 'react';
import { Search, Bell, RefreshCw, FileText, Plus } from 'lucide-react';
import JSZip from 'jszip';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { useClients, Client } from './hooks/useClients';
import { useBills, Bill } from './hooks/useBills';
import { logAuditEvent } from './hooks/useAuditLog';
import { parseFaturaPDF } from './utils/pdfParser';
import { generateClientReport } from './utils/reportGenerator';

// Components
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import ClientsListView from './components/ClientsListView';
import ClientDetailView from './components/ClientDetailView';
import { NewClientModal, ImportModal } from './components/Modals';

// ── Types ──────────────────────────────────────────────────────────────────
export type ActiveClient = Client & {
    generation: number;
    latestBill: Bill | null;
    status: 'Completo' | 'Divergente' | 'Incompleto';
};

// ── Helpers ────────────────────────────────────────────────────────────────
function clientStatus(bill: Bill | null): 'Completo' | 'Divergente' | 'Incompleto' {
    if (!bill) return 'Incompleto';
    if ((bill.confidence ?? 1) < 0.8) return 'Divergente';
    return 'Completo';
}

export function calcStats(gen: number, bill: Bill, investment: number) {
    const injected = bill.injected_energy;
    const selfConsumption = Math.max(0, gen - injected);
    const totalConsumption = bill.consumption + selfConsumption;
    const tarifaMedia = bill.total_value / (bill.consumption || 1);
    const economyValue = gen * tarifaMedia;
    const reductionPercent = (economyValue / (bill.total_value + economyValue)) * 100;
    const payback = investment / (economyValue * 12 || 1);
    return {
        economyValue,
        reductionPercent: reductionPercent.toFixed(0),
        payback: payback.toFixed(1),
        totalConsumption,
    };
}

async function apsFetch(payload: { action: 'list' | 'stats' | 'details'; system_id?: string; page?: number; size?: number }) {
    const { data, error } = await supabase.functions.invoke('aps-proxy-deep-sync', {
        body: { ...payload, size: payload.size || 100 }
    });
    if (error || !data?.success) throw new Error(data?.error || 'Erro na conexão com AP-Deep-Sync');
    return data.data;
}

function App() {
    const { user, signOut } = useAuth();
    const { clients, loading: clientsLoading, refetch: refetchClients, create: createClient, update: updateClient, remove: removeClient } = useClients();
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

    const syncSystemsFromAPI = async () => {
        setIsSyncingAPI(true);
        try {
            const listResult = await apsFetch({ action: 'list', page: 1, size: 200 });
            let systems = [];
            const deepData = listResult?.data?.data || listResult?.data || listResult;
            if (Array.isArray(deepData)) systems = deepData;
            else if (deepData?.list) systems = deepData.list;
            else if (deepData?.systems) systems = deepData.systems;

            console.log(`[Deep Sync] Iniciando sincronização de ${systems.length} sistemas...`);

            for (const sys of systems) {
                const sid = sys.sid || sys.id || sys.systemId || sys.system_id;

                let details: any = null;
                try {
                    const detailRes = await apsFetch({ action: 'details', system_id: sid });
                    details = detailRes?.data?.data || detailRes?.data || detailRes;
                } catch (e) { console.warn(`[Deep Sync] Falha detalhes de ${sid}`, e); }

                let stats: any = null;
                try {
                    const statsRes = await apsFetch({ action: 'stats', system_id: sid });
                    stats = statsRes?.data?.data || statsRes?.data || statsRes;
                } catch (e) { console.warn(`[Deep Sync] Falha stats de ${sid}`, e); }

                const name = details?.username || sys.username || sys.customerAccount || sys.sname || `Usina ${sid}`;
                const city = details?.city || details?.cityName || sys.city || 'Não informada';
                const state = details?.state || details?.province || sys.state || '—';
                const systemSize = parseFloat(details?.capacity || sys.capacity || '0');
                const lastGeneration = parseFloat(stats?.energy || stats?.data?.energy || stats?.todayEnergy || sys.last_generation || '0');

                const existing = clients.find(c => c.system_id === sid);
                const metaData: any = {
                    name, city, state, country: details?.country || 'Brasil',
                    ecu_id: Array.isArray(details?.ecu) ? details.ecu[0] : (details?.ecuId || null),
                    system_size: systemSize, system_type: details?.type || 'Fotovoltaico',
                    activation_date: details?.createDate || sys.create_date || null,
                    api_status: (details?.light || sys.light) === 1 ? 'Normal' : (details?.light || sys.light) === 2 ? 'Atenção' : 'Erro',
                    last_generation: lastGeneration
                };

                if (existing) await updateClient(existing.id, metaData);
                else await createClient({ ...metaData, uc: `ATENDIMENTO_${sid}`, platform: 'APsystems', system_id: sid, investment: 0 });
            }

            await logAuditEvent('SYSTEM_SYNC_BATCH', null, null, { systems_processed: systems.length });
            alert(`Deep Sync concluído!`);
            refetchClients();
        } catch (err: any) { alert(`Erro no Sync Engine: ${err.message}`); }
        setIsSyncingAPI(false);
    };

    const handleFetchSystems = async () => {
        setIsImporting(true);
        try {
            const result = await apsFetch({ action: 'list' });
            let systems = [];
            if (Array.isArray(result)) systems = result;
            else if (result?.list) systems = result.list;
            else if (result?.data?.list) systems = result.data.list;
            else if (result?.data?.systems) systems = result.data.systems;
            setImportList(systems);
            setShowImportModal(true);
        } catch (err: any) { alert(`Erro: ${err.message}`); }
        setIsImporting(false);
    };

    const handleImportSystem = async (sys: any) => {
        const id = sys.sid || sys.id || sys.systemId || sys.system_id;
        const name = sys.sname || sys.name || sys.customerAccount || `Usina ${id}`;

        if (clients.some(c => c.system_id === id)) return alert(`Já cadastrado.`);

        try {
            await createClient({ name, uc: `TEMP_${id}`, platform: 'APsystems', system_id: id, investment: 0 });
            alert(`Importado!`);
            setImportList(prev => prev.filter(s => (s.sid || s.id || s.systemId) !== id));
            refetchClients();
        } catch (err: any) { alert(`Erro: ${err.message}`); }
    };

    const enrichedClients = useMemo(() =>
        clients.map(c => {
            const bill = billMap.get(c.id) || null;
            return {
                ...c,
                generation: (c as any).last_generation || 0,
                latestBill: bill,
                status: clientStatus(bill),
            } as ActiveClient;
        }), [clients, billMap]);

    const filteredClients = useMemo(() =>
        enrichedClients.filter(c => {
            const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.uc.includes(searchTerm);
            const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
            return matchSearch && matchStatus;
        }), [enrichedClients, searchTerm, statusFilter]);

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

            <ImportModal show={showImportModal} setShow={setShowImportModal} list={importList} onImport={handleImportSystem} />

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
                        <h2 className="text-page-title">{activeTab === 'Dashboard' ? 'Dashboard' : activeTab === 'Clients' ? 'Sistemas Ativos' : 'Central de Faturas'}</h2>
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
                            filteredClients={filteredClients} setSelectedClientId={setSelectedClientId}
                            handleExportPDF={handleExportPDF}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
