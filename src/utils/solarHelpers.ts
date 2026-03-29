import { Bill } from '../hooks/useBills';
import { Client } from '../hooks/useClients';

export type ActiveClient = Client & {
    generation: number;
    latestBill: Bill | null;
    status: 'Completo' | 'Divergente' | 'Incompleto';
    energy_today?: number;
    last_sync?: string;
    tem_meter?: boolean;
    api_status?: string;
    sync_status?: 'IDLE' | 'SYNCING' | 'ERROR';
    sync_error?: string;
};

export function clientStatus(bill: Bill | null): 'Completo' | 'Divergente' | 'Incompleto' {
    if (!bill) return 'Incompleto';
    if ((bill.confidence ?? 1) < 0.8) return 'Divergente';
    return 'Completo';
}

export interface ReportResult {
    fatura_antiga_corrigida: number;
    fatura_atual_com_solar: number;
    economia_mensal: number;
    reducao_percentual: number | null;
    economia_ciclo: number;
    saldo_creditos_kwh: number;
    creditos_em_reais: number;
    resultado_total: number;
    payback_anos: number | null;
    payback_meses: number | null;
    payback_texto_aproximado: string;
    payback_texto_restante: string;
    tempo_restante_meses: number;
    tempo_decorrido_meses: number;
    progresso_payback: number;
    data_estimada_retorno: string;
    parte_energetica_liquida: number;
    houve_compensacao_integral: boolean;
    mensagem_explicativa_fatura: string;
}

export interface FinalReportObject {
    cliente: string;
    nome_projeto: string;
    competencia: string;
    concessionaria: string;
    uc: string;
    data_emissao_relatorio: string; // YYYY-MM-DD
    data_emissao_fatura?: string; // DD/MM/YYYY
    fonte_geracao_utilizada: 'api' | 'manual';
    modo_relatorio: 'automatico' | 'manual_assistido';
    dados_entrada: {
        fatura: {
            consumo_kwh: number;
            energia_injetada_kwh: number;
            energia_compensada_kwh: number;
            saldo_creditos_kwh: number;
            valor_total_fatura: number;
            tarifa_kwh: number;
            custo_disponibilidade: number;
            tributos: number;
            iluminacao_publica: number;
        };
        projeto: {
            data_ativacao: string | null;
            investimento: number;
        };
        geracao: {
            geracao_mes_kwh: number;
            status_sistema: string;
            data_ultima_leitura: string;
        };
        financeiro: {
            investimento_inicial: number;
            valor_kwh_atual: number;
            ciclo_meses: number;
        };
    };
    resultado: ReportResult & {
        tempo_sistema_ativo: string;
    };
    insights_operacionais: string[];
    conclusao_executiva: string;
    flags_validacao: string[];
}

export function calculateFinalReport(
    client: Client,
    bill: Bill,
    gen: number,
    genSource: 'api' | 'manual' = 'api'
): FinalReportObject {
    // 1. TARIFA DE REFERÊNCIA (Fallback inteligente)
    // Se o parser falhou (0), usamos o valor do cliente. Se o cliente não tem, usamos 0.95.
    const tarifa_referencia = bill.tariff_kwh || client.current_kwh_value || 0.95;

    const dados_entrada = {
        fatura: {
            consumo_kwh: bill.consumption,
            energia_injetada_kwh: bill.injected_energy,
            energia_compensada_kwh: bill.compensated_energy || 0,
            saldo_creditos_kwh: bill.credit_balance || 0,
            valor_total_fatura: bill.total_value,
            tarifa_kwh: tarifa_referencia,
            custo_disponibilidade: bill.total_value > 0 ? 50 : 0,
            tributos: bill.total_value * 0.15,
            iluminacao_publica: bill.street_lighting || 0
        },
        projeto: {
            data_ativacao: client.activation_date || null,
            investimento: client.investment || 0
        },
        geracao: {
            geracao_mes_kwh: gen,
            status_sistema: client.api_status || 'Ativo',
            data_ultima_leitura: new Date().toISOString().split('T')[0]
        },
        financeiro: {
            investimento_inicial: client.investment || 0,
            valor_kwh_atual: tarifa_referencia,
            ciclo_meses: 1
        }
    };

    // 1. FATURA ANTIGA RECALCULADA (BASELINE SEM SOLAR)
    // REGRA 1: Se o usuário preencheu o "Marco Zero" manualmente (baseline_bill_value), usamos ele como fatura_antiga.
    // REGRA 2: Se não houver Marco Zero, recalculamos com base no (Rede + Compensado) * Tarifa
    const baseline_manual = (client as any).baseline_bill_value;
    const consumo_total_estimado = (dados_entrada.fatura.consumo_kwh || 0) + (dados_entrada.fatura.energia_compensada_kwh || 0);

    // Se temos o valor manual, usamos ele. Caso contrário, usamos o cálculo teórico do medidor.
    const fatura_antiga_corrigida = (baseline_manual !== undefined && baseline_manual !== null && baseline_manual > 0)
        ? baseline_manual
        : (consumo_total_estimado * (dados_entrada.fatura.tarifa_kwh || 0)) + (dados_entrada.fatura.iluminacao_publica || 0);

    // 2. FATURA ATUAL COM SOLAR
    const fatura_atual_com_solar = dados_entrada.fatura.valor_total_fatura;

    // 3. ECONOMIA MENSAL REAL
    // Formula: economiaMensal = valor_antigo - valor_atual
    const economia_mensal = Math.max(0, fatura_antiga_corrigida - fatura_atual_com_solar);

    // 4. REDUÇÃO DA FATURA (%)
    // Formula: reducaoPercentual = (economiaMensal / valor_antigo) * 100
    const reducao_percentual = fatura_antiga_corrigida > 0 ? (economia_mensal / fatura_antiga_corrigida) * 100 : null;

    // 5. ECONOMIA NO CICLO
    // Formula: economiaCiclo = economiaMensal * ciclo_meses
    const economia_ciclo = economia_mensal * dados_entrada.financeiro.ciclo_meses;

    // 6. SALDO ACUMULADO EM CRÉDITOS (kWh)
    const saldo_creditos_kwh = dados_entrada.fatura.saldo_creditos_kwh;

    // 7. EQUIVALENTE EM REAIS DOS CRÉDITOS
    // Formula: valorCreditos = creditos_kwh * valor_kwh
    const creditos_em_reais = saldo_creditos_kwh * dados_entrada.financeiro.valor_kwh_atual;

    // 8. RESULTADO TOTAL DO PROJETO
    // Formula: resultadoTotal = economiaCiclo + valorCreditos
    const resultado_total = economia_ciclo + creditos_em_reais;

    // 9. CÁLCULO DE PAYBACK (PÁGINA 12 DO PRD)
    const payback_anos = economia_mensal > 0 ? (dados_entrada.financeiro.investimento_inicial / (economia_mensal * 12)) : null;
    const payback_meses = payback_anos ? payback_anos * 12 : null;

    // 9.1 PAYBACK DINÂMICO (Versão Final Unificada)
    let tempo_decorrido_meses = 0;
    let tempo_restante_meses = 0;
    let progresso_payback = 0;
    let data_estimada_retorno = "A definir";

    if (payback_meses && client.activation_date) {
        const hoje = new Date();
        const inicio = new Date(client.activation_date);

        // Tempo já passou desde a ativação
        tempo_decorrido_meses = (hoje.getFullYear() - inicio.getFullYear()) * 12 + (hoje.getMonth() - inicio.getMonth());
        if (tempo_decorrido_meses < 0) tempo_decorrido_meses = 0;

        // Tempo que ainda falta
        tempo_restante_meses = Math.max(payback_meses - tempo_decorrido_meses, 0);

        // % Concluído
        progresso_payback = Math.min((tempo_decorrido_meses / payback_meses) * 100, 100);

        // Data Estimada (Mês/Ano)
        const dRetorno = new Date(inicio);
        dRetorno.setMonth(dRetorno.getMonth() + Math.round(payback_meses));
        data_estimada_retorno = dRetorno.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '').toUpperCase();
    }

    let payback_texto_restante = '—';
    if (tempo_restante_meses > 0) {
        const rAnos = Math.floor(tempo_restante_meses / 12);
        const rMeses = Math.round(tempo_restante_meses % 12);

        const anosTexto = rAnos > 0 ? `${rAnos} ${rAnos === 1 ? 'ano' : 'anos'}` : '';
        const mesesTexto = rMeses > 0 ? `${rMeses} ${rMeses === 1 ? 'mês' : 'meses'}` : '';

        if (anosTexto && mesesTexto) {
            payback_texto_restante = `${anosTexto} e ${mesesTexto}`;
        } else {
            payback_texto_restante = anosTexto || mesesTexto || '0 meses';
        }
    } else if (tempo_restante_meses === 0 && payback_meses) {
        payback_texto_restante = 'Payback Concluído';
    }

    let payback_texto_aproximado = 'N/A';
    if (payback_anos) {
        const anos = Math.floor(payback_anos);
        const meses = Math.round((payback_anos - anos) * 12);
        payback_texto_aproximado = `${anos} anos ${meses > 0 ? `e ${meses} meses` : ''}`;
    }

    // TEMPO ATIVO (Mock based on activation date if exists)
    let tempo_sistema_ativo = 'N/A';
    if (client.activation_date) {
        const start = new Date(client.activation_date);
        const now = new Date();
        const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        tempo_sistema_ativo = diffMonths >= 12 ? `${Math.floor(diffMonths / 12)} anos` : `${diffMonths} meses`;
    }

    // 10. REGRAS DE COMPENSAÇÃO (GD2 / EQUATORIAL)
    const parte_energetica_liquida = Math.max(0, fatura_atual_com_solar - (dados_entrada.fatura.iluminacao_publica || 0));
    const houve_compensacao_integral = (dados_entrada.fatura.energia_compensada_kwh || 0) >= (dados_entrada.fatura.consumo_kwh || 0);

    let mensagem_explicativa_fatura = "";
    if (houve_compensacao_integral) {
        mensagem_explicativa_fatura = "Consumo integralmente compensado. Ainda assim, permanecem cobranças remanescentes associadas a CIP, tributos, encargos GD2 e regras tarifárias da distribuidora.";
    } else {
        mensagem_explicativa_fatura = "Compensação parcial do consumo. Parte da energia consumida foi abatida por créditos, mas ainda houve cobrança de energia e demais encargos.";
    }

    const resultado: ReportResult & { tempo_sistema_ativo: string } = {
        tempo_sistema_ativo,
        fatura_antiga_corrigida,
        fatura_atual_com_solar,
        economia_mensal,
        reducao_percentual,
        economia_ciclo,
        saldo_creditos_kwh,
        creditos_em_reais,
        resultado_total,
        payback_anos,
        payback_meses,
        payback_texto_aproximado,
        payback_texto_restante,
        tempo_restante_meses,
        tempo_decorrido_meses,
        progresso_payback,
        data_estimada_retorno,
        parte_energetica_liquida,
        houve_compensacao_integral,
        mensagem_explicativa_fatura
    };

    // MOTOR DE INSIGHTS (INTELIGÊNCIA)
    const insights_operacionais: string[] = [];
    if (reducao_percentual && reducao_percentual > 80) {
        insights_operacionais.push("Alta redução de custos detectada");
    } else if (economia_mensal > 0) {
        insights_operacionais.push("Redução de custos no período");
    }

    if (payback_anos && payback_anos < 3) {
        insights_operacionais.push("Retorno rápido do investimento");
    }

    if (saldo_creditos_kwh > 0) {
        insights_operacionais.push("Geração de créditos energéticos");
    }

    // VALIDATION FLAGS
    const flags_validacao: string[] = [];
    if (gen < dados_entrada.fatura.energia_compensada_kwh * 0.5) flags_validacao.push("VERIFICAR: Geração muito baixa p/ compensação");
    if (fatura_atual_com_solar > fatura_antiga_corrigida) flags_validacao.push("ANOMALIA: Fatura atual maior que antiga");

    // CONCLUSÃO EXECUTIVA (AUTOMÁTICA BASEADA EM INDICADORES)
    let conclusao_executiva = "O projeto apresenta potencial de resultado, com monitoramento ativo e perspectiva positiva de retorno.";

    if ((reducao_percentual || 0) > 70 && (payback_anos || 10) < 5 && saldo_creditos_kwh > 0) {
        conclusao_executiva = "O projeto apresenta alta economia, retorno rápido e geração consistente de créditos, demonstrando forte viabilidade financeira.";
    } else if (economia_mensal > 0 && (reducao_percentual || 0) >= 30) {
        conclusao_executiva = "O projeto apresenta uma redução expressiva da fatura e geração consistente de créditos, consolidando-se como um investimento de alta performance.";
    } else if (economia_mensal > 0) {
        conclusao_executiva = "O projeto demonstra resultado consistente, com redução de custos e perspectiva positiva de valorização do investimento no médio prazo.";
    }

    return {
        cliente: client.name,
        nome_projeto: client.name,
        competencia: bill.competency,
        concessionaria: "Equatorial Pará", // Mock or fallback
        uc: client.uc,
        data_emissao_relatorio: new Date().toISOString().split('T')[0],
        data_emissao_fatura: bill.issue_date ? new Date(bill.issue_date).toLocaleDateString('pt-BR') : undefined,
        fonte_geracao_utilizada: genSource,
        modo_relatorio: genSource === 'api' ? 'automatico' : 'manual_assistido',
        dados_entrada,
        resultado,
        insights_operacionais,
        conclusao_executiva,
        flags_validacao
    };
}

export const normalizeCity = (city: string | null): string | null => {
    if (!city || typeof city !== 'string') return null;
    const res = city.trim().replace(/\s*-\s*/g, "-").replace(/\s+/g, " ").toUpperCase();
    return res === "CIDADE NÃO INF." || res === "" ? null : res;
};

export const findCityDeep = (obj: any): string | null => {
    if (!obj || typeof obj !== 'object') return null;
    const target = obj.systemInfo?.city || obj.userInfo?.city || obj.city || obj.cityName || obj.city_name || obj.city_name_en;
    if (target && typeof target === 'string') return target;
    for (const key in obj) {
        const res = findCityDeep(obj[key]);
        if (res) return res;
    }
    return null;
};

export const getEmaPortalLink = (client: ActiveClient): string | null => {
    if (client.platform === 'APsystems' && client.system_id) {
        return `https://apsystemsema.com/ema/security/optmainmenu/intoViewSingleCustomerBelowInstaller.action?userId=2c9f95c79998f69101999b30ca435e5f&ecuId=${client.system_id}&Ecuremark=1&viewDirectFlag=&viewPartnerFlag=&clickFlag=3`;
    }
    // Adicione mais plataformas conforme necessário
    return null;
};
