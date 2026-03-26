import React from 'react';
import { ChevronLeft, Download, Sun, TrendingUp, BarChart2, Clock, Edit3, Save, X, History, RefreshCw, CheckCircle2, FileUp } from 'lucide-react';
import { ActiveClient, FinalReportObject, calculateFinalReport } from '../utils/solarHelpers';
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
    selectedCompetency: string;
    setSelectedCompetency: (val: string) => void;
    availableCompetencies: string[];
    clientBills: Bill[];
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
    handleResetData,
    selectedCompetency,
    setSelectedCompetency,
    availableCompetencies,
    clientBills,
    setSelectedClientId,
    handleExportPDF,
    syncSystemsFromAPI,
    isSyncingAPI,
    updateClientName,
    handleFileUpload,
    isUploading,
    branding
}) => {
    const [viewType, setViewType] = React.useState<'bar' | 'line'>('bar');
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {availableCompetencies.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-base)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--color-border)', marginRight: '8px' }}>
                            <Clock size={14} style={{ marginRight: '8px', color: 'var(--color-text-muted)' }} />
                            <select
                                value={selectedCompetency}
                                onChange={(e) => setSelectedCompetency(e.target.value)}
                                style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', cursor: 'pointer', outline: 'none' }}
                            >
                                {availableCompetencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                    <button className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={handleStartEdit}>
                        <Edit3 size={14} /> Editar Fatura
                    </button>
                    <button className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={syncSystemsFromAPI} disabled={isSyncingAPI}>
                        <RefreshCw size={14} className={isSyncingAPI ? 'spin' : ''} /> {isSyncingAPI ? 'Sync' : 'Atualizar'}
                    </button>
                    <label className="btn btn-outline" style={{ borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <FileUp size={14} /> Fatura PDF
                        <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                    </label>
                    <button className="btn btn-primary" style={{ borderRadius: '8px', fontSize: '13px' }} onClick={() => handleExportPDF(selectedAC)}>
                        <Download size={14} /> Exportar
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Análise de Desempenho</h3>
                        <div style={{ display: 'flex', background: 'var(--color-bg-base)', padding: '2px', borderRadius: '8px' }}>
                            <button
                                onClick={() => setViewType('bar')}
                                style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: viewType === 'bar' ? '#FFF' : 'transparent', color: viewType === 'bar' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', boxShadow: viewType === 'bar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                                COMPARATIVO
                            </button>
                            <button
                                onClick={() => setViewType('line')}
                                style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: viewType === 'line' ? '#FFF' : 'transparent', color: viewType === 'line' ? 'var(--color-primary)' : 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', boxShadow: viewType === 'line' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
                                HISTÓRICO
                            </button>
                        </div>
                    </div>

                    {viewType === 'bar' ? (
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: '240px', background: 'var(--color-bg-base)', borderRadius: '10px', padding: '32px 24px' }}>
                            <style>{`
                                @keyframes growUp { from { height: 0; opacity: 0; } to { height: var(--target-height); opacity: 1; } }
                                .animate-bar { animation: growUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                            `}</style>
                            {[
                                { label: 'Gerado', val: selectedAC.generation, col: 'var(--color-primary)' },
                                { label: 'Compensado', val: selectedStats?.dados_entrada.fatura.energia_compensada_kwh || 0, col: 'var(--color-status-success-text)' },
                                { label: 'Grid', val: selectedStats?.dados_entrada.fatura.consumo_kwh || 0, col: 'var(--color-text-muted)' }
                            ].map((b, i) => {
                                const maxVal = Math.max(selectedAC.generation, selectedStats?.dados_entrada.fatura.consumo_kwh || 0, 100);
                                const height = (b.val / maxVal) * 120;
                                return (b.val > 0 || b.label === 'Gerado') && (
                                    <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 600, color: b.col }}>{b.val.toFixed(0)}</div>
                                        <div
                                            className="animate-bar"
                                            style={{
                                                width: '32px',
                                                '--target-height': `${height}px`,
                                                background: b.col,
                                                borderRadius: '4px 4px 0 0',
                                                animationDelay: `${i * 0.1}s`,
                                                opacity: 0 /* Start hidden for animation */
                                            } as any}
                                        />
                                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.label}</div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div style={{ height: '240px', background: 'var(--color-bg-base)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)' }}>
                            <style>{`
                                @keyframes drawLine { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
                                @keyframes fadeInArea { from { opacity: 0; } to { opacity: 0.15; } }
                                .chart-path-smooth { stroke-dasharray: 1200; stroke-dashoffset: 1200; animation: drawLine 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                                .chart-area-smooth { opacity: 0; animation: fadeInArea 2s ease-out 0.5s forwards; }
                            `}</style>
                            <div style={{ flex: 1, position: 'relative' }}>
                                <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                    <defs>
                                        <linearGradient id="areaGradientModern" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
                                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                        </linearGradient>
                                    </defs>

                                    {/* Gridlines */}
                                    {[0, 30, 60, 90, 120].map(y => (
                                        <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="var(--color-border)" strokeWidth="0.3" strokeOpacity="0.3" />
                                    ))}

                                    {/* Area Fill */}
                                    <path
                                        d="M 0 120 C 50 120, 100 80, 150 70 C 200 60, 250 100, 300 40 C 350 -10, 450 0, 500 20 L 500 120 Z"
                                        fill="url(#areaGradientModern)"
                                        className="chart-area-smooth"
                                        style={{ opacity: 0.12 }}
                                    />

                                    {/* Curved Path */}
                                    <path
                                        d="M 0 120 C 50 120, 100 80, 150 70 C 200 60, 250 100, 300 40 C 350 -10, 450 0, 500 20"
                                        fill="none"
                                        stroke="var(--color-primary)"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="chart-path-smooth"
                                    />

                                    {/* Nodes */}
                                    {[0, 150, 300, 500].map((x, i) => {
                                        const y = [120, 70, 40, 20][i];
                                        return (
                                            <circle key={i} cx={x} cy={y} r="3.5" fill="#FFF" stroke="var(--color-primary)" strokeWidth="2" />
                                        );
                                    })}
                                </svg>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                {['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'].map(m => (
                                    <span key={m} style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{m}</span>
                                ))}
                            </div>
                        </div>
                    )}
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

            {/* REPORT PREVIEW AND HISTORY SIDE-BY-SIDE */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '24px', alignItems: 'start', marginTop: '48px' }}>
                {/* PREVIEW DO RELATÓRIO (Left) */}
                {selectedStats ? (
                    <div style={{ padding: '32px 20px', background: 'var(--color-bg-base)', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--color-border)' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>Preview Executivo</h3>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Simulação de documento financeiro de alta fidelidade.</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', overflow: 'hidden' }}>
                            <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center', marginBottom: '-120px', border: '1px solid var(--color-border)', borderRadius: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                                <ExecutiveReport data={selectedStats} branding={branding} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="card" style={{ padding: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', height: '100%' }}>
                        <Sun size={48} color="var(--color-text-muted)" style={{ opacity: 0.3, marginBottom: '24px' }} />
                        <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Nenhum dado para pré-visualização.</p>
                    </div>
                )}

                {/* Reports History Section (Right) */}
                <div className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <History size={18} style={{ color: 'var(--color-primary)' }} />
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>Histórico de Relatórios</h3>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Mês</th>
                                    <th style={{ textAlign: 'left', padding: '12px 0', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Economia</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientBills.length > 0 ? clientBills.sort((a, b) => b.competency.localeCompare(a.competency)).map(bill => {
                                    const stats = calculateFinalReport(selectedAC, bill, (bill as any).generation || 0);
                                    return (
                                        <tr key={bill.id} style={{ borderBottom: '1px solid var(--color-bg-base)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '12px 0', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{bill.competency}</td>
                                            <td style={{ padding: '12px 0', fontSize: '13px', color: 'var(--color-status-success-text)', fontWeight: 600 }}>
                                                R$ {stats.resultado.economia_mensal.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px 0', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => setSelectedCompetency(bill.competency)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', opacity: selectedCompetency === bill.competency ? 0.5 : 1 }}
                                                    disabled={selectedCompetency === bill.competency}
                                                >
                                                    Ver
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '12px' }}>
                                            Vazio
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientDetailView;
