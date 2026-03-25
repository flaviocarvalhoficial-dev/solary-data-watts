import React from 'react';
import { ChevronLeft, Download, Sun, TrendingUp, BarChart2, Clock, Edit3, Save, X, History } from 'lucide-react';
import { ActiveClient } from '../App';
import { Bill } from '../hooks/useBills';

interface ClientDetailViewProps {
    selectedAC: ActiveClient;
    selectedBill: Bill | null;
    selectedStats: any;
    isEditing: boolean;
    editData: Partial<Bill>;
    setEditData: (data: any) => void;
    handleSaveEdit: () => void;
    setIsEditing: (editing: boolean) => void;
    handleStartEdit: () => void;
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
    syncSystemsFromAPI: () => void;
    isSyncingAPI: boolean;
    updateClientName: (newName: string) => void;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({
    selectedAC,
    selectedBill,
    selectedStats,
    isEditing,
    editData,
    setEditData,
    handleSaveEdit,
    setIsEditing,
    handleStartEdit,
    setSelectedClientId,
    handleExportPDF,
    syncSystemsFromAPI,
    isSyncingAPI,
    updateClientName
}) => {
    return (
        <div id="report-content" style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--color-border)', position: 'relative' }}>
            {/* Edit Overlay */}
            {isEditing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.97)', zIndex: 20, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                    <div style={{ width: '100%', maxWidth: '420px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
                            {selectedBill ? 'Editar Fatura' : 'Inserir Manualmente (Fallback)'}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {[
                                { label: 'Competência', field: 'competency', type: 'text' },
                                { label: 'Custo Total (R$)', field: 'total_value', type: 'number' },
                                { label: 'Consumo (kWh)', field: 'consumption', type: 'number' },
                                { label: 'Energia Injetada (kWh)', field: 'injected_energy', type: 'number' },
                                { label: 'CIP / Iluminação (R$)', field: 'street_lighting', type: 'number' },
                            ].map(({ label, field, type }) => (
                                <div key={field}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>{label}</label>
                                    <input type={type} value={(editData as any)[field] ?? ''}
                                        onChange={e => setEditData((p: any) => ({ ...p, [field]: type === 'number' ? parseFloat(e.target.value || '0') : e.target.value }))}
                                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px' }} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveEdit}><Save size={15} /> Salvar</button>
                            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}><X size={15} /> Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{selectedAC.name}</h2>
                        <button onClick={async (e) => {
                            e.stopPropagation();
                            const newName = prompt('Novo nome do cliente:', selectedAC.name);
                            if (newName && newName !== selectedAC.name) {
                                updateClientName(newName);
                            }
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }} title="Renomear">
                            <Edit3 size={16} />
                        </button>
                        <span className={`badge badge-${selectedAC.status === 'Completo' ? 'cold' : selectedAC.status === 'Divergente' ? 'warm' : 'hot'}`}>{selectedAC.status}</span>
                    </div>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        UC {selectedAC.uc} · {selectedAC.platform} · ID {selectedAC.system_id}
                        {selectedBill && ` · Competência ${selectedBill.competency}`}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn btn-outline"
                        onClick={syncSystemsFromAPI}
                        disabled={isSyncingAPI}
                    >
                        <RefreshCw size={15} className={isSyncingAPI ? 'spin' : ''} />
                        {isSyncingAPI ? 'Sincronizando...' : 'Sincronizar API'}
                    </button>
                    <button className="btn btn-outline" onClick={() => setSelectedClientId(null)}><ChevronLeft size={15} /> Voltar</button>
                    <button className="btn btn-primary" onClick={() => handleExportPDF(selectedAC)}><Download size={15} /> Exportar PDF</button>
                </div>
            </div>

            {/* KPIs Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Geração do Mês', value: selectedAC.generation > 0 ? `${selectedAC.generation.toFixed(0)} kWh` : '—', icon: <Sun size={14} />, bg: '#F8FAFC', vc: 'var(--color-text-primary)' },
                    { label: 'Economia Real', value: selectedStats ? `R$ ${selectedStats.economyValue.toFixed(2)}` : '—', icon: <TrendingUp size={14} />, bg: '#F0FDF4', vc: '#166534' },
                    { label: '% Redução', value: selectedStats ? `${selectedStats.reductionPercent}%` : '—', icon: <BarChart2 size={14} />, bg: '#F8FAFC', vc: 'var(--color-text-primary)' },
                    { label: 'Payback', value: selectedStats ? `${selectedStats.payback} anos` : '—', icon: <Clock size={14} />, bg: '#F8FAFC', vc: 'var(--color-text-primary)' },
                ].map((k, i) => (
                    <div key={i} className="table-card" style={{ padding: '20px', background: k.bg }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}>{k.icon}{k.label}</div>
                        <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: k.vc }}>{k.value}</div>
                    </div>
                ))}
            </div>

            {/* Balanço Energético */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div className="table-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px' }}>Balanço Energético</h3>
                    <div style={{ height: '260px', background: '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '48px', padding: '40px 40px 32px' }}>
                        {[
                            { label: 'Geração', h: 220, col: '#6366F1' },
                            { label: 'Consumo', h: selectedStats ? Math.min((selectedStats.totalConsumption / 600) * 220, 220) : 140, col: '#94A3B8' },
                        ].map(b => (
                            <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '52px', height: `${b.h}px`, background: b.col, borderRadius: '6px 6px 0 0', transition: 'height 0.4s ease' }} />
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{b.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="table-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Dados da Fatura</h3>
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleStartEdit}>
                            <Edit3 size={13} /> {selectedBill ? 'Editar' : 'Inserir'}
                        </button>
                    </div>
                    {selectedBill ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { label: 'Valor Pago', value: `R$ ${selectedBill.total_value.toFixed(2)}` },
                                { label: 'Injetada', value: `${selectedBill.injected_energy} kWh` },
                                { label: 'Consumo', value: `${selectedBill.consumption} kWh` },
                                { label: 'Taxa CIP', value: `R$ ${(selectedBill.street_lighting ?? 0).toFixed(2)}` },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{item.label}</span>
                                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 16px', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                            <History size={28} color="#94A3B8" style={{ marginBottom: '10px' }} />
                            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Nenhuma fatura vinculada</p>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleStartEdit}>Inserir Manualmente</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClientDetailView;
