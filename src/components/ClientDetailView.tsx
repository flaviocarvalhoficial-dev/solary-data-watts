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
    branding
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
        <div id="report-content" style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--color-border)', position: 'relative' }}>
            {/* Edit Overlay */}
            {isEditing && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 20, borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '32px', overflowY: 'auto' }}>
                    <div style={{ width: '100%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-primary)' }}>
                                    {selectedBill ? 'Ajustar Dados da Fatura' : 'Lançamento Manual'}
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Preencha os campos conforme a fatura da concessionária.</p>
                            </div>
                            <button type="button" onClick={() => setIsEditing(false)} style={{ background: '#F3F4F6', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {formFields.map(({ label, field, type, fullWidth, hint }) => (
                                <div key={field} style={{ gridColumn: fullWidth ? 'span 2' : 'auto' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{label}</label>
                                        {field === 'tariff_kwh' && !(editData as any)[field] && (
                                            <button
                                                onClick={() => setEditData((p: any) => ({ ...p, tariff_kwh: 0.95 }))}
                                                style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Sugerir Tarifa (R$ 0,95)
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
                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border)', fontSize: '15px', background: '#F9FAFB' }}
                                    />
                                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: '1.3' }}>{hint}</p>
                                </div>
                            ))}
                        </div>

                        {/* PREVIEW DE CÁLCULO REAL-TIME */}
                        <div style={{ marginTop: '32px', padding: '24px', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCFCE7' }}>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', marginBottom: '16px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.05em' }}>
                                <TrendingUp size={16} /> Resultado Estimado do Relatório
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#15803D', marginBottom: '4px', fontWeight: 600 }}>Economia Bruta</p>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#166534' }}>
                                        R$ {((editData.total_value || 0) + ((editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95))).toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#15803D', marginBottom: '4px', fontWeight: 600 }}>Redução %</p>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#166534' }}>
                                        {(((editData.total_value || 0) + (editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95)) > 0
                                            ? (((editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95)) / ((editData.total_value || 0) + (editData.compensated_energy || 0) * (editData.tariff_kwh || 0.95)) * 100)
                                            : 0).toFixed(0)}%
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#15803D', marginBottom: '4px', fontWeight: 600 }}>Novo Saldo</p>
                                    <p style={{ fontSize: '20px', fontWeight: 800, color: '#166534' }}>
                                        {(editData.credit_balance || 0).toFixed(0)} <span style={{ fontSize: '12px' }}>kWh</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '16px', marginTop: '32px', paddingBottom: '32px' }}>
                            <button className="btn btn-primary" style={{ flex: 1, padding: '14px', fontSize: '15px' }} onClick={handleSaveEdit}><Save size={18} /> Salvar e Gerar Relatório</button>
                            <button className="btn btn-outline" style={{ flex: 1, padding: '14px', fontSize: '15px' }} onClick={() => setIsEditing(false)}><X size={18} /> Cancelar</button>
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
                        {isSyncingAPI ? 'Sincronizando...' : 'Atualizar Agora'}
                    </button>

                    {/* Botão de Upload Individual */}
                    <label className="btn btn-outline" style={{ cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileUp size={15} />
                        {isUploading ? 'Processando...' : 'Vincular PDF'}
                        <input
                            type="file"
                            accept=".pdf"
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>

                    <button className="btn btn-outline" onClick={() => setSelectedClientId(null)}><ChevronLeft size={15} /> Voltar</button>
                    <button className="btn btn-primary" onClick={() => handleExportPDF(selectedAC)}><Download size={15} /> Exportar PDF</button>
                </div>
            </div>

            {/* KPIs Detail */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {[
                    { label: 'Gerado (Mês)', value: selectedAC.generation > 0 ? `${selectedAC.generation.toFixed(0)} kWh` : '—', icon: <Sun size={14} />, bg: '#F8FAFC', vc: 'var(--color-text-primary)' },
                    { label: 'Economia Mensal', value: selectedStats ? `R$ ${selectedStats.resultado.economia_mensal.toFixed(2)}` : '—', icon: <TrendingUp size={14} />, bg: '#F0FDF4', vc: '#166534' },
                    { label: 'Resultado Total', value: selectedStats ? `R$ ${selectedStats.resultado.resultado_total.toFixed(0)}` : '—', icon: <BarChart2 size={14} />, bg: '#EEF2FF', vc: '#4F46E5' },
                    { label: 'Payback Estimado', value: selectedStats ? selectedStats.resultado.payback_texto_aproximado : '—', icon: <Clock size={14} />, bg: '#F8FAFC', vc: 'var(--color-text-primary)' },
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
                    <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '24px' }}>Balanço Energético vs Fatura</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ height: '220px', background: '#F9FAFB', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '32px', padding: '24px 24px 16px' }}>
                            {[
                                { label: 'Gerado (API)', h: 180, col: '#6366F1', val: `${selectedAC.generation.toFixed(0)} kWh` },
                                { label: 'Compensado', h: selectedStats ? Math.min((selectedStats.resultado.fatura_antiga_corrigida / (selectedAC.generation || 1)) * 180, 180) : 100, col: '#10B981', val: selectedStats ? `${selectedStats.dados_entrada.fatura.energia_compensada_kwh.toFixed(0)} kWh` : '—' },
                                { label: 'Grid / Consumo', h: selectedStats ? Math.min((selectedStats.dados_entrada.fatura.consumo_kwh / (selectedAC.generation || 1)) * 180, 180) : 100, col: '#94A3B8', val: selectedStats ? `${selectedStats.dados_entrada.fatura.consumo_kwh.toFixed(0)} kWh` : '—' },
                            ].map(b => (
                                <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 700, color: b.col }}>{b.val}</div>
                                    <div style={{ width: '40px', height: `${b.h}px`, background: b.col, borderRadius: '4px 4px 0 0', transition: 'height 0.4s ease' }} />
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted)', textAlign: 'center' }}>{b.label}</span>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', background: selectedAC.status === 'Divergente' ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${selectedAC.status === 'Divergente' ? '#FEE2E2' : '#DCFCE7'}` }}>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: selectedAC.status === 'Divergente' ? '#991B1B' : '#166534', marginBottom: '4px' }}>
                                    {selectedAC.status === 'Divergente' ? '⚠️ Divergência Detectada' : '✅ Fluxo Consistente'}
                                </div>
                                <p style={{ fontSize: '12px', color: selectedAC.status === 'Divergente' ? '#B91C1C' : '#15803D' }}>
                                    {selectedAC.status === 'Divergente'
                                        ? 'A geração reportada pela API está significativamente diferente do consumo + injeção da fatura. Verifique se há perda de comunicação ou use o fallback.'
                                        : 'Os dados de geração e consumo estão consistentes. Economia acumulada impulsionada por créditos.'}
                                </p>
                                {selectedStats?.insights_operacionais && selectedStats.insights_operacionais.length > 0 && (
                                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {selectedStats.insights_operacionais.map((insight: string, idx: number) => (
                                            <div key={idx} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#166534' }}>
                                                <CheckCircle2 size={12} /> {insight}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {selectedStats?.flags_validacao && selectedStats.flags_validacao.length > 0 && (
                                <div style={{ padding: '8px 12px', background: '#FFF7ED', border: '1px solid #FFEDD5', borderRadius: '8px', fontSize: '11px', color: '#9A3412', fontWeight: 600 }}>
                                    ⚠️ {selectedStats.flags_validacao[0]}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="table-card" style={{ padding: '24px', border: selectedBill && selectedBill.confidence && selectedBill.confidence > 0.9 ? '1px solid #10B981' : '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Dados da Fatura</h3>
                            {selectedBill && selectedBill.confidence && selectedBill.confidence > 0.9 && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>
                                    <CheckCircle2 size={12} /> VALIDADO
                                </span>
                            )}
                        </div>
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={handleStartEdit}>
                            <Edit3 size={13} /> {selectedBill ? 'Editar' : 'Inserir'}
                        </button>
                    </div>
                    {selectedBill ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { label: 'Valor Pago', value: `R$ ${selectedBill.total_value.toFixed(2)}`, confidence: true },
                                { label: 'Compensada', value: `${selectedBill.compensated_energy || 0} kWh`, confidence: true },
                                { label: 'Créditos', value: `${selectedBill.credit_balance || 0} kWh`, confidence: true },
                                { label: 'Consumo Grid', value: `${selectedBill.consumption} kWh`, confidence: true },
                                { label: 'Tarifa', value: `R$ ${(selectedBill.tariff_kwh || 0).toFixed(2)}`, confidence: (selectedBill.tariff_kwh || 0) > 0 },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid transparent', position: 'relative' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{item.label}</span>
                                        {item.confidence && <CheckCircle2 size={12} color="#10B981" />}
                                    </div>
                                    <span style={{ fontWeight: 700, fontSize: '13px' }}>{item.value}</span>
                                </div>
                            ))}
                            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '8px', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TrendingUp size={12} /> Analisado via Motor Solary V3
                            </div>
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

            {/* PREVISUALIZAÇÃO DO RELATÓRIO (FOLHA DE PAPEL) */}
            {selectedStats && (
                <div style={{ marginTop: '48px', paddingTop: '48px', borderTop: '1px solid var(--color-border)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Prévia do Relatório Executivo</h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Esta é uma simulação de como o relatório aparecerá no PDF final.</p>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        background: '#F3F4F6',
                        padding: '60px 0',
                        borderRadius: '16px',
                        overflowX: 'auto'
                    }}>
                        <div style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                            transform: 'scale(0.9)',
                            transformOrigin: 'top center',
                            marginBottom: '-80px' // Compensar o scale p/ não deixar buraco
                        }}>
                            <ExecutiveReport data={selectedStats} branding={branding} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientDetailView;
