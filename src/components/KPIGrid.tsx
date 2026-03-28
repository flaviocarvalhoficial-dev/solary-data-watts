import React from 'react';
import { ActiveClient, FinalReportObject } from '../utils/solarHelpers';
import { Bill } from '../hooks/useBills';
import StatCard from './ui/StatCard';
import { TrendingUp, Clock, DollarSign, Battery } from 'lucide-react';

interface KPIGridProps {
    selectedAC: ActiveClient;
    selectedBill: Bill | null;
    selectedStats: FinalReportObject | null;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ selectedAC, selectedBill, selectedStats }) => {
    const progressValue = selectedStats ? Math.min(Math.max(selectedStats.resultado.progresso_payback || 0, 0), 100) : 0;
    const tempoRestante = selectedStats
        ? `${Math.floor(selectedStats.resultado.tempo_restante_meses / 12)} anos e ${Math.round(selectedStats.resultado.tempo_restante_meses % 12)} meses`
        : '—';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <StatCard
                label="Geração Reportada"
                value={selectedAC.generation > 0 ? `${selectedAC.generation.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh` : '—'}
                subLabel="Total mensal (API)"
                tooltip="Volume total de energia registrado pela plataforma de monitoramento neste ciclo."
                color="var(--color-primary)"
                icon={<Battery size={24} />}
            />

            <StatCard
                label="Economia Estimada"
                value={selectedStats ? `R$ ${selectedStats.resultado.economia_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
                subLabel={(selectedAC as any).baseline_bill_value ? 'Economia Real (Marco Zero)' : 'Geração vs Tarifa'}
                tooltip={(selectedAC as any).baseline_bill_value
                    ? 'Valor economizado baseado na fatura de referência (Marco Zero).'
                    : 'Valor economizado multiplicando a energia compensada pela tarifa vigente.'}
                icon={<DollarSign size={24} />}
                color="var(--color-status-success-text)"
            />

            <StatCard
                label="Redução %"
                value={selectedStats ? `${Math.round(selectedStats.resultado.reducao_percentual ?? 0)}%` : '—'}
                subLabel="Impacto na Fatura"
                tooltip="Percentual de redução na conta de energia comparando com a fatura base (Marco Zero)."
                trend={selectedStats ? { label: `${Math.round(selectedStats.resultado.reducao_percentual ?? 0)}% Redução`, type: 'success' } : undefined}
                icon={<TrendingUp size={24} />}
            />

            <StatCard
                label="Payback Estimado"
                value={selectedStats ? selectedStats.resultado.payback_texto_restante : '—'}
                subLabel={selectedStats ? `Conclusão: ${selectedStats.resultado.data_estimada_retorno}` : 'Aguardando cálculos...'}
                tooltip="Estimativa de tempo restante baseada no investimento inicial e economia mensal média."
                chartPosition="bottom"
                trend={selectedStats ? { label: `${Math.round(progressValue)}% Completo`, type: 'success' } : undefined}
                icon={<Clock size={24} />}
                chart={
                    selectedStats && (
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{
                                    width: `${progressValue}%`,
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #10b981, #34d399)',
                                    animation: 'progress-fill-grid 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards'
                                }} />
                            </div>
                        </div>
                    )
                }
            />
        </div>
    );
};

