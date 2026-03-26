import React from 'react';
import { RefreshCw, Zap, FileArchive, Plus, Download, PencilLine, FileText, ChevronRight, ExternalLink } from 'lucide-react';
import { ActiveClient } from '../utils/solarHelpers';

interface ClientsListViewProps {
    statusFilter: string;
    setStatusFilter: (filter: string) => void;
    isSyncingAPI: boolean;
    syncSystemsFromAPI: (targetId?: string, targetSid?: string) => void;
    handleFetchSystems: () => void;
    isImporting: boolean;
    handleBatchExport: () => void;
    isUploading: boolean;
    setShowNewClientModal: (show: boolean) => void;
    filteredClients: ActiveClient[];
    selectedIds: string[];
    setSelectedIds: (ids: string[] | ((prev: string[]) => string[])) => void;
    handleDeleteSelected: () => void;
    handleClearAll: () => void;
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
    currentPlatform?: string;
    setShowXLSImportModal?: (show: boolean) => void;
    updateClient?: (id: string, data: any) => void;
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
    selectedIds,
    setSelectedIds,
    handleDeleteSelected,
    handleClearAll,
    setSelectedClientId,
    handleExportPDF,
    currentPlatform,
    setShowXLSImportModal,
    updateClient
}) => {
    const allSelected = filteredClients.length > 0 && selectedIds.length === filteredClients.length;

    const handleSelectAll = () => {
        if (allSelected) setSelectedIds([]);
        else setSelectedIds(filteredClients.map(c => c.id));
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    return (
        <div style={{ padding: '0 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Todos', 'Completo', 'Divergente', 'Incompleto'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            style={{
                                padding: '6px 14px',
                                fontSize: '12px',
                                fontWeight: 500,
                                borderRadius: '999px',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                background: statusFilter === s ? 'var(--color-primary)' : 'rgba(232, 89, 60, 0.10)',
                                color: statusFilter === s ? '#FFFFFF' : 'var(--color-primary)'
                            }}>
                            {statusFilter === s && <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#FFF', borderRadius: '50%', marginRight: '6px' }} />}
                            {s}
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {currentPlatform === 'APsystems' && (
                        <a
                            href="https://apsystemsema.com/ema/logoutEMA.action"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none' }}
                        >
                            <ExternalLink size={14} /> Portal EMA
                        </a>
                    )}
                    {currentPlatform === 'Sungrow' && (
                        <a
                            href="https://br.sungrowpower.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none' }}
                        >
                            <ExternalLink size={14} /> Portal Sungrow
                        </a>
                    )}
                    {currentPlatform === 'GoodWe' && (
                        <a
                            href="https://br.goodwe.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 12px', textDecoration: 'none' }}
                        >
                            <ExternalLink size={14} /> Portal GoodWe
                        </a>
                    )}
                    <button className="btn btn-outline" style={{ fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 12px' }} onClick={() => syncSystemsFromAPI()} disabled={isSyncingAPI}>
                        <RefreshCw size={14} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sync...' : 'Energy Sync'}
                    </button>
                    {currentPlatform === 'APsystems' && setShowXLSImportModal && (
                        <button className="btn btn-outline" style={{ fontSize: '13px', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '6px 12px' }} onClick={() => setShowXLSImportModal(true)}>
                            <Plus size={14} /> Importar XLS
                        </button>
                    )}
                    <button className="btn btn-primary" style={{ background: '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px' }} onClick={() => setShowNewClientModal(true)}>
                        <Plus size={14} /> Novo Sistema
                    </button>
                </div>
            </div>

            <div className="card" style={{ overflow: 'hidden', padding: '0' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--color-bg-base)' }}>
                            <tr>
                                <th style={{ width: 44, padding: '12px 16px', textAlign: 'left' }}>
                                    <input type="checkbox" checked={allSelected} onChange={handleSelectAll} />
                                </th>
                                <th className="sidebar-group-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Cliente</th>
                                <th className="sidebar-group-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Local / UC</th>
                                <th className="sidebar-group-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Geração Total</th>
                                <th className="sidebar-group-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Hj (kWh)</th>
                                <th className="sidebar-group-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Status</th>
                                <th className="sidebar-group-label" style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>Relatório</th>
                                <th style={{ width: 80, borderBottom: '1px solid var(--color-border)' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)', fontSize: '13px' }}>Nenhum sistema encontrado para os filtros atuais.</td></tr>
                            ) : filteredClients.map(ac => (
                                <tr key={ac.id} onClick={() => setSelectedClientId(ac.id)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', backgroundColor: selectedIds.includes(ac.id) ? 'rgba(232, 89, 60, 0.05)' : 'transparent' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(ac.id)}
                                            onChange={() => toggleSelect(ac.id)}
                                            onClick={e => e.stopPropagation()}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '11px' }}>
                                                {ac.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--color-text-primary)' }}>{ac.name}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{ac.system_id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{ac.city || '—'}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>UC {ac.uc}</div>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-primary)' }}>{ac.generation > 0 ? `${ac.generation.toFixed(1)} kWh` : '—'}</td>
                                    <td style={{ padding: '12px 16px', fontSize: '13px', fontWeight: 600, color: (ac.energy_today || 0) > 0 ? 'var(--color-trend-up)' : 'var(--color-text-muted)' }}>
                                        {ac.energy_today ? `${ac.energy_today.toFixed(1)}` : '—'}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: ac.api_status === 'Normal' ? '#1E7E34' : ac.api_status === 'Atenção' ? '#D97706' : '#C0392B' }}></div>
                                            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{ac.api_status || 'Offline'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span className={`badge badge-${ac.status === 'Completo' ? 'success' : ac.status === 'Divergente' ? 'warning' : 'danger'}`}>
                                            {ac.latestBill ? ac.latestBill.competency : 'Pendente'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                        <ChevronRight size={14} color="var(--color-text-muted)" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Mostrando {filteredClients.length} sistemas</p>
                {selectedIds.length > 0 && (
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--color-status-danger-text)', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }} onClick={handleDeleteSelected}>
                        Excluir {selectedIds.length} selecionados
                    </button>
                )}
            </div>
        </div>
    );
};

export default ClientsListView;
