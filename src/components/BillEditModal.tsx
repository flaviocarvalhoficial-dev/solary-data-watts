import React from 'react';
import { X } from 'lucide-react';
import WattsButton from './ui/WattsButton';
import StatusBadge from './ui/StatusBadge';

interface BillEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    editData: any;
    setEditData: (data: any) => void;
    onSave: () => void;
    selectedAC: any;
    selectedBill: any;
}

export const BillEditModal: React.FC<BillEditModalProps> = ({
    isOpen, onClose, editData, setEditData, onSave, selectedAC, selectedBill
}) => {
    // Local state to handle typing decimals (dots/commas) without immediate numeric coercion
    const [localState, setLocalState] = React.useState<any>({});

    React.useEffect(() => {
        if (isOpen) {
            const initial: any = { ...editData };
            // Populate initial values, ensuring generation comes from selectedAC if not in editData
            if (initial.generation === undefined) initial.generation = selectedAC.generation;

            // Convert numbers to formatted strings for the input
            const formatted: any = {};
            Object.keys(initial).forEach(key => {
                const val = initial[key];
                if (typeof val === 'number' && key !== 'competency') {
                    formatted[key] = val.toString().replace('.', ',');
                } else if ((key === 'activation_date' || key === 'issue_date') && val && typeof val === 'string' && val.includes('-')) {
                    // YYYY-MM-DD -> DD/MM/YYYY
                    const [y, m, d] = val.split('-');
                    formatted[key] = `${d}/${m}/${y}`;
                } else {
                    formatted[key] = val;
                }
            });
            setLocalState(formatted);
        }
    }, [isOpen]); // Only run when modal opens/closes

    if (!isOpen) return null;

    const parseBrazilianNumber = (val: string) => {
        if (!val) return 0;

        let normalized = val.trim();

        // Se tem vírgula, assume padrão BR (ponto é milhar, vírgula é decimal)
        if (normalized.includes(',')) {
            normalized = normalized.replace(/\./g, '').replace(',', '.');
        } else {
            // Se não tem vírgula mas tem um único ponto, pode ser decimal (padrão US/Dev)
            // Verificamos se há apenas um ponto e se ele não está no início do número
            const dotCount = (normalized.match(/\./g) || []).length;
            if (dotCount === 1) {
                // Mantém o ponto como decimal
            } else if (dotCount > 1) {
                // Múltiplos pontos indicam separador de milhar (1.234.567) -> Remove todos
                normalized = normalized.replace(/\./g, '');
            }
        }

        return parseFloat(normalized) || 0;
    };

    const parseBrazilianDate = (val: string) => {
        if (!val || !val.includes('/')) return val; // Retorna como está se não parecer data BR
        const parts = val.split('/');
        if (parts.length === 3) {
            const [d, m, y] = parts;
            if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }
        return val;
    };

    const handleFieldChange = (field: string, val: string) => {
        // Update local display state
        setLocalState((p: any) => ({ ...p, [field]: val }));

        // Update parent state with parsed value
        let finalVal: any = val;
        if (field === 'competency') {
            finalVal = val;
        } else if (field === 'activation_date' || field === 'issue_date') {
            finalVal = parseBrazilianDate(val);
        } else {
            finalVal = parseBrazilianNumber(val);
        }
        setEditData((p: any) => ({ ...p, [field]: finalVal }));
    };

    const formFields = [
        { label: 'Competência', field: 'competency', type: 'text', fullWidth: true, hint: 'Mês e ano da conta (Ex: 03/2026)' },
        { label: 'Custo Total (R$)', field: 'total_value', type: 'text', hint: 'Ex: 1541,53' },
        { label: 'Geração Solar (kWh)', field: 'generation', type: 'text', hint: 'Ex: 1541,53' },
        { label: 'Consumo da Rede (kWh)', field: 'consumption', type: 'text', hint: 'Energia da concessionária.' },
        { label: 'Compensada (kWh)', field: 'compensated_energy', type: 'text', hint: 'Faturamento energy injetada.' },
        { label: 'Injetada (kWh)', field: 'injected_energy', type: 'text', hint: 'Excedente total enviado.' },
        { label: 'Tarifa (R$/kWh)', field: 'tariff_kwh', type: 'text', hint: 'Ex: 0,9582' },
        { label: 'Saldo Créditos (kWh)', field: 'credit_balance', type: 'text', hint: 'Saldo total acumulado.' },
        { label: 'CIP / Iluminação (R$)', field: 'street_lighting', type: 'text', fullWidth: true, hint: 'Taxa IP.' },
        { label: 'Investimento (R$)', field: 'investment', type: 'text', hint: 'Valor total do projeto. Ex: 15.000,00' },
        { label: 'Data de Ativação', field: 'activation_date', type: 'text', hint: 'Ex: 01/01/2024' },
        { label: 'Data de Emissão (Fatura)', field: 'issue_date', type: 'text', fullWidth: true, hint: 'Data da conta. Ex: 15/03/2026' },
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px', overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a' }}>
                            {selectedBill ? 'Ajustar Dados da Fatura' : 'Lançamento Manual'}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b' }}>Preencha os campos conforme a fatura da concessionária para gerar o relatório.</p>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* SEÇÃO 1: DADOS DA FATURA ATUAL */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1' }}></div>
                            <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dados da Fatura Mensal (Corrente)</h4>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                            {[
                                { label: 'Competência', field: 'competency', type: 'text', col: 'span 2', hint: 'Mês/Ano (Ex: 03/2026)' },
                                { label: 'Emissão', field: 'issue_date', type: 'text', col: 'span 2', hint: 'Ex: 15/03/2026' },
                                { label: 'Tarifa (R$/kWh)', field: 'tariff_kwh', type: 'text', col: 'span 1', hint: 'Ex: 0,9582' },
                                { label: 'Pago (R$)', field: 'total_value', type: 'text', col: 'span 1', hint: 'Valor real' },
                                { label: 'CIP / Ilum. (R$)', field: 'street_lighting', type: 'text', col: 'span 2', hint: 'Taxa IP' },
                                { label: 'Geração Solar', field: 'generation', type: 'text', col: 'span 1', hint: 'Total kWh' },
                                { label: 'Consumo Rede', field: 'consumption', type: 'text', col: 'span 1', hint: 'Total kWh' },
                                { label: 'Compensada', field: 'compensated_energy', type: 'text', col: 'span 1', hint: 'Total kWh' },
                                { label: 'Injetada', field: 'injected_energy', type: 'text', col: 'span 1', hint: 'Total kWh' },
                                { label: 'Saldo Créditos', field: 'credit_balance', type: 'text', col: 'span 4', hint: 'Saldo total acumulado' },
                            ].map(({ label, field, type, col, hint }) => (
                                <div key={field} style={{ gridColumn: col }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>{label}</label>
                                    <input
                                        type={type}
                                        value={localState[field] ?? ''}
                                        onChange={e => handleFieldChange(field, e.target.value)}
                                        placeholder={hint}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f8fafc', transition: 'all 0.2s', outline: 'none' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* SEÇÃO 2: MARCO ZERO */}
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div>
                                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marco Zero</h4>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { label: 'Valor Pré-Solar (R$)', field: 'baseline_bill_value', type: 'text', hint: 'Ex: 525,77' },
                                    { label: 'Data Fatura Ref.', field: 'baseline_bill_date', type: 'text', hint: 'Ex: 10/01/2024' },
                                ].map(({ label, field, type, hint }) => (
                                    <div key={field}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>{label}</label>
                                        <input
                                            type={type}
                                            value={localState[field] ?? ''}
                                            onChange={e => handleFieldChange(field, e.target.value)}
                                            placeholder={hint}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fffef3', transition: 'all 0.2s' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SEÇÃO 3: CONFIGURAÇÃO DO SISTEMA */}
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
                                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configuração Global</h4>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {[
                                    { label: 'Investimento (R$)', field: 'investment', type: 'text', hint: 'Custo total' },
                                    { label: 'Ativação', field: 'activation_date', type: 'text', hint: '01/01/2024' },
                                ].map(({ label, field, type, hint }) => (
                                    <div key={field}>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>{label}</label>
                                        <input
                                            type={type}
                                            value={localState[field] ?? ''}
                                            onChange={e => handleFieldChange(field, e.target.value)}
                                            placeholder={hint}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#f0fdf4', transition: 'all 0.2s' }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                <div style={{ marginTop: '32px', padding: '24px', background: 'var(--color-status-success-bg)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-status-success-text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Resultado Estimado (Simulação)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                        {(() => {
                            const val_atual = editData.total_value || 0;
                            const compensada = editData.compensated_energy || 0;
                            const consumo_rede = editData.consumption || 0;
                            const tarifa = editData.tariff_kwh || selectedAC.current_kwh_value || 0.95;
                            const ip = editData.street_lighting || 0;
                            const baseline_manual = editData.baseline_bill_value;

                            // Baseline: O que pagaria sem solar
                            // Se o usuário preencheu o "Marco Zero" manualmente, usamos ele como fatura base.
                            // Caso contrário, usamos o cálculo teórico: (Rede + Compensada) * Tarifa + IP
                            const fatura_sem_solar = (baseline_manual !== undefined && baseline_manual !== null && baseline_manual > 0)
                                ? baseline_manual
                                : ((consumo_rede + compensada) * tarifa) + ip;

                            // Economia: Delta entre o que pagaria (baseline) e o que paga agora
                            const economia = Math.max(0, fatura_sem_solar - val_atual);
                            const reducao = fatura_sem_solar > 0 ? (economia / fatura_sem_solar) * 100 : 0;

                            return (
                                <>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                                            {baseline_manual > 0 ? 'Fatura Base (Marco Zero)' : 'Fatura s/ Solar (Teórica)'}
                                        </p>
                                        <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            R$ {fatura_sem_solar.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Economia Real</p>
                                        <p style={{ fontSize: '18px', fontWeight: 700, color: '#10B981' }}>
                                            R$ {economia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Redução %</p>
                                        <p style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                            {Math.round(reducao)}%
                                        </p>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                    <WattsButton variant="primary" style={{ flex: 1 }} onClick={onSave}>Salvar Relatório</WattsButton>
                    <WattsButton variant="outline" style={{ flex: 1 }} onClick={onClose}>Cancelar</WattsButton>
                </div>
            </div>
        </div>
    );
};
