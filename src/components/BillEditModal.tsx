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
    if (!isOpen) return null;

    const parseFormattedNumber = (val: string) => {
        if (!val) return 0;
        const normalized = val.replace(',', '.');
        return parseFloat(normalized) || 0;
    };

    const formFields = [
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
                                        onClick={() => setEditData((p: any) => ({ ...p, tariff_kwh: 0.95 }))}
                                        style={{ fontSize: '10px', background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Sugerir (R$ 0,95)
                                    </button>
                                )}
                            </div>
                            <input
                                type={type}
                                value={editData[field] ?? (field === 'generation' ? selectedAC.generation : '')}
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
                    <button className="btn btn-primary" style={{ flex: 1, padding: '12px' }} onClick={onSave}>Salvar Relatório</button>
                    <button className="btn btn-outline" style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid var(--color-border)' }} onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};
