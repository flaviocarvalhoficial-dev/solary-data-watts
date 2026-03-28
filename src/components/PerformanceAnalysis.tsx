import React, { useState, useEffect } from 'react';
import WattsMascot from './WattsMascot';

interface PerformanceAnalysisProps {
    generation: number;
    compensatedEnergy: number;
    gridConsumption: number;
    injectedEnergy: number;
    history?: { label: string, value: number }[];
}

export const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({
    generation, compensatedEnergy, gridConsumption, injectedEnergy, history = []
}) => {
    const [viewType, setViewType] = useState<'bar' | 'line'>('bar');
    const [activeSlide, setActiveSlide] = useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(260);

    // Cálculos de Balanço Energético
    const autoconsumo = Math.max(generation - injectedEnergy, 0);
    const consumoTotal = autoconsumo + gridConsumption;

    const slides = [
        {
            tag: 'Impacto Ambiental',
            content: (
                <div style={{ display: 'flex', gap: '24px', marginTop: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>CO2 Evitado</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {(generation * 0.403).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} <span style={{ fontSize: '10px' }}>kg</span>
                        </span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--color-border-light)', alignSelf: 'center' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Árvores Salvas</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            {(generation * 0.012).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}
                        </span>
                    </div>
                    <div style={{ width: '1px', height: '24px', background: 'var(--color-border-light)', alignSelf: 'center' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Autossuficiência</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>
                            {Math.min((generation / (consumoTotal || 1)) * 100, 100).toFixed(0)}%
                        </span>
                    </div>
                </div>
            )
        },
        {
            tag: 'Insight do Watts',
            content: (
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                    {(generation >= consumoTotal)
                        ? "Excelente! Sua usina produziu o suficiente para cobrir todo o consumo. Você está gerando lucro!"
                        : "Quase lá! Sua produção solar cobriu a maior parte do seu gasto de energia este mês."}
                </div>
            )
        },
        {
            tag: 'Dica de Eficiência',
            content: (
                <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                    💡 <span style={{ fontWeight: 600 }}>Dica:</span> Tente concentrar o uso de aparelhos pesados entre 10h e 15h para maximizar o uso direto da energia solar.
                </div>
            )
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [slides.length]);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Diminuímos os paddings vertical (32+32) para a área útil
                setContainerHeight(entry.contentRect.height);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Lógica para o Gráfico de Linha Dinâmico
    const renderLineChart = () => {
        // Fallback para mockup se não houver dados reais suficientes
        const data = (history && history.length >= 2) ? history : [
            { label: 'Jan', value: 120 },
            { label: 'Fev', value: 180 },
            { label: 'Mar', value: 160 },
            { label: 'Abr', value: 240 },
            { label: 'Mai', value: 310 },
            { label: 'Jun', value: 280 }
        ];

        const maxVal = Math.max(...data.map(h => h.value), 100) * 1.2;
        const width = 500;
        const height = 120;
        const points = data.map((h, i) => ({
            x: (i / (data.length - 1)) * width,
            y: height - (h.value / maxVal) * height
        }));

        // Gerar comando de path suave (Bezier)
        let pathData = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            const cp1x = p0.x + (p1.x - p0.x) / 2;
            pathData += ` C ${cp1x} ${p0.y}, ${cp1x} ${p1.y}, ${p1.x} ${p1.y}`;
        }

        const areaPathData = `${pathData} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

        return (
            <>
                <div style={{ flex: 1, position: 'relative' }}>
                    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="areaGradientModern" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="1" />
                                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {[0, 0.25, 0.5, 0.75, 1].map(t => (
                            <line key={t} x1="0" y1={height * t} x2={width} y2={height * t} stroke="var(--color-border)" strokeWidth="0.5" strokeOpacity="0.2" />
                        ))}
                        <path d={areaPathData} fill="url(#areaGradientModern)" style={{ opacity: 0.12 }} />
                        <path d={pathData} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 4px rgba(253, 186, 116, 0.4))' }} />
                        {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="4" fill="#FFF" stroke="var(--color-primary)" strokeWidth="2.5" />
                        ))}
                    </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
                    {data.map((h, i) => (
                        <span key={i} style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h.label}</span>
                    ))}
                </div>
            </>
        );
    };

    return (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                <div ref={containerRef} style={{ position: 'relative', flex: 1, minHeight: '260px', background: 'var(--color-bg-base)', borderRadius: '12px', padding: '32px 16px 40px 56px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', border: '1px solid var(--color-border-light)' }}>

                    {/* Linhas de Grade e Eixo Y */}
                    {(() => {
                        const maxValRaw = Math.max(generation, consumoTotal, gridConsumption, 100);
                        const maxChartVal = maxValRaw * 1.4;
                        const chartAreaHeight = containerHeight - 32 - 48; // Padding top (32) + Espaço labels (48)

                        return (
                            <>
                                <div style={{ position: 'absolute', inset: `32px 16px ${containerHeight - 32 - chartAreaHeight}px 56px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                                    {[1, 0.75, 0.5, 0.25, 0].map((tick, i) => (
                                        <div key={i} style={{ width: '100%', height: '1px', background: 'var(--color-border)', opacity: 0.2, position: 'relative' }}>
                                            <span style={{ position: 'absolute', left: '-44px', top: '-6px', fontSize: '9px', fontWeight: 700, color: 'var(--color-text-muted)' }}>
                                                {Math.round(maxChartVal * tick)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Header labels ... lines 116-127 ... (unchanged in this block move) */}
                                <div style={{ position: 'absolute', top: '16px', left: '56px', right: '16px', height: '24px', display: 'flex', gap: '8px' }}>
                                    <div style={{ flex: 3.5, borderBottom: '1px solid #fdba74', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ position: 'absolute', left: 0, bottom: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#fdba74' }}></div>
                                        <div style={{ position: 'absolute', right: 0, bottom: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#fdba74' }}></div>
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#9a3412', textTransform: 'uppercase', background: 'var(--color-bg-base)', padding: '0 8px', letterSpacing: '0.05em' }}>Origem da Energia</span>
                                    </div>
                                    <div style={{ flex: 2.5, borderBottom: '1px solid #ddd6fe', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ position: 'absolute', left: 0, bottom: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#ddd6fe' }}></div>
                                        <div style={{ position: 'absolute', right: 0, bottom: '-3px', width: '6px', height: '6px', borderRadius: '50%', background: '#ddd6fe' }}></div>
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#5b21b6', textTransform: 'uppercase', background: 'var(--color-bg-base)', padding: '0 8px', letterSpacing: '0.05em' }}>Destino Final</span>
                                    </div>
                                    <div style={{ flex: 3 }} /> {/* Espaço para o card da direita */}
                                </div>

                                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'flex-end', gap: '0' }}>
                                    {/* Container das Barras (72% da largura) */}
                                    <div style={{ display: 'flex', flex: 7.2, alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
                                        {[
                                            { label: 'Gerado', val: generation, col: 'var(--color-primary)', hint: 'Total produzido pela usina', desc: 'Produção Usina', group: 'origem' },
                                            { label: 'Auto (Direto)', val: autoconsumo, col: '#10b981', hint: 'Uso imediato sem ir para a rede', desc: 'Energia Grátis', group: 'origem' },
                                            { label: 'Compensado', val: compensatedEnergy, col: '#34d399', hint: 'Créditos recuperados da rede', desc: 'Uso de Créditos', group: 'origem' },
                                            { label: 'Carga Total', val: consumoTotal, col: '#8b5cf6', hint: 'Necessidade real da casa', desc: 'Consumo Real', group: 'destino' },
                                            { label: 'Grid (Pago)', val: gridConsumption, col: '#64748b', hint: 'O que sobrou para pagar', desc: 'Compra da Rede', group: 'destino' }
                                        ].map((b, i) => {
                                            const height = (b.val / maxChartVal) * chartAreaHeight;
                                            return (
                                                <React.Fragment key={b.label}>
                                                    {i === 3 && <div style={{ width: '20px' }} />} {/* GAP entre origem e destino reduzido */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 1, flex: 1, minWidth: '40px' }} title={b.hint}>
                                                        <div style={{ fontSize: '10px', fontWeight: 800, color: b.col, whiteSpace: 'nowrap' }}>
                                                            {b.val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} <span style={{ fontSize: '7px', opacity: 0.8 }}>kWh</span>
                                                        </div>
                                                        <div
                                                            className="animate-bar"
                                                            style={{
                                                                width: '32px',
                                                                '--target-height': `${height}px`,
                                                                height: '0',
                                                                background: b.col,
                                                                borderRadius: '6px 6px 0 0',
                                                                animationDelay: `${i * 0.1}s`,
                                                                opacity: 0,
                                                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                                                            } as any}
                                                        />
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', paddingBottom: '0' }}>
                                                            <div style={{ fontSize: '8px', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.02em', textAlign: 'center' }}>{b.label}</div>
                                                            <div style={{ fontSize: '7px', color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 600 }}>{b.desc}</div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>

                                    {/* Card de Balanço (28% da largura) */}
                                    <div style={{ flex: 2.8, height: '100%', paddingLeft: '24px', display: 'flex', alignItems: 'flex-start', paddingTop: '16px' }}>
                                        <div style={{
                                            width: '100%',
                                            background: 'var(--color-bg-muted)',
                                            borderRadius: '12px',
                                            padding: '16px',
                                            border: '1px solid var(--color-border)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '12px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <div style={{ width: '3px', height: '14px', background: 'var(--color-primary)', borderRadius: '2px' }} />
                                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Balanço Energético</span>
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                                    {Math.abs(generation - consumoTotal).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                                                    <span style={{ fontSize: '8px', fontWeight: 600 }}>kWh</span>
                                                    <span style={{
                                                        fontSize: '9px',
                                                        fontWeight: 700,
                                                        color: (generation - consumoTotal) >= 0 ? '#10b981' : '#ef4444',
                                                        marginLeft: 'auto'
                                                    }}>
                                                        {(generation - consumoTotal) >= 0 ? 'SOBRA' : 'DÉFICIT'}
                                                    </span>
                                                </div>
                                                <div style={{ height: '4px', width: '100%', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        height: '100%',
                                                        width: `${Math.min((generation / (consumoTotal || 1)) * 100, 100)}%`,
                                                        background: (generation - consumoTotal) >= 0 ? '#10b981' : '#f59e0b',
                                                        borderRadius: '2px'
                                                    }} />
                                                </div>
                                            </div>

                                            <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', lineHeight: '1.4', margin: 0 }}>
                                                {generation >= consumoTotal
                                                    ? `Seu sistema produziu o suficiente para cobrir o consumo e ainda gerou um crédito de ${Math.abs(generation - consumoTotal).toFixed(0)} kWh para uso futuro.`
                                                    : `Neste período, a geração foi menor que o consumo. A diferença de ${Math.abs(generation - consumoTotal).toFixed(0)} kWh foi suprida pela rede e créditos.`}
                                            </p>

                                            <div style={{
                                                fontSize: '9px',
                                                fontWeight: 600,
                                                color: 'var(--color-text-xmuted)',
                                                background: 'var(--color-bg-base)',
                                                padding: '6px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--color-border-light)',
                                                textAlign: 'center'
                                            }}>
                                                {generation.toFixed(0)} (gerado) - {consumoTotal.toFixed(0)} (puxado) = {(generation - consumoTotal).toFixed(0)} kWh
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            ) : (
                <div style={{ height: '300px', background: 'var(--color-bg-base)', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', border: '1px solid var(--color-border-light)' }}>
                    {/* Header para o Histórico */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></div>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>Histórico de Geração (kWh)</h4>
                        <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500, marginLeft: 'auto' }}>* Baseado em faturas reais</span>
                    </div>

                    {renderLineChart()}
                </div>
            )}

            {/* FASE 6: MASCOTE + INSIGHTS CAROUSEL */}
            <div style={{
                marginTop: '24px',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                background: 'rgba(99, 102, 241, 0.03)',
                padding: '16px 20px',
                borderRadius: '16px',
                border: '1px solid rgba(99, 102, 241, 0.08)',
                minHeight: '100px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ flexShrink: 0, position: 'relative', zIndex: 2 }}>
                    <div style={{
                        position: 'absolute',
                        inset: '-10px',
                        background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                        zIndex: -1
                    }} />
                    <WattsMascot
                        state={(generation - consumoTotal) >= 0 ? 'feliz' : 'normal'}
                        size={70}
                    />
                </div>

                <div style={{ flex: 1, position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '10px',
                                fontWeight: 800,
                                color: 'var(--color-primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                background: 'rgba(99, 102, 241, 0.1)',
                                padding: '2px 8px',
                                borderRadius: '10px'
                            }}>
                                {slides[activeSlide].tag}
                            </span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--color-border-light)' }} />
                            <div style={{ display: 'flex', gap: '4px' }}>
                                {slides.map((_, i) => (
                                    <div key={i} style={{
                                        width: i === activeSlide ? '12px' : '4px',
                                        height: '4px',
                                        borderRadius: '2px',
                                        background: i === activeSlide ? 'var(--color-primary)' : 'var(--color-border)',
                                        transition: 'all 0.3s ease'
                                    }} />
                                ))}
                            </div>
                        </div>

                        <div key={activeSlide} style={{ animation: 'fade-in-slide 0.5s ease-out' }}>
                            {slides[activeSlide].content}
                        </div>
                    </div>
                </div>

                {/* Decorative background element */}
                <div style={{
                    position: 'absolute',
                    right: '-20px',
                    bottom: '-20px',
                    width: '100px',
                    height: '100px',
                    background: 'var(--color-primary)',
                    opacity: 0.03,
                    borderRadius: '50%'
                }} />
            </div>
        </div>
    );
};
