import React from 'react';
import {
    Sun, LayoutDashboard, Users, FileText, ChevronLeft,
    Download, Edit3, X, LogOut
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '6px', background: '#FEF3C7', borderRadius: '8px', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sun size={20} fill="currentColor" strokeWidth={2.5} />
                </div>
                <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em' }}>Solary Data</h1>
            </div>

            <div className="text-nav-label-group">{selectedClientId ? 'Navegação' : 'Menu'}</div>
            <nav style={{ flex: 1 }}>
                {selectedClientId ? (
                    <a href="#" className="nav-item" onClick={e => { e.preventDefault(); setSelectedClientId(null); }}>
                        <ChevronLeft size={18} /><span className="text-nav-item">Voltar</span>
                    </a>
                ) : (
                    <>
                        {[
                            { tab: 'Dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
                            { tab: 'Clients', icon: <Users size={18} />, label: 'Sistemas', badge: clientsCount },
                            { tab: 'Bills', icon: <FileText size={18} />, label: 'Faturas' },
                        ].map(({ tab, icon, label, badge }) => (
                            <a key={tab} href="#" className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                                onClick={e => { e.preventDefault(); setActiveTab(tab); }}>
                                {icon}
                                <span className="text-nav-item">{label}</span>
                                {badge !== undefined && (
                                    <span style={{ marginLeft: 'auto', fontSize: '11px', background: activeTab === tab ? 'rgba(255,255,255,0.2)' : '#EEF2FF', color: activeTab === tab ? '#fff' : '#6366F1', padding: '1px 6px', borderRadius: '999px', fontWeight: 600 }}>
                                        {badge}
                                    </span>
                                )}
                            </a>
                        ))}
                    </>
                )}
            </nav>

            {selectedClientId && (
                <>
                    <div className="text-nav-label-group" style={{ marginTop: '24px' }}>Relatório</div>
                    <nav>
                        <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }}
                            onClick={() => selectedAC && handleExportPDF(selectedAC)}>
                            <Download size={18} /><span className="text-nav-item">Baixar PDF</span>
                        </button>
                        <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer' }} onClick={handleStartEdit}>
                            <Edit3 size={18} /><span className="text-nav-item">Editar Fatura</span>
                        </button>
                        <button className="nav-item" style={{ width: '100%', border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', color: '#DC2626' }}
                            onClick={async () => { if (confirm('Remover este sistema?')) { await removeClient(selectedClientId); setSelectedClientId(null); } }}>
                            <X size={18} /><span className="text-nav-item">Excluir Sistema</span>
                        </button>
                    </nav>
                </>
            )}

            {/* User Footer */}
            <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#6366F1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                        {userInitial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Administrador</div>
                    </div>
                    <button onClick={signOut} title="Sair" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', borderRadius: '6px' }}>
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
