import React from 'react';
import { Users, Zap, TrendingUp, AlertCircle, RefreshCw, ChevronRight, FileArchive } from 'lucide-react';
import { ActiveClient } from '../utils/solarHelpers';

interface DashboardViewProps {
    clients: any[];
    enrichedClients: ActiveClient[];
    totalGeneration: number;
    totalEconomy: number;
    incompleteCount: number;
    handleBatchExport: () => void;
    isUploading: boolean;
    setSelectedClientId: (id: string | null) => void;
    setActiveTab: (tab: string) => void;
    syncSystemsFromAPI: (id?: string, sid?: string) => void;
    isSyncingAPI: boolean;
    syncProgress: number;
    syncTotal: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    clients,
    enrichedClients,
    totalGeneration,
    totalEconomy,
    incompleteCount,
    handleBatchExport,
    isUploading,
    setSelectedClientId,
    setActiveTab,
    syncSystemsFromAPI,
    isSyncingAPI,
    syncProgress,
    syncTotal
}) => {
    return (
        <div style={{ padding: '0 24px' }}>
            {/* Header com título real do VDS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Overview Dashboard</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ background: '#1A1A1A', color: '#FFF', border: 'none', borderRadius: '8px', fontSize: '13px' }} onClick={handleBatchExport}>
                        <FileArchive size={14} /> Exportar ZIP
                    </button>
                    <button className="btn btn-primary" style={{ background: 'var(--color-primary)', borderRadius: '8px', fontSize: '13px' }} onClick={() => syncSystemsFromAPI()}>
                        <RefreshCw size={14} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sincronizando...' : 'Atualizar Dados'}
                    </button>
                </div>
            </div>

            {/* KPI Grid - 3 Columns as per VDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                        Total de Sistemas
                        <span className="badge badge-outline">Monthly</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{clients.length}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Ativos em operação</div>
                    <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }} onClick={e => { e.preventDefault(); setActiveTab('Clients'); }}>See Details →</a>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                        Geração Hoje
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <span className="badge" style={{ background: 'rgba(30, 126, 52, 0.12)', color: 'var(--color-trend-up)' }}>↑ 12%</span>
                        </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        {enrichedClients.reduce((acc, curr) => acc + (curr.energy_today || 0), 0).toFixed(1)} <span style={{ fontSize: '16px', fontWeight: 400 }}>kWh</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>vs. yesterday performance</div>
                    <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Global Data →</a>
                    </div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>
                        Sistemas Pendentes
                        <span className="badge badge-danger">{incompleteCount} error</span>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{incompleteCount}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>require immediate action</div>
                    <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end' }}>
                        <a href="#" style={{ fontSize: '12px', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>Review errors →</a>
                    </div>
                </div>
            </div>

            {/* Analytics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Status da Frota em Tempo Real</h3>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <span className="badge" style={{ background: '#F0F0F0', color: '#6B6B6B', border: 'none' }}>Live Monitor</span>
                        </div>
                    </div>

                    {isSyncingAPI && syncTotal > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500, color: 'var(--color-primary)', marginBottom: '6px' }}>
                                <span>Syncing local systems with platform...</span>
                                <span>{syncProgress} / {syncTotal} ({Math.round((syncProgress / syncTotal) * 100)}%)</span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: '#F5F5F0', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ width: `${(syncProgress / syncTotal) * 100}%`, height: '100%', background: 'var(--color-primary)', transition: 'width 0.3s ease' }} />
                                {/* Emulating Coral Gradient mentioned in VDS with single color primary or gradient if possible */}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Operação Normal', count: clients.filter(c => c.api_status === 'Normal').length, css: 'success' },
                            { label: 'Sistema em Alerta', count: clients.filter(c => c.api_status === 'Atenção').length, css: 'warning' },
                            { label: 'Falha de Sistema', count: clients.filter(c => c.api_status === 'Erro').length, css: 'danger' },
                        ].map((s, idx) => (
                            <div key={idx} style={{ padding: '16px', background: 'var(--color-bg-base)', borderRadius: '10px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.count}</div>
                                <div style={{ marginTop: '8px' }}><span className={`badge badge-${s.css}`}>Real-time</span></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Status de Relatórios</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                            { label: 'Completo', count: enrichedClients.filter(c => c.status === 'Completo').length, badge: 'success' },
                            { label: 'Divergente', count: enrichedClients.filter(c => c.status === 'Divergente').length, badge: 'warning' },
                            { label: 'Incompleto', count: enrichedClients.filter(c => c.status === 'Incompleto').length, badge: 'danger' },
                        ].map(s => (
                            <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--color-bg-base)', borderRadius: '10px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 500 }}>{s.label}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: 600 }}>{s.count}</span>
                                    <span className={`badge badge-${s.badge}`}>•</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Status mensal referente a MAR/2026</p>
                    </div>
                </div>
            </div>

            {/* Recent Items */}
            <div className="card" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Sistemas Recentes</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                    {enrichedClients.slice(0, 6).map(ac => (
                        <div key={ac.id} className="sidebar-item" onClick={() => { setActiveTab('Clients'); setSelectedClientId(ac.id); }}
                            style={{ padding: '12px', background: 'var(--color-bg-base)', border: 'none', borderRadius: '10px', height: 'auto', display: 'flex' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--color-primary-muted)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px', flexShrink: 0 }}>
                                {ac.name.charAt(0)}
                            </div>
                            <div style={{ margin: '0 12px', flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{ac.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>UC {ac.uc}</div>
                            </div>
                            <ChevronRight size={14} color="var(--color-text-muted)" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
