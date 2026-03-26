import React from 'react';
import { ChevronLeft, Download, Sun, TrendingUp, BarChart2, Clock, Edit3, Save, X, History, RefreshCw, CheckCircle2, FileUp } from 'lucide-react';
import { ActiveClient, FinalReportObject } from '../utils/solarHelpers';
import ExecutiveReport from './ExecutiveReport';
import { Bill } from '../hooks/useBills';

interface ClientDetailViewProps {
    selectedAC: ActiveClient;
    selectedBill: Bill | null;
    selectedStats: FinalReportObject | null;
    isEditing: boolean;
    editData: any;
    setEditData: (data: any) => void;
    handleSaveEdit: () => void;
    setIsEditing: (val: boolean) => void;
    handleStartEdit: () => void;
    setSelectedClientId: (id: string | null) => void;
    handleExportPDF: (ac: ActiveClient) => void;
    syncSystemsFromAPI: () => void;
    isSyncingAPI: boolean;
    updateClientName: (name: string) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading: boolean;
    branding: any;
    handleResetData: (id: string) => void;
}

interface FieldProps {
    label: string;
    field: string;
    type: string;
    fullWidth?: boolean;
    hint: string;
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
    updateClientName,
    handleFileUpload,
    isUploading,
    branding,
    handleResetData
}) => {
    // Helper para converter string de input (com vírgula ou ponto) para número
    const parseFormattedNumber = (val: string) => {
        if (!val) return 0;
        const normalized = val.replace(',', '.');
        return parseFloat(normalized) || 0;
    };

    const formFields: FieldProps[] = [
        { label: 'Competência', field: 'competency', type: 'text', fullWidth: true, hint: 'Mês e ano da conta (Ex: 03/2026)' },
        { label: 'Custo Total (R$)', field: 'total_value', type: 'text', hint: 'Valor total pago na fatura.' },
        { label: 'Geração Solar (kWh)', field: 'generation', type: 'text', hint: 'Total produzido pelo inversor no mês.' },
        { label: 'Consumo da Rede (kWh)', field: 'consumption', type: 'text', hint: 'Energia da concessionária (Grid).' },
        { label: 'Compensada (kWh)', field: 'compensated_energy', type: 'text', hint: 'Energia que abateu o consumo.' },
        { label: 'Injetada (kWh)', field: 'injected_energy', type: 'text', hint: 'Excedente total enviado à rede.' },
        { label: 'Tarifa (R$/kWh)', field: 'tariff_kwh', type: 'text', hint: 'Valor base do kWh (Ex: 0,95).' },
        { label: 'Saldo Créditos (kWh)', field: 'credit_balance', type: 'text', hint: 'Saldo total para uso futuro.' },
        { label: 'CIP / Iluminação (R$)', field: 'street_lighting', type: 'text', fullWidth: true, hint: 'Taxa de Iluminação Pública.' },
    ];

    return (
        <div style={{ padding: '0 24px' }}>
            {/* Edit Overlay */}
            {isEditing && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px', overflowY: 'auto' }}>
                    <div style={{ width: '100%', maxWidth: '540px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                    {selectedBill ? 'Ajustar Dados da Fatura' : 'Lançamento Manual'}
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Preencha os campos conforme a fatura da concessionária.</p>
                            </div>
                            <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'var(--color-bg-base)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {formFields.map(({ label, field, type, fullWidth, hint }) => (
                                <div key={field} style={{ gridColumn: fullWidth ? 'span 2' : 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</label>
                                        {field === 'tariff_kwh' && !(editData as any)[field] && (
                                            <button
                                                onClick={() => setEditData((p: any) => ({ ...p, tariff_kwh: 0.95 }))}
                                                style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
                                            >
                                                Sugerir (R$ 0,95)
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        type={type}
                                        value={(editData as any)[field] ?? (field === 'generation' ? selectedAC.generation : '')}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setEditData((p: any) => ({
                                                ...p,
                                                [field]: field === 'competency' ? val : parseFormattedNumber(val)
                                            }));
                                        }}
                                        placeholder={hint}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', background: 'var(--color-bg-base)' }}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* PREVIEW DE CÁLCULO - VDS Style */}
                        <div style={{ marginTop: '32px', padding: '24px', background: 'var(--color-status-success-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-status-success-text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Resultado Estimado
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Economia Bruta</p>
                                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        R$ {((editData.total_value || 0) + ((editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95))).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Redução %</p>
                                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {(((editData.total_value || 0) + (editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95)) > 0
                                            ? (((editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95)) / ((editData.total_value || 0) + (editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95)) * 100)
                                            : 0).toFixed(0)}%
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Novo Saldo</p>
                                    <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        {(editData.credit_balance || 0).toFixed(0)} kWh
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={handleSaveEdit}>Salvar Relatório</button>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--color-border)' }} onClick={() => setIsEditing(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header / Top Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <button onClick={() => setSelectedClientId(null)} style={{ border: 'none', background: 'var(--color-bg-base)', padding: '6px', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                            <ChevronLeft size={18} />
                        </button>
                        <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{selectedAC.name}</h2>
                        <span className={`badge badge-${selectedAC.status === 'Completo' ? 'success' : selectedAC.status === 'Divergente' ? 'warning' : 'danger'}`}>
                            {selectedAC.status}
                        </span>
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginLeft: '38px' }}>
                        UC {selectedAC.uc} · <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>{selectedAC.platform}</span> · ID {selectedAC.system_id}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                        <RefreshCw size={14} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sync...' : 'Atualizar'}
                    </button>
                    <label className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <FileUp size={14} /> Vincular PDF
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <button className="btn btn-primary" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={() => handleExportPDF(selectedAC)}>
                        <Download size={14} /> Exportar Relatório
                    </button>
                </div>
            </div>

            {/* VDS KPI Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                {[
                    { label: 'Geração Reportada', value: selectedAC.generation > 0 ? `${selectedAC.generation.toFixed(0)} kWh` : '—', sub: 'Total mensal (API)', color: 'var(--color-primary)' },
                    { label: 'Economia Estimada', value: selectedStats ? `R$ ${selectedStats.resultado.economia_mensal.toFixed(2)}` : '—', sub: 'Geração vs Tarifa', color: 'var(--color-status-success-text)' },
                    { label: 'Saldo de Créditos', value: selectedBill ? `${selectedBill.credit_balance || 0} kWh` : '—', sub: 'Recuperado da fatura', color: 'var(--color-text-primary)' },
                    { label: 'Payback Est.', value: selectedStats ? selectedStats.resultado.payback_texto_aproximado : '—', sub: 'Tempo de retorno', color: 'var(--color-text-primary)' },
                ].map((k, i) => (
                    <div key={i} className="card" style={{ padding: '20px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>{k.label}</div>
                        <div style={{ fontSize: '28px', fontWeight: 600, color: k.color, marginBottom: '4px' }}>{k.value}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{k.sub}</div>
                    </div>
                ))}
            </div>

            {/* Central Analysis */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '24px' }}>Balanço Energético Individual</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '200px', background: 'var(--color-bg-base)', borderRadius: '10px', padding: '24px' }}>
                        {[
                            { label: 'Gerado', val: selectedAC.generation, col: 'var(--color-primary)' },
                            { label: 'Compensado', val: selectedStats?.dados_entrada.fatura.energia_compensada_kwh || 0, col: 'var(--color-status-success-text)' },
                            { label: 'Grid', val: selectedStats?.dados_entrada.fatura.consumo_kwh || 0, col: 'var(--color-text-muted)' }
                        ].map(b => {
                            const maxVal = Math.max(selectedAC.generation, selectedStats?.dados_entrada.fatura.consumo_kwh || 0, 100);
                            const height = (b.val / maxVal) * 140;
                            return (
                                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ fontSize: '13px', fontWeight: 600, color: b.col }}>{b.val.toFixed(0)}</div>
                                    <div style={{ width: '32px', height: `${height}px`, background: b.col, borderRadius: '4px 4px 0 0', transition: 'height 0.3s ease' }} />
                                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.label}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Dados da Fatura</h3>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleResetData(selectedAC.id)} style={{ border: 'none', background: 'var(--color-bg-base)', color: 'var(--color-status-danger-text)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Reset</button>
                            <button onClick={handleStartEdit} style={{ border: 'none', background: '#1A1A1A', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                        </div>
                    </div>

                    {selectedBill ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { label: 'Valor Pago', value: `R$ ${selectedBill.total_value.toFixed(2)}` },
                                { label: 'Energia Injetada', value: `${selectedBill.injected_energy || 0} kWh` },
                                { label: 'Energia Compensada', value: `${selectedBill.compensated_energy || 0} kWh` },
                                { label: 'Saldo de Créditos', value: `${selectedBill.credit_balance || 0} kWh` },
                                { label: 'Tarifa (R$)', value: `${selectedBill.tariff_kwh?.toFixed(2) || '—'}` },
                            ].map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--color-bg-base)', borderRadius: '8px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{item.label}</span>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '48px 0', border: '1px dashed var(--color-border)', borderRadius: '10px' }}>
                            <History size={24} color="var(--color-text-muted)" style={{ marginBottom: '12px' }} />
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Fatura pendente para MAR/2026</p>
                        </div>
                    )}
                </div>
            </div>

            {/* PREVIEW DO RELATÓRIO */}
            {selectedStats && (
                <div style={{ marginTop: '48px', padding: '32px', background: 'var(--color-bg-base)', borderRadius: '14px', textAlign: 'center' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Executive Report Preview</h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>High-fidelity simulation of the generated financial document.</p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center', marginBottom: '-100px', border: '1px solid var(--color-border)', borderRadius: '4px' }}>
                            <ExecutiveReport data={selectedStats} branding={branding} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetailView;
