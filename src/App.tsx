import React, { useState } from 'react';
import {
    Users, LayoutDashboard, FileText, Settings,
    Search, Bell, Plus, Filter, Download,
    Cpu, Sun, Zap, Info, Clock, ExternalLink
} from 'lucide-react';

// Mock Data for APsystems Clients
const MOCK_CLIENTS = [
    { id: 1, name: 'Jenny Wilson', uc: '8839201', platform: 'APsystems', projectId: 'P-1029', status: 'Completo', activity: 'Sep 12, 09:10 AM', created: '1 month ago', generation: 450.2 },
    { id: 2, name: 'David Lane', uc: '2291028', platform: 'APsystems', projectId: 'P-1030', status: 'Divergente', activity: 'Sep 12, 10:15 AM', created: '2 months ago', generation: 380.5 },
    { id: 3, name: 'Robert Fox', uc: '7721039', platform: 'APsystems', projectId: 'P-1031', status: 'Incompleto', activity: 'Sep 11, 04:30 PM', created: '3 months ago', generation: 0 },
    { id: 4, name: 'Kristin Watson', uc: '1129384', platform: 'APsystems', projectId: 'P-1032', status: 'Completo', activity: 'Sep 10, 11:20 AM', created: '1 week ago', generation: 512.8 },
];

function App() {
    const [activeTab, setActiveTab] = useState('Leads');

    return (
        <div className="app-shell">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', marginBottom: '24px' }}>
                    <div style={{
                        padding: '5px',
                        background: '#FEF3C7',
                        borderRadius: '8px',
                        color: '#F59E0B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(245, 158, 11, 0.1)'
                    }}>
                        <Sun size={20} fill="currentColor" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>Solary Data</h1>
                </div>


                <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                        type="text"
                        placeholder="Search"
                        style={{
                            width: '100%', padding: '8px 12px 8px 36px',
                            borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                            background: 'var(--color-bg-base)', fontSize: '13px'
                        }}
                    />
                </div>

                <div className="text-nav-label-group">Menu</div>
                <nav>
                    <a href="#" className="nav-item">
                        <LayoutDashboard size={18} />
                        <span className="text-nav-item">Dashboard</span>
                    </a>
                    <a href="#" className={`nav-item ${activeTab === 'Leads' ? 'active' : ''}`} onClick={() => setActiveTab('Leads')}>
                        <Users size={18} />
                        <span className="text-nav-item">Clients</span>
                    </a>
                    <a href="#" className="nav-item">
                        <FileText size={18} />
                        <span className="text-nav-item">Reports</span>
                    </a>
                </nav>

                <div className="text-nav-label-group">Platform</div>
                <nav>
                    <a href="#" className="nav-item">
                        <Cpu size={18} />
                        <span className="text-nav-item">APsystems</span>
                        <span style={{ marginLeft: 'auto', fontSize: '11px', background: '#D1FAE5', color: '#065F46', padding: '2px 6px', borderRadius: '999px' }}>Online</span>
                    </a>
                </nav>

                <div style={{ marginTop: 'auto', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid var(--color-border)' }}>
                    <img src="https://ui-avatars.com/api/?name=User&background=6366F1&color=fff" className="avatar" alt="User" />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Solar Admin</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>admin@solary.com</div>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="main-content">
                <header className="topbar">
                    <h2 className="text-page-title">Sistemas Ativos</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                            <input
                                type="text"
                                placeholder="Pesquisar sistemas..."
                                style={{ width: '220px', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                            />
                        </div>
                        <button style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <Bell size={20} color="#374151" />
                            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', border: '2px solid #fff' }}></div>
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    {/* TOOLBAR */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline" style={{ background: 'var(--color-bg-base)', border: 'none' }}>☰ List</button>
                            <button className="btn btn-outline">⊞ Grid</button>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-outline"><Filter size={16} /> Filter</button>
                            <button className="btn btn-outline"><Download size={16} /> Export</button>
                            <button className="btn btn-primary"><Plus size={16} /> Add New System</button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <div className="table-card">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}><input type="checkbox" /></th>
                                    <th>Cliente</th>
                                    <th>UC / ID Sistema</th>
                                    <th>Geração Mensal (kWh)</th>
                                    <th>Status</th>
                                    <th>Atividade</th>
                                    <th>Fonte</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MOCK_CLIENTS.map(client => (
                                    <tr key={client.id}>
                                        <td><input type="checkbox" /></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <img src={`https://ui-avatars.com/api/?name=${client.name}&background=random`} className="avatar" alt="" />
                                                <div>
                                                    <div className="text-lead-name">{client.name}</div>
                                                    <div className="text-small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Zap size={12} /> {client.projectId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="text-body" style={{ fontWeight: 500 }}>{client.uc}</div>
                                            <div className="text-small">{client.platform}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Sun size={14} color="#F59E0B" />
                                                <span style={{ fontWeight: 600 }}>{client.generation > 0 ? client.generation.toFixed(1) : '--'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge badge-${client.status === 'Completo' ? 'cold' : client.status === 'Divergente' ? 'warm' : 'hot'}`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="text-body" style={{ fontSize: '13px' }}>{client.activity}</div>
                                            <div className="text-small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={12} /> {client.created}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ExternalLink size={14} color="var(--color-primary)" />
                                                <span className="text-small" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>APsystems</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* PAGINATION */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="text-small">Show <span style={{ fontWeight: 600, border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px' }}>11 ▾</span> items per page</div>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                <button className="btn btn-outline" style={{ padding: '4px 8px', width: '32px' }}>←</button>
                                <button className="btn btn-primary" style={{ padding: '4px 8px', width: '32px', height: '32px' }}>1</button>
                                <button className="btn btn-outline" style={{ padding: '4px 8px', width: '32px', height: '32px' }}>2</button>
                                <button className="btn btn-outline" style={{ padding: '4px 8px', width: '32px', height: '32px' }}>3</button>
                                <button className="btn btn-outline" style={{ padding: '4px 8px', width: '32px' }}>→</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;
