import React from 'react';
import {
    Sun, LayoutDashboard, FileText, ChevronLeft,
    Download, Edit3, X, LogOut, Settings as SettingsIcon,
    ChevronDown, ChevronRight
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import WattsMascot from './WattsMascot';

interface SidebarProps {
    user: User | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    selectedClientId: string | null;
    setSelectedClientId: (id: string | null) => void;
    clientsCount: number;
    incompleteCount: number;
    signOut: () => void;
    handleExportPDF: (ac: any) => void;
    handleStartEdit: () => void;
    removeClient: (id: string) => Promise<void>;
    selectedAC: any;
    platformFilter: string;
    setPlatformFilter: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    user,
    activeTab,
    setActiveTab,
    selectedClientId,
    setSelectedClientId,
    clientsCount,
    incompleteCount,
    signOut,
    handleExportPDF,
    handleStartEdit,
    removeClient,
    selectedAC,
    platformFilter,
    setPlatformFilter
}) => {
    const [isFleetExpanded, setIsFleetExpanded] = React.useState(true);
    const userInitial = (user?.email || 'A').charAt(0).toUpperCase();
    const userName = user?.user_metadata?.full_name || user?.email || 'Admin';

    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '12px 8px', marginBottom: '24px' }}>
                <WattsMascot state="normal" size={28} />
                <h1 className="text-logo-handwritten" style={{ fontSize: '24px', lineHeight: 1, marginLeft: '2px' }}>Watts</h1>
            </div>

            {/* Navigation Groups */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
                <div className="sidebar-group-label" style={{ padding: '0 12px', marginBottom: '8px' }}>Dashboard</div>
                <nav className="sidebar-group" style={{ marginBottom: '24px' }}>
                    <a href="#" className={`sidebar-item ${activeTab === 'Dashboard' && !selectedClientId ? 'active' : ''}`}
                        onClick={e => { e.preventDefault(); setActiveTab('Dashboard'); setSelectedClientId(null); }}>
                        <LayoutDashboard size={17} />
                        <span>Overview</span>
                    </a>
                </nav>

                <div
                    onClick={() => setIsFleetExpanded(!isFleetExpanded)}
                    className="sidebar-group-label"
                    style={{ padding: '0 12px', marginBottom: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                    Gestão de Frota
                    {isFleetExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {isFleetExpanded && (
                    <nav className="sidebar-group" style={{ marginBottom: '24px' }}>
                        <a href="#" className={`sidebar-item ${activeTab === 'Fleet' && platformFilter === 'Todas' && !selectedClientId ? 'active' : ''}`}
                            onClick={e => { e.preventDefault(); setActiveTab('Fleet'); setPlatformFilter('Todas'); setSelectedClientId(null); }}>
                            <Sun size={17} />
                            <span>Visão Geral</span>
                        </a>
                        {['APsystems', 'Sungrow', 'GoodWe'].map(p => (
                            <a key={p} href="#" className={`sidebar-item ${activeTab === 'Fleet' && platformFilter === p && !selectedClientId ? 'active' : ''}`}
                                onClick={e => { e.preventDefault(); setActiveTab('Fleet'); setPlatformFilter(p); setSelectedClientId(null); }}>
                                <div style={{ width: '17px', height: '17px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>{p[0]}</div>
                                <span>{p}</span>
                            </a>
                        ))}
                    </nav>
                )}

                <div className="sidebar-group-label" style={{ padding: '0 12px', marginBottom: '8px' }}>Operacional</div>
                <nav className="sidebar-group" style={{ marginBottom: '24px' }}>
                    <a href="#" className={`sidebar-item ${activeTab === 'Bills' && !selectedClientId ? 'active' : ''}`}
                        onClick={e => { e.preventDefault(); setActiveTab('Bills'); setSelectedClientId(null); }}>
                        <FileText size={17} />
                        <span>Faturas</span>
                    </a>
                </nav>

                <div className="sidebar-group-label" style={{ padding: '0 12px', marginBottom: '8px' }}>Sistema</div>
                <nav className="sidebar-group" style={{ marginBottom: '24px' }}>
                    <a href="#" className={`sidebar-item ${activeTab === 'Settings' && !selectedClientId ? 'active' : ''}`}
                        onClick={e => { e.preventDefault(); setActiveTab('Settings'); setSelectedClientId(null); }}>
                        <SettingsIcon size={17} />
                        <span>Configurações</span>
                    </a>
                </nav>

                {selectedClientId && (
                    <>
                        <div className="sidebar-group-label" style={{ padding: '0 12px', marginTop: '12px', marginBottom: '8px' }}>Sistema Selecionado</div>
                        <nav className="sidebar-group" style={{ marginBottom: '24px' }}>
                            <a href="#" className="sidebar-item active" onClick={e => { e.preventDefault(); setSelectedClientId(null); }}>
                                <ChevronLeft size={17} />
                                <span>Voltar</span>
                            </a>
                            <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                                onClick={() => selectedAC && handleExportPDF(selectedAC)}>
                                <Download size={17} />
                                <span>Baixar PDF</span>
                            </button>
                            <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={handleStartEdit}>
                                <Edit3 size={17} />
                                <span>Editar Fatura</span>
                            </button>
                            <button className="sidebar-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: 'var(--color-status-danger-text)' }}
                                onClick={async () => { if (confirm('Remover este sistema?')) { await removeClient(selectedClientId); setSelectedClientId(null); } }}>
                                <X size={17} />
                                <span>Excluir Sistema</span>
                            </button>
                        </nav>
                    </>
                )}
            </div>

            {/* User Footer */}
            <div style={{ padding: '16px 12px', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-sidebar)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '13px', flexShrink: 0 }}>
                        {userInitial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administrador</div>
                    </div>
                    <button onClick={signOut} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
