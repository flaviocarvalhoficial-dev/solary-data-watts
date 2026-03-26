import React, { useState } from 'react';

interface PerformanceAnalysisProps {
    generation: number;
    compensatedEnergy: number;
    gridConsumption: number;
}

export const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({
    generation, compensatedEnergy, gridConsumption
}) => {
    const [viewType, setViewType] = useState<'bar' | 'line'>('bar');

    return (
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
                    {[
                        { label: 'Gerado', val: generation, col: 'var(--color-primary)' },
                        { label: 'Compensado', val: compensatedEnergy, col: 'var(--color-status-success-text)' },
                        { label: 'Grid', val: gridConsumption, col: 'var(--color-text-muted)' }
                    ].map((b, i) => {
                        const maxVal = Math.max(generation, gridConsumption, 100);
                        const height = (b.val / maxVal) * 120;
                        return (b.val > 0 || b.label === 'Gerado') && (
                            <div key={b.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: b.col }}>{b.val.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</div>
                                <div
                                    className="animate-bar"
                                    style={{
                                        width: '32px',
                                        '--target-height': `${height}px`,
                                        background: b.col,
                                        borderRadius: '4px 4px 0 0',
                                        animationDelay: `${i * 0.1}s`,
                                        opacity: 0
                                    } as any}
                                />
                                <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.label}</div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div style={{ height: '240px', background: 'var(--color-bg-base)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border)' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <svg width="100%" height="100%" viewBox="0 0 500 120" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                            <defs>
                                <linearGradient id="areaGradientModern" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
                                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                            {[0, 30, 60, 90, 120].map(y => (
                                <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="var(--color-border)" strokeWidth="0.3" strokeOpacity="0.3" />
                            ))}
                            <path
                                d="M 0 120 C 50 120, 100 80, 150 70 C 200 60, 250 100, 300 40 C 350 -10, 450 0, 500 20 L 500 120 Z"
                                fill="url(#areaGradientModern)"
                                className="chart-area-smooth"
                                style={{ opacity: 0.12 }}
                            />
                            <path
                                d="M 0 120 C 50 120, 100 80, 150 70 C 200 60, 250 100, 300 40 C 350 -10, 450 0, 500 20"
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="chart-path-smooth"
                            />
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
    );
};
