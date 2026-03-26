import React from 'react';
import { History } from 'lucide-react';
import { Bill } from '../hooks/useBills';

interface BillSummaryProps {
    bill: Bill | null;
    onReset: () => void;
    onEdit: () => void;
    selectedCompetency: string;
}

export const BillSummary: React.FC<BillSummaryProps> = ({ bill, onReset, onEdit, selectedCompetency }) => {
    return (
        <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Dados da Fatura</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={onReset} style={{ border: 'none', background: 'var(--color-bg-base)', color: 'var(--color-status-danger-text)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Reset</button>
                    <button onClick={onEdit} style={{ border: 'none', background: '#1A1A1A', color: '#FFF', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
                </div>
            </div>

            {bill ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { label: 'Valor Pago', value: `R$ ${bill.total_value.toFixed(2)}` },
                        { label: 'Energia Injetada', value: `${bill.injected_energy || 0} kWh` },
                        { label: 'Energia Compensada', value: `${bill.compensated_energy || 0} kWh` },
                        { label: 'Saldo de Créditos', value: `${bill.credit_balance || 0} kWh` },
                        { label: 'Tarifa (R$)', value: `${bill.tariff_kwh?.toFixed(2) || '—'}` },
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
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Fatura pendente para {selectedCompetency}</p>
                </div>
            )}
        </div>
    );
};
