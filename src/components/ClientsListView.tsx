import React from 'react';
import { RefreshCw, Zap, FileArchive, Plus, Download } from 'lucide-react';
import { ActiveClient } from '../App';

interface ClientsListViewProps {
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    isSyncingAPI: boolean;
    syncSystemsFromAPI: () => void;
    handleFetchSystems: () => void;
    isImporting: boolean;
    handleBatchExport: () => void;
    isUploading: boolean;
    setShowNewClientModal: (show: boolean) => void;
    filteredClients: ActiveClient[];
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
}

const ClientsListView: React.FC<ClientsListViewProps> = ({
    statusFilter,
    setStatusFilter,
    isSyncingAPI,
    syncSystemsFromAPI,
    handleFetchSystems,
    isImporting,
    handleBatchExport,
    isUploading,
    setShowNewClientModal,
    filteredClients,
    setSelectedClientId,
    handleExportPDF
}) => {
    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Todos', 'Completo', 'Divergente', 'Incompleto'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
                            style={{ padding: '6px 14px', fontSize: '13px' }}>{s}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                        <RefreshCw size={15} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sincronizando...' : 'Sincronizar Todos'}
                    </button>
                    <button className="btn btn-outline" onClick={handleFetchSystems} disabled={isImporting}>
                        <Zap size={15} color="#F59E0B" /> Importar da API
                    </button>
                    <button className="btn btn-outline" onClick={handleBatchExport} disabled={isUploading}>
                        <FileArchive size={15} /> {isUploading ? 'ZIP...' : 'Exportar ZIP'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowNewClientModal(true)}>
                        <Plus size={15} /> Novo Sistema
                    </button>
                </div>
            </div>
            <div className="table-card" style={{ overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: 36 }}><input type="checkbox" /></th>
                                <th>Cliente</th><th>Cidade / Local</th><th>Geração</th><th>Data Inst.</th><th>Status</th><th>Fatura</th><th style={{ width: 48 }}>PDF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>Nenhum sistema encontrado.</td></tr>
                            ) : filteredClients.map(ac => (
                                <tr key={ac.id} onClick={() => setSelectedClientId(ac.id)} style={{ cursor: 'pointer' }}>
                                    <td><input type="checkbox" onClick={e => e.stopPropagation()} /></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>
                                                {ac.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '14px' }}>{ac.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>{ac.system_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 500, fontSize: '13px' }}>{(ac as any).city || '—'}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>UC {ac.uc}</div>
                                    </td>
                                    <td>{ac.generation > 0 ? `${ac.generation.toFixed(0)} kWh` : 'API pendente'}</td>
                                    <td style={{ fontSize: '13px' }}>{ac.activation_date ? new Date(ac.activation_date).toLocaleDateString('pt-BR') : '—'}</td>
                                    <td>
                                        <span className={`badge badge-${(ac as any).api_status === 'Normal' ? 'cold' : (ac as any).api_status === 'Atenção' ? 'warm' : (ac as any).api_status === 'Erro' ? 'hot' : 'muted'}`} style={{ fontSize: '11px' }}>
                                            {(ac as any).api_status || 'Offline'}
                                        </span>
                                    </td>
                                    <td>{ac.latestBill ? ac.latestBill.competency : '—'}</td>
                                    <td>
                                        <button className="btn btn-outline" title="Exportar PDF" style={{ padding: '4px 8px' }} onClick={e => { e.stopPropagation(); handleExportPDF(ac); }}>
                                            <Download size={13} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ClientsListView;
