import React from 'react';
import { ActiveClient, FinalReportObject } from '../utils/solarHelpers';
import { Bill } from '../hooks/useBills';

interface KPIGridProps {
    selectedAC: ActiveClient;
    selectedBill: Bill | null;
    selectedStats: FinalReportObject | null;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ selectedAC, selectedBill, selectedStats }) => {
    const kpis = [
        {
            label: 'Geração Reportada',
            value: selectedAC.generation > 0 ? `${selectedAC.generation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh` : '—',
            sub: 'Total mensal (API)',
            color: 'var(--color-primary)',
            tooltip: 'Volume total de energia registrado pela plataforma de monitoramento neste ciclo.'
        },
        {
            label: 'Economia Estimada',
            value: selectedStats ? `R$ ${selectedStats.resultado.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
            sub: 'Geração vs Tarifa',
            color: 'var(--color-status-success-text)',
            tooltip: 'Valor economizado multiplicando a energia compensada pela tarifa vigente.'
        },
        {
            label: 'Saldo de Créditos',
            value: selectedBill ? `${(selectedBill.credit_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh` : '—',
            sub: 'Recuperado da fatura',
            color: 'var(--color-text-primary)',
            tooltip: 'Acúmulo de energia injetada disponível para uso em ciclos futuros.'
        },
        {
            label: 'Payback Est.',
            value: selectedStats ? selectedStats.resultado.payback_texto_aproximado : '—',
            sub: 'Tempo de retorno',
            color: 'var(--color-text-primary)',
            tooltip: 'Estimativa baseada no investimento inicial e economia mensal média.'
        },
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {kpis.map((k, i) => (
                <div key={i} className="card" style={{ padding: '20px' }} data-tooltip={k.tooltip}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: '12px' }}>{k.label}</div>
                    <div style={{ fontSize: '28px', fontWeight: 600, color: k.color, marginBottom: '4px' }}>{k.value}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{k.sub}</div>
                </div>
            ))}
        </div>
    );
};
