import React from 'react';
import { FinalReportObject } from '../utils/solarHelpers';
import {
    Calendar, User, Home, Zap, TrendingUp, BarChart2,
    Clock, Wallet, CheckCircle2, AlertTriangle, ShieldCheck
} from 'lucide-react';

// import WattsLogo from './WattsLogo';

interface ExecutiveReportProps {
    data: FinalReportObject;
    branding?: {
        company_name: string;
        primary_color: string;
        logo_url: string;
        report_footer: string;
    };
}

const ExecutiveReport: React.FC<ExecutiveReportProps> = ({ data, branding }) => {
    const { resultado, dados_entrada, insights_operacionais, conclusao_executiva, flags_validacao } = data;

    // Fallbacks
    const primaryColor = branding?.primary_color || '#6366F1';
    const companyName = branding?.company_name || 'WATTS';
    const logoUrl = branding?.logo_url || '/logo.svg';
    const reportFooter = branding?.report_footer || 'Este relatório foi gerado automaticamente pelo sistema Watts.';

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    const formatPct = (val: number | null) =>
        val !== null ? `${val.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%` : 'N/A';

    // Medidas exatas para o A4 (800px de largura -> ~1132px de altura)
    const pageStyle: React.CSSProperties = {
        width: '800px',
        height: '1132px',
        padding: '60px 50px',
        background: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        color: 'var(--color-text-primary)',
        lineHeight: '1.5',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden',
        position: 'relative'
    };

    const sectionTitleStyle: React.CSSProperties = {
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        marginBottom: '16px',
        paddingLeft: '10px',
        letterSpacing: '0.05em'
    };

    return (
        <div id="executive-report-template" style={{ width: '800px', background: '#f5f5f5' }}>
            {/* PÁGINA 1: RESUMO ECONÔMICO E OPERACIONAL (PREENCHIMENTO TOTAL) */}
            <div style={pageStyle}>
                {/* 1. CABEÇALHO */}
                <header style={{
                    borderBottom: `2px solid ${primaryColor}`,
                    paddingBottom: '24px',
                    marginBottom: '40px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" style={{ height: '44px', width: 'auto' }} />
                        ) : (
                            <div style={{ padding: '8px', background: `${primaryColor}22`, borderRadius: '8px', color: primaryColor }}><TrendingUp size={28} /></div>
                        )}
                        <div>
                            <h1 style={{ color: primaryColor, fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{companyName}</h1>
                            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '2px', letterSpacing: '0.02em' }}>RELATÓRIO EXECUTIVO DE REDUÇÃO ENERGÉTICA</p>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '12px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{data.cliente}</div>
                        <div style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>CONTA CONTRATO: {data.uc} | {data.concessionaria}</div>
                        <div style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>
                            Competência: <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{data.competencia}</span>
                            {data.data_emissao_fatura && (
                                <> | Emitida em: <span style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>{data.data_emissao_fatura}</span></>
                            )}
                        </div>
                    </div>
                </header>

                {/* 2. DADOS PRINCIPAIS DO PROJETO */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ ...sectionTitleStyle, borderLeft: `3px solid ${primaryColor}` }}>
                        Dados Principais do Projeto
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                        {[
                            { label: 'Tempo Ativo', value: resultado.tempo_sistema_ativo, icon: <Clock size={16} /> },
                            { label: 'Investimento', value: formatCurrency(dados_entrada.financeiro.investimento_inicial), icon: <Wallet size={16} /> },
                            { label: 'Saldo Créditos', value: `${(resultado.saldo_creditos_kwh || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kWh`, icon: <Zap size={16} /> },
                            { label: 'Valor kWh Atual', value: formatCurrency(dados_entrada.financeiro.valor_kwh_atual), icon: <TrendingUp size={16} /> },
                        ].map((item, idx) => (
                            <div key={idx} style={{ background: 'var(--color-bg-muted)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.02em' }}>
                                    {item.icon} {item.label.toUpperCase()}
                                </div>
                                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. RESULTADO DO PROJETO */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ ...sectionTitleStyle, borderLeft: '3px solid #10B981' }}>
                        Resultado Econômico do Mês
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '20px', background: '#F0FDF4', padding: '28px', borderRadius: 'var(--radius-md)', border: '1px solid #DCFCE7', marginBottom: '24px' }}>
                        <div>
                            <p style={{ fontSize: '11px', color: '#166534', fontWeight: 700, marginBottom: '6px' }}>FATURA ANTERIOR</p>
                            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-xmuted)', textDecoration: 'line-through' }}>{formatCurrency(resultado.fatura_antiga_corrigida)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', color: '#166534', fontWeight: 700, marginBottom: '6px' }}>FATURA ATUAL</p>
                            <p style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{formatCurrency(resultado.fatura_atual_com_solar)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginBottom: '6px' }}>ECONOMIA MENSAL</p>
                            <p style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>{formatCurrency(resultado.economia_mensal)}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginBottom: '6px' }}>REDUÇÃO REAL</p>
                            <p style={{ fontSize: '28px', fontWeight: 800, color: '#10B981' }}>{formatPct(resultado.reducao_percentual)}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                        <div style={{ background: 'var(--color-bg-muted)', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '16px', textTransform: 'uppercase' }}>Composição da Fatura</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Total da Fatura Bruto:</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(resultado.fatura_atual_com_solar)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Contribuição Ilum. Pública (CIP):</span>
                                    <span style={{ fontWeight: 600 }}>{formatCurrency(dados_entrada.fatura.iluminacao_publica)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', paddingTop: '10px', borderTop: '1px solid var(--color-border-light)' }}>
                                    <span style={{ fontWeight: 800 }}>Parte Energética Líquida:</span>
                                    <span style={{ fontWeight: 800, color: primaryColor }}>{formatCurrency(resultado.parte_energetica_liquida)}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ background: 'var(--color-bg-muted)', padding: '20px', borderRadius: '14px', border: '1px solid var(--color-border)' }}>
                            <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: '16px', textTransform: 'uppercase' }}>Resumo Técnico</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Consumo da rede:</span>
                                    <span style={{ fontWeight: 700 }}>{dados_entrada.fatura.consumo_kwh} kWh</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Energia compensada:</span>
                                    <span style={{ fontWeight: 700 }}>{dados_entrada.fatura.energia_compensada_kwh} kWh</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-text-muted)' }}>Geração no período:</span>
                                    <span style={{ fontWeight: 700 }}>{dados_entrada.geracao.geracao_mes_kwh} kWh</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. RESULTADO OPERACIONAL */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ ...sectionTitleStyle, borderLeft: '3px solid #F59E0B' }}>
                        Insights Operacionais e Performance
                    </h2>
                    <div style={{ background: '#FFFBEB', padding: '24px', borderRadius: '14px', border: '1px solid #FEF3C7' }}>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            {insights_operacionais.map((insight, i) => (
                                <li key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#92400E', fontWeight: 600 }}>
                                    <CheckCircle2 size={18} /> {insight}
                                </li>
                            ))}
                            {insights_operacionais.length === 0 && (
                                <li style={{ fontSize: '14px', color: '#9CA3AF' }}>Análise operacional concluída sem intercorrências no período.</li>
                            )}
                        </ul>
                    </div>
                </section>

                <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '11px', color: '#9CA3AF', borderTop: '1px solid #f0f0f0', paddingTop: '16px' }}>
                    <strong>Página 1 de 2</strong> · Relatório Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* PÁGINA 2: ROI, CRÉDITOS E CONCLUSÃO (ESPAÇO BRANCO PERMITIDO NO FINAL) */}
            <div style={{ ...pageStyle, height: 'auto', minHeight: '1132px' }}>
                {/* 5. RETORNO DO INVESTIMENTO */}
                <section style={{ marginBottom: '48px' }}>
                    <h2 style={{ ...sectionTitleStyle, borderLeft: '3px solid #4F46E5' }}>
                        Análise de Retorno do Investimento (ROI)
                    </h2>
                    <div style={{ background: '#EEF2FF', padding: '36px', borderRadius: 'var(--radius-md)', border: '1px solid #E0E7FF' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <div>
                                <p style={{ fontSize: '11px', color: '#4338CA', fontWeight: 700, marginBottom: '6px' }}>PAYBACK ESTIMADO</p>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#1E1B4B' }}>{resultado.payback_texto_aproximado}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#4338CA', fontWeight: 700, marginBottom: '6px' }}>TEMPO RESTANTE</p>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#4F46E5' }}>{Math.floor(resultado.tempo_restante_meses / 12)} anos e {Math.round(resultado.tempo_restante_meses % 12)} meses</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#4338CA', fontWeight: 700, marginBottom: '6px' }}>PROGRESSO OBTIDO</p>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#1E1B4B' }}>{Math.round(resultado.progresso_payback)}%</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#4338CA', fontWeight: 700, marginBottom: '6px' }}>DATA ESTIMADA</p>
                                <p style={{ fontSize: '20px', fontWeight: 800, color: '#4F46E5' }}>{resultado.data_estimada_retorno}</p>
                            </div>
                        </div>

                        <div style={{ width: '100%', height: '14px', background: '#E0E7FF', borderRadius: '7px', overflow: 'hidden', marginBottom: '20px' }}>
                            <div style={{ width: `${resultado.progresso_payback}%`, height: '100%', background: '#4F46E5', borderRadius: '7px', transition: 'width 1s ease-in-out' }}></div>
                        </div>

                        <p style={{ fontSize: '13px', color: '#4338CA', fontWeight: 600, lineHeight: '1.7', margin: 0 }}>
                            {resultado.progresso_payback > 0
                                ? `Seu projeto fotovoltaico já recuperou ${Math.round(resultado.progresso_payback)}% do investimento inicial. A projeção técnica indica que a quitação total ocorrerá em aproximadamente ${resultado.data_estimada_retorno}. A partir desta data, 100% da economia gerada será revertida em lucro líquido direto para a unidade.`
                                : 'O sistema iniciou recentemente o processo de amortização do capital investido.'}
                        </p>
                    </div>
                </section>

                {/* 6 & 7. CRÉDITOS E RESULTADO TOTAL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
                    <section>
                        <h2 style={{ ...sectionTitleStyle, borderLeft: '3px solid #10B981' }}>Créditos Acumulados</h2>
                        <div style={{ background: '#F0FDF4', padding: '28px', borderRadius: 'var(--radius-md)', border: '1px solid #DCFCE7', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '11px', color: '#166534', fontWeight: 800, marginBottom: '10px' }}>SALDO EM RESERVA</p>
                            <p style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>{(resultado.saldo_creditos_kwh || 0).toLocaleString('pt-BR')} <span style={{ fontSize: '16px', opacity: 0.6 }}>kWh</span></p>
                            <p style={{ fontSize: '15px', fontWeight: 700, color: '#10B981', marginTop: '6px' }}>{formatCurrency(resultado.creditos_em_reais)} em créditos ativos</p>
                        </div>
                    </section>
                    <section>
                        <h2 style={{ ...sectionTitleStyle, borderLeft: `3px solid ${primaryColor}` }}>Resultado Financeiro Total</h2>
                        <div style={{ background: primaryColor, padding: '28px', borderRadius: 'var(--radius-md)', color: '#FFFFFF', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <p style={{ fontSize: '11px', fontWeight: 800, marginBottom: '10px', opacity: 0.8 }}>BENEFÍCIO ACUMULADO</p>
                            <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{formatCurrency(resultado.resultado_total)}</p>
                            <p style={{ fontSize: '11px', marginTop: '8px', opacity: 0.9 }}>Economia direta + Valor monetário dos créditos em haver</p>
                        </div>
                    </section>
                </div>

                {/* 8. CONCLUSÃO EXECUTIVA */}
                <section style={{ background: 'var(--color-bg-muted)', padding: '36px', borderRadius: 'var(--radius-md)', border: '1px dotted var(--color-border)', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <ShieldCheck size={24} color={primaryColor} />
                        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Conclusão Executiva</h2>
                    </div>
                    <p style={{ fontSize: '15px', color: '#374151', fontStyle: 'italic', lineHeight: '1.7', margin: '0 0 32px 0' }}>
                        "{conclusao_executiva}"
                    </p>

                    <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', border: `1px solid ${primaryColor}22` }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 800, color: primaryColor, marginBottom: '12px', textTransform: 'uppercase' }}>Notas Importantes sobre Faturamento</h3>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.7', margin: 0 }}>
                            Conforme as normas vigentes, mesmo com compensação integral do consumo, a fatura mantém componentes financeiros não abatíveis como CIP (Iluminação Pública), tributos estaduais/federais e encargos de transporte da rede (GD2).
                            Este relatório apresenta a **redução financeira real**, já contabilizando essas taxas para garantir transparência absoluta sobre o lucro do seu sistema solar.
                        </p>
                        <p style={{ fontSize: '13px', color: primaryColor, fontWeight: 800, marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={16} /> {resultado.mensagem_explicativa_fatura}
                        </p>
                    </div>

                    {flags_validacao.length > 0 && (
                        <div style={{ marginTop: '30px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {flags_validacao.map((flag, i) => (
                                <span key={i} style={{ fontSize: '11px', background: '#FEE2E2', color: '#991B1B', padding: '8px 16px', borderRadius: '999px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <AlertTriangle size={14} /> {flag}
                                </span>
                            ))}
                        </div>
                    )}
                </section>

                <footer style={{ marginTop: 'auto', borderTop: '1px solid #F3F4F6', paddingTop: '30px', textAlign: 'center' }}>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '20px', maxWidth: '80%', margin: '0 auto 20px' }}>
                        {reportFooter}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600 }}>
                            <span>Tecnologia Watts Solar Data Digital</span>
                            <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '16px', width: 'auto' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', fontSize: '10px', color: '#D1D5DB', fontWeight: 500 }}>
                            <span>Identificador: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            <span>© 2026 Watts Solar</span>
                            <span>Página 2 de 2</span>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ExecutiveReport;
