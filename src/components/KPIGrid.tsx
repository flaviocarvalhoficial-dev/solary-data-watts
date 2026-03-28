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
            sub: (selectedAC as any).baseline_bill_value ? 'Economia Real (Marco Zero)' : 'Geração vs Tarifa',
            color: 'var(--color-status-success-text)',
            tooltip: (selectedAC as any).baseline_bill_value
                ? 'Valor economizado baseado na fatura de referência (Marco Zero).'
                : 'Valor economizado multiplicando a energia compensada pela tarifa vigente.'
        },
        {
            label: 'Redução %',
            value: selectedStats ? `${Math.round(selectedStats.resultado.reducao_percentual)}%` : '—',
            sub: 'Impacto na Fatura',
            color: '#059669',
            tooltip: 'Percentual de redução na conta de energia comparando com a fatura base (Marco Zero).'
        },
        {
            label: 'Saldo de Créditos',
            value: selectedBill ? `${(selectedBill.credit_balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh` : '—',
            sub: 'Recuperado da fatura',
            color: 'var(--color-text-primary)',
            tooltip: 'Acúmulo de energia injetada disponível para uso em ciclos futuros.'
        }
    ];

    const progressValue = selectedStats ? Math.min(Math.max(selectedStats.resultado.progresso_payback || 0, 0), 100) : 0;
    const tempoRestante = selectedStats
        ? `${Math.floor(selectedStats.resultado.tempo_restante_meses / 12)} anos e ${Math.round(selectedStats.resultado.tempo_restante_meses % 12)} meses`
        : '—';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <style>
                {`
                @keyframes progress-fill-grid {
                    from { width: 0%; }
                    to { width: ${progressValue}%; }
                }
                @keyframes shimmer-grid {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .payback-premium-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9)) !important;
                    border: 1px solid rgba(16, 185, 129, 0.2) !important;
                    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08) !important;
                    position: relative;
                    overflow: hidden;
                }
                .grid-progress-container {
                    position: relative;
                    background: #f1f5f9;
                    border-radius: 999px;
                    height: 8px;
                    overflow: hidden;
                    margin: 12px 0 8px 0;
                }
                .grid-progress-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    border-radius: 999px;
                    animation: progress-fill-grid 1.5s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }
                .grid-progress-shimmer {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
                    animation: shimmer-grid 2s infinite ease-in-out;
                }
                `}
            </style>

            {kpis.map((k, i) => (
                <div key={i} className="card" style={{ padding: '16px' }} data-tooltip={k.tooltip}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{k.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: k.color, marginBottom: '2px' }}>{k.value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{k.sub}</div>
                </div>
            ))}

            {/* Payback PREMIUM Card */}
            <div className="card payback-premium-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column' }} data-tooltip="Estimativa baseada no investimento inicial e economia mensal média.">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payback Est.</div>
                    {selectedStats && (
                        <span style={{ fontSize: '10px', background: '#d1fae5', color: '#059669', padding: '2px 6px', borderRadius: '8px', fontWeight: 700 }}>
                            {Math.round(progressValue)}%
                        </span>
                    )}
                </div>

                <div style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', marginBottom: '2px' }}>
                    {selectedStats ? selectedStats.resultado.payback_texto_aproximado : '—'}
                </div>

                {selectedStats ? (
                    <>
                        <div className="grid-progress-container">
                            <div className="grid-progress-fill">
                                <div className="grid-progress-shimmer"></div>
                            </div>
                        </div>
                        <div style={{ fontSize: '11px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ opacity: 0.6, fontSize: '10px' }}>⏳</span>
                                <span>Faltam: <b style={{ color: '#0f172a' }}>{tempoRestante}</b></span>
                            </div>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: 'auto', paddingTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ opacity: 0.5, fontSize: '10px' }}>📅</span>
                            <span>Conclusão: <b style={{ color: '#1e293b' }}>{selectedStats.resultado.data_estimada_retorno}</b></span>
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Aguardando cálculos...</div>
                )}
            </div>
        </div>
    );
};

