import { Bill } from '../hooks/useBills';
import { Client } from '../hooks/useClients';

export type ActiveClient = Client & {
    generation: number;
    latestBill: Bill | null;
    status: 'Completo' | 'Divergente' | 'Incompleto';
    energy_today?: number;
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
}

export interface FinalReportObject {
    cliente: string;
    nome_projeto: string;
    competencia: string;
    concessionaria: string;
    uc: string;
    data_emissao_relatorio: string; // YYYY-MM-DD
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
    const dados_entrada = {
        fatura: {
            consumo_kwh: bill.consumption,
            energia_injetada_kwh: bill.injected_energy,
            energia_compensada_kwh: bill.compensated_energy || 0,
            saldo_creditos_kwh: bill.credit_balance || 0,
            valor_total_fatura: bill.total_value,
            tarifa_kwh: bill.tariff_kwh || (bill.consumption > 0 ? (bill.total_value - (bill.street_lighting || 0)) / bill.consumption : 0),
            custo_disponibilidade: bill.total_value > 0 ? 50 : 0,
            tributos: bill.total_value * 0.15,
            iluminacao_publica: bill.street_lighting || 0
        },
        geracao: {
            geracao_mes_kwh: gen,
            status_sistema: client.api_status || 'Ativo',
            data_ultima_leitura: new Date().toISOString().split('T')[0]
        },
        financeiro: {
            investimento_inicial: client.investment || 0,
            valor_kwh_atual: client.current_kwh_value || bill.tariff_kwh || 0.95,
            ciclo_meses: 1
        }
    };

    // 1. FATURA ANTIGA RECALCULADA (SEM SOLAR)
    // Se não tivesse solar, ele pagaria pelo consumo integral + iluminação pública
    const fatura_antiga_corrigida = (dados_entrada.fatura.consumo_kwh * dados_entrada.fatura.tarifa_kwh) + dados_entrada.fatura.iluminacao_publica;

    // 2. FATURA ATUAL COM SOLAR
    const fatura_atual_com_solar = dados_entrada.fatura.valor_total_fatura;

    // 3. ECONOMIA MENSAL REAL
    // A economia é baseada no que foi compensado + o que ele deixou de pagar
    const economia_mensal = Math.max(0, (dados_entrada.fatura.energia_compensada_kwh * dados_entrada.fatura.tarifa_kwh));

    // 4. REDUÇÃO DA FATURA (%)
    const reducao_percentual = fatura_antiga_corrigida > 0 ? (economia_mensal / fatura_antiga_corrigida) * 100 : null;

    // 5. ECONOMIA NO CICLO (1 mes no MVP)
    const economia_ciclo = economia_mensal;

    // 6. SALDO ACUMULADO EM CRÉDITOS (kWh)
    const saldo_creditos_kwh = dados_entrada.fatura.saldo_creditos_kwh;

    // 7. EQUIVALENTE EM REAIS DOS CRÉDITOS
    const creditos_em_reais = saldo_creditos_kwh * dados_entrada.financeiro.valor_kwh_atual;

    // 8. RESULTADO TOTAL DO PROJETO
    const resultado_total = economia_ciclo + creditos_em_reais;

    // 9. PAYBACK
    const payback_anos = economia_mensal > 0 ? (dados_entrada.financeiro.investimento_inicial / (economia_mensal * 12)) : null;
    const payback_meses = payback_anos ? Math.round(payback_anos * 12) : null;
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

    const resultado: any = {
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
        payback_texto_aproximado
    };

    // IQSIGHTS
    const insights_operacionais: string[] = [];
    if (economia_mensal > 0) insights_operacionais.push("Redução de custos no período");
    if ((reducao_percentual || 0) >= 50) insights_operacionais.push("Maior previsibilidade financeira");
    if (saldo_creditos_kwh > 0) insights_operacionais.push("Melhor aproveitamento da energia");

    // VALIDATION FLAGS
    const flags_validacao: string[] = [];
    if (gen < dados_entrada.fatura.energia_compensada_kwh * 0.5) flags_validacao.push("VERIFICAR: Geração muito baixa p/ compensação");
    if (fatura_atual_com_solar > fatura_antiga_corrigida) flags_validacao.push("ANOMALIA: Fatura atual maior que antiga");

    // CONCLUSÃO EXECUTIVA
    let conclusao_executiva = "Os dados apontam potencial de resultado, porém é necessária validação complementar para conclusão definitiva.";
    if (economia_mensal > 0 && (reducao_percentual || 0) >= 30) {
        conclusao_executiva = "O projeto apresenta forte viabilidade econômica, com redução expressiva da fatura, geração de créditos energéticos e retorno atrativo do investimento.";
    } else if (economia_mensal > 0) {
        conclusao_executiva = "O projeto demonstra resultado consistente, com redução de custos e perspectiva positiva de retorno no médio prazo.";
    }

    return {
        cliente: client.name,
        nome_projeto: client.name,
        competencia: bill.competency,
        concessionaria: "Equatorial Pará", // Mock or fallback
        uc: client.uc,
        data_emissao_relatorio: new Date().toISOString().split('T')[0],
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
