import React from 'react';
import { X } from 'lucide-react';

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

    const handleFieldChange = (field: string, val: string) => {
        // Update local display state
        setLocalState((p: any) => ({ ...p, [field]: val }));

        // Update parent state with parsed numeric value
        const numericVal = field === 'competency' ? val : parseBrazilianNumber(val);
        setEditData((p: any) => ({ ...p, [field]: numericVal }));
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
    ];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,255,255,0.98)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '48px', overflowY: 'auto' }}>
            <div style={{ width: '100%', maxWidth: '540px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h3 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                            {selectedBill ? 'Ajustar Dados da Fatura' : 'Lançamento Manual'}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Preencha os campos conforme a fatura da concessionária.</p>
                    </div>
                    <button type="button" onClick={onClose} style={{ background: 'var(--color-bg-base)', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {formFields.map(({ label, field, type, fullWidth, hint }) => (
                        <div key={field} style={{ gridColumn: fullWidth ? 'span 2' : 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>{label}</label>
                                {field === 'tariff_kwh' && !editData[field] && (
                                    <button
                                        onClick={() => handleFieldChange('tariff_kwh', '0,95')}
                                        style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Sugerir (R$ 0,95)
                                    </button>
                                )}
                            </div>
                            <input
                                type={type}
                                value={localState[field] ?? ''}
                                onChange={e => handleFieldChange(field, e.target.value)}
                                placeholder={hint}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '14px', background: 'var(--color-bg-base)' }}
                            />
                        </div>
                    ))}
                </div>

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
                                {(editData.credit_balance || 0).toFixed(2)} kWh
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                    <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={onSave}>Salvar Relatório</button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--color-border)' }} onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};
