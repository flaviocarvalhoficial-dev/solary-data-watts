import React from 'react';
import {
    Sun, LayoutDashboard, FileText, ChevronLeft,
    Download, Edit3, X, LogOut, Settings as SettingsIcon
} from 'lucide-react';
import { User } from '@supabase/supabase-js';

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
    selectedAC
}) => {
    const userInitial = (user?.email || 'A').charAt(0).toUpperCase();
    const userName = user?.user_metadata?.full_name || user?.email || 'Admin';

    return (
        <aside className="sidebar">
            {/* Logo Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '6px', background: 'rgba(232,89,60, 0.12)', borderRadius: '8px', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sun size={20} fill="currentColor" strokeWidth={2.5} />
                </div>
                <h1 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>Solary Data</h1>
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

                <div className="sidebar-group-label" style={{ padding: '0 12px', marginBottom: '8px' }}>Integradores</div>
                <nav className="sidebar-group" style={{ marginBottom: '24px' }}>
                    {['APsystems', 'Sungrow', 'GoodWe'].map(tab => (
                        <a key={tab} href="#" className={`sidebar-item ${activeTab === tab && !selectedClientId ? 'active' : ''}`}
                            onClick={e => { e.preventDefault(); setActiveTab(tab); setSelectedClientId(null); }}>
                            <Sun size={17} />
                            <span>{tab}</span>
                        </a>
                    ))}
                </nav>

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
