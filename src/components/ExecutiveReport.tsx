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

    return (
        <div id="executive-report-template" style={{
            width: '800px',
            padding: '40px',
            background: '#ffffff',
            fontFamily: "'Inter', sans-serif",
            color: 'var(--color-text-primary)',
            lineHeight: '1.5'
        }}>
            {/* 1. CABEÇALHO */}
            <header style={{
                borderBottom: `2px solid ${primaryColor}`,
                paddingBottom: '20px',
                marginBottom: '30px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {logoUrl ? (
                        <img src={logoUrl} alt="Logo" style={{ height: '40px', width: 'auto' }} />
                    ) : (
                        <div style={{ padding: '6px', background: `${primaryColor}22`, borderRadius: '6px', color: primaryColor }}><TrendingUp size={24} /></div>
                    )}
                    <div>
                        <h1 style={{ color: primaryColor, fontSize: '20px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>{companyName}</h1>
                        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 600, marginTop: '2px' }}>RELATÓRIO EXECUTIVO DE REDUÇÃO ENERGÉTICA</p>
                    </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700 }}>{data.cliente}</div>
                    <div style={{ color: 'var(--color-text-muted)' }}>CONTA CONTRATO: {data.uc} | {data.concessionaria}</div>
                    <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                        Competência: <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{data.competencia}</span>
                        {data.data_emissao_fatura && (
                            <> | Emitida em: <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>{data.data_emissao_fatura}</span></>
                        )}
                    </div>
                </div>
            </header>

            {/* 2. DADOS PRINCIPAIS DO PROJETO */}
            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', borderLeft: `3px solid ${primaryColor}`, paddingLeft: '10px', letterSpacing: '0.05em' }}>
                    Dados Principais do Projeto
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                    {[
                        { label: 'Tempo Ativo', value: resultado.tempo_sistema_ativo, icon: <Clock size={16} /> },
                        { label: 'Investimento', value: formatCurrency(dados_entrada.financeiro.investimento_inicial), icon: <Wallet size={16} /> },
                        { label: 'Saldo Créditos', value: `${(resultado.saldo_creditos_kwh || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kWh`, icon: <Zap size={16} /> },
                        { label: 'Valor kWh Atual', value: formatCurrency(dados_entrada.financeiro.valor_kwh_atual), icon: <TrendingUp size={16} /> },
                    ].map((item, idx) => (
                        <div key={idx} style={{ background: 'var(--color-bg-muted)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.02em' }}>
                                {item.icon} {item.label.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{item.value}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. RESULTADO DO PROJETO */}
            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', borderLeft: '3px solid #10B981', paddingLeft: '10px', letterSpacing: '0.05em' }}>
                    Resultado Econômico do Mês
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '20px', background: '#F0FDF4', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid #DCFCE7', marginBottom: '16px' }}>
                    <div>
                        <p style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>FATURA ANTIGA (CORRIGIDA)</p>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-xmuted)', textDecoration: 'line-through' }}>{formatCurrency(resultado.fatura_antiga_corrigida)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '11px', color: '#166534', fontWeight: 600, marginBottom: '4px' }}>FATURA ATUAL (COM SOLAR)</p>
                        <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(resultado.fatura_atual_com_solar)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginBottom: '4px' }}>ECONOMIA MENSAL</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>{formatCurrency(resultado.economia_mensal)}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginBottom: '4px' }}>REDUÇÃO REAL</p>
                        <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981' }}>{formatPct(resultado.reducao_percentual)}</p>
                    </div>
                </div>

                {/* COMPOSIÇÃO DA FATURA (Regra compensacao.md) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                    <div style={{ background: 'var(--color-bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Composição da Fatura</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Total da Fatura:</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(resultado.fatura_atual_com_solar)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>CIP (Iluminação Pública):</span>
                                <span style={{ fontWeight: 600 }}>{formatCurrency(dados_entrada.fatura.iluminacao_publica)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '8px', borderTop: '1px solid var(--color-border-light)' }}>
                                <span style={{ fontWeight: 700 }}>Parte Energética Líquida:</span>
                                <span style={{ fontWeight: 700, color: primaryColor }}>{formatCurrency(resultado.parte_energetica_liquida)}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: 'var(--color-bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
                        <h3 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>Interpretação</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Consumo da rede:</span>
                                <span style={{ fontWeight: 600 }}>{dados_entrada.fatura.consumo_kwh} kWh</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Energia compensada:</span>
                                <span style={{ fontWeight: 600 }}>{dados_entrada.fatura.energia_compensada_kwh} kWh</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--color-text-muted)' }}>Geração no período:</span>
                                <span style={{ fontWeight: 600 }}>{dados_entrada.geracao.geracao_mes_kwh} kWh</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--color-border-light)' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '10px' }}>Créditos acumulados:</span>
                                <span style={{ fontWeight: 600, fontSize: '10px' }}>{resultado.saldo_creditos_kwh} kWh</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                {/* 4. RESULTADO OPERACIONAL */}
                <div>
                    <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', borderLeft: '3px solid #F59E0B', paddingLeft: '10px', letterSpacing: '0.05em' }}>
                        Resultado Operacional
                    </h2>
                    <div style={{ background: '#FFFBEB', padding: '20px', borderRadius: '12px', border: '1px solid #FEF3C7', height: '140px' }}>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {insights_operacionais.map((insight, i) => (
                                <li key={i} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: '#92400E', fontWeight: 500 }}>
                                    <CheckCircle2 size={16} /> {insight}
                                </li>
                            ))}
                            {insights_operacionais.length === 0 && (
                                <li style={{ fontSize: '13px', color: '#9CA3AF' }}>Nenhum insight operacional detectado neste período.</li>
                            )}
                        </ul>
                    </div>
                </div>

                {/* 5. RETORNO DO INVESTIMENTO (Versão Final Unificada) */}
                <div>
                    <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', borderLeft: '3px solid #4F46E5', paddingLeft: '10px', letterSpacing: '0.05em' }}>
                        Retorno do Investimento
                    </h2>
                    <div style={{ background: '#EEF2FF', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #E0E7FF' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                            <div>
                                <p style={{ fontSize: '10px', color: '#4338CA', fontWeight: 600, marginBottom: '2px' }}>PAYBACK TOTAL</p>
                                <p style={{ fontSize: '16px', fontWeight: 600, color: '#1E1B4B', fontFamily: 'sans-serif' }}>{resultado.payback_texto_aproximado}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', color: '#4338CA', fontWeight: 600, marginBottom: '2px' }}>TEMPO RESTANTE</p>
                                <p style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5' }}>{Math.floor(resultado.tempo_restante_meses / 12)} anos e {Math.round(resultado.tempo_restante_meses % 12)} meses</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', color: '#4338CA', fontWeight: 600, marginBottom: '2px' }}>PROGRESSO</p>
                                <p style={{ fontSize: '16px', fontWeight: 700, color: '#1E1B4B' }}>{Math.round(resultado.progresso_payback)}%</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '10px', color: '#4338CA', fontWeight: 600, marginBottom: '2px' }}>CONCLUSÃO ESTIMADA</p>
                                <p style={{ fontSize: '16px', fontWeight: 700, color: '#4F46E5' }}>{resultado.data_estimada_retorno}</p>
                            </div>
                        </div>

                        {/* Barra de Progresso */}
                        <div style={{ width: '100%', height: '8px', background: '#E0E7FF', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                            <div style={{ width: `${resultado.progresso_payback}%`, height: '100%', background: '#4F46E5', borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
                        </div>

                        <p style={{ fontSize: '10.5px', color: '#4338CA', fontWeight: 500, lineHeight: '1.4', margin: 0 }}>
                            {resultado.progresso_payback > 0
                                ? `Seu sistema já recuperou ${Math.round(resultado.progresso_payback)}% do investimento desde a ativação em ${dados_entrada.projeto?.data_ativacao ? new Date(dados_entrada.projeto.data_ativacao).toLocaleDateString('pt-BR') : 'N/A'}.`
                                : 'O sistema iniciou recentemente a fase de recuperação do investimento inicial.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* 6. CRÉDITOS ACUMULADOS */}
            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', borderLeft: '3px solid #10B981', paddingLeft: '10px', letterSpacing: '0.05em' }}>
                    5. Créditos Acumulados
                </h2>
                <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid #DCFCE7' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontSize: '11px', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>SALDO EM ENERGIA (kWh)</p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{(resultado.saldo_creditos_kwh || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} kWh</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '11px', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>VALOR EQUIVALENTE EM REAIS</p>
                            <p style={{ fontSize: '24px', fontWeight: 700, color: '#10B981', margin: 0 }}>{formatCurrency(resultado.creditos_em_reais)}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. RESULTADO TOTAL */}
            <section style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '16px', borderLeft: `3px solid ${primaryColor}`, paddingLeft: '10px', letterSpacing: '0.05em' }}>
                    6. Resultado Total
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr', gap: '20px' }}>
                    <div style={{ background: 'var(--color-bg-muted)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '4px' }}>ECONOMIA NO CICLO</p>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(resultado.economia_ciclo)}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Período selecionado</p>
                    </div>
                    <div style={{ background: 'var(--color-bg-muted)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 700, marginBottom: '4px' }}>CRÉDITOS GERADOS</p>
                        <p style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{formatCurrency(resultado.creditos_em_reais)}</p>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Valor em haver</p>
                    </div>
                    <div style={{ background: primaryColor, padding: '24px', borderRadius: 'var(--radius-md)', color: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '4px', opacity: 0.8 }}>TOTAL GERAL ACUMULADO</p>
                        <p style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>{formatCurrency(resultado.resultado_total)}</p>
                        <p style={{ fontSize: '11px', marginTop: '8px', opacity: 0.9 }}>Soma da economia direta + valor dos créditos</p>
                    </div>
                </div>
            </section>

            {/* 8. CONCLUSÃO EXECUTIVA */}
            <section style={{ background: 'var(--color-bg-muted)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px dotted var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <ShieldCheck size={18} color={primaryColor} />
                    <h2 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'uppercase', margin: 0, letterSpacing: '0.05em' }}>Conclusão Executiva</h2>
                </div>
                <p style={{ fontSize: '13px', color: '#374151', fontStyle: 'italic', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    "{conclusao_executiva}"
                </p>

                {/* BLOCO EXPLICATIVO (Regra compensacao.md) */}
                <div style={{ background: '#fff', padding: '16px', borderRadius: '10px', border: `1px solid ${primaryColor}44`, marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '11px', fontWeight: 700, color: primaryColor, marginBottom: '8px', textTransform: 'uppercase' }}>Por que ainda existe valor a pagar?</h3>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: '1.5', margin: 0 }}>
                        No período analisado, o sistema fotovoltaico compensou o consumo de energia da unidade, gerando economia financeira direta.
                        Ainda assim, a fatura mantém cobranças residuais relacionadas à CIP, tributos, encargos tarifários da modalidade GD2 e demais regras aplicadas pela distribuidora.
                        Isso significa que a compensação de energia reduz substancialmente a conta, mas nem sempre elimina integralmente o valor final a pagar.
                    </p>
                    <p style={{ fontSize: '11px', color: primaryColor, fontWeight: 600, marginTop: '8px' }}>
                        → {resultado.mensagem_explicativa_fatura}
                    </p>
                </div>
                {flags_validacao.length > 0 && (
                    <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {flags_validacao.map((flag, i) => (
                            <span key={i} style={{ fontSize: '10px', background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <AlertTriangle size={10} /> {flag}
                            </span>
                        ))}
                    </div>
                )}
            </section>

            <footer style={{ marginTop: '40px', borderTop: '1px solid #F3F4F6', paddingTop: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '16px' }}>
                    {reportFooter}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)', fontSize: '10px', fontWeight: 500 }}>
                        <span>Gerado com</span>
                        <img src="/logotipooficial.svg" alt="Watts Logo" style={{ height: '14px', width: 'auto' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '9px', color: '#D1D5DB' }}>
                        <span>Modo: {data.modo_relatorio.toUpperCase()}</span>
                        <span>Fonte Fatura: OCR PARSER v2</span>
                        <span>© 2026 Watts Solar Data Digital</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ExecutiveReport;
