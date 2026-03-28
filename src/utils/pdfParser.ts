import * as pdfjs from 'pdfjs-dist';

// Usamos o jsDelivr como CDN para carregar o worker de forma compatível com ESM (v5+)
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface ParsedBillData {
    uc: string;
    competency: string; // MM/YYYY
    totalValue: number;
    gridConsumption: number; // kWh (Energia da rede)
    injectedEnergy: number; // kWh (Energia produzida e enviada)
    compensatedEnergy: number; // kWh (Energia descontada)
    creditBalance: number; // kWh (Saldo acumulado)
    streetLighting: number; // R$
    tariffKwh: number; // R$/kWh
    confidence: number;
}

/**
 * Normalização inteligente de valores numéricos (Equatorial Pará)
 * Regras:
 * 1. remover .
 * 2. trocar , -> .
 * 3. detectar negativos com - no final
 * 4. remover símbolos (R$, kWh, %)
 */
const normalizeValue = (raw: string | null | undefined): number => {
    if (!raw || typeof raw !== 'string') return 0;
    let clean = raw.trim()
        .replace(/R\$/g, '')
        .replace(/kWh/g, '')
        .replace(/%/g, '')
        .replace(/\s/g, '');

    // Detectar sinal negativo no final (ex: 233,29-)
    const isNegative = clean.endsWith('-');
    if (isNegative) clean = clean.slice(0, -1);

    // Normalizar separadores brasileiros
    // Remover pontos de milhar: 5.405,84 -> 5405,84
    clean = clean.replace(/\./g, '');
    // Trocar vírgula decimal: 5405,84 -> 5405.84
    clean = clean.replace(',', '.');

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : (isNegative ? -Math.abs(num) : num);
};

export const parseFaturaPDF = async (file: File): Promise<ParsedBillData> => {
    console.log(`[PDF READER v3] Iniciando análise estrutural: ${file.name}`);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const numPages = Math.min(pdf.numPages, 2);

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }

        // --- ETAPA 1: IDENTIFICAÇÃO DE BLOCOS E EXTRAÇÃO ---

        // 1. BLOCO CLIENTE
        const ucMatch = fullText.match(/(?:CONTA\s*CONTRATO|C\.C|CONTA)\s*[:#-]?\s*(\d{8,14})/i);
        const uc = ucMatch ? ucMatch[1] : 'N/A';

        // 2. BLOCO FATURA (Competência e Total a Pagar)
        const compMatch = fullText.match(/(?:REFER\u00CANCIA|M\u00CAS|COMPET\u00CANCIA|REF\.)\s*[:#-]?\s*(\d{2}\/20\d{2})/i);
        const competency = compMatch ? compMatch[1] : 'N/A';

        // REGRA CRÍTICA: Use sempre total_a_pagar como valor principal
        const totalPagarMatch =
            fullText.match(/(?:TOTAL\s*A\s*PAGAR|VALOR\s*A\s*PAGAR|VALOR\s*DA\s*CONTA|VALOR\s*COBRADO)\s*(?:R\$)?\s*([\d.,]+-?)/i) ||
            fullText.match(/R\$\s*([\d.,]*,\d{2})/i);
        const valorFatura = normalizeValue(totalPagarMatch ? totalPagarMatch[1] : null);

        // 3. BLOCO MEDIÇÃO (kWh Bruto da Rede e Injetado Total)
        // Buscamos especificamente na tabela de medição para não confundir com financeiro
        const medicaoTabela = fullText.substring(fullText.search(/Grandezas|Medição|Consumo\s*Real|Medidor/i));

        // Padrão Equatorial: Grandeza [DADOS...] [Valor Final] kWh
        const consMatch =
            medicaoTabela.match(/Consumo\s+(?:ATIVO\s*TOTAL|REATIVA).*?\s+([\d.]+)\s*kWh/i) ||
            medicaoTabela.match(/(?:Consumo|Ativa)\s+\d+\s+\d+\s+(\d+)/i) ||
            fullText.match(/(?:Consumo|Ativa)\s*\(?kWh\)?\s*(\d+)/i);
        const gridConsumption = consMatch ? Math.round(normalizeValue(consMatch[1])) : 0;

        const injTotalMatch =
            medicaoTabela.match(/(?:Injetada|Energia\s*Injetada)\s+(?:ATIVO\s*TOTAL|REATIVA).*?\s+([\d.]+)\s*kWh/i) ||
            medicaoTabela.match(/(?:Injetada|Energia\s*Injetada|Injetada\s*HFP|Injetada\s*HP)\s+\d+\s+\d+\s+(\d+)/i) ||
            fullText.match(/(?:Energia\s*Injetada|Injetada)\s*\(?kWh\)?\s*(\d+)/i);
        const injectedEnergy = injTotalMatch ? Math.round(normalizeValue(injTotalMatch[1])) : 0;

        // 4. BLOCO ITENS DE FATURA (Compensação GD e Tarifas)
        // Aqui extraímos o quanto de energia FOI faturado/compensado
        const gdMatch =
            fullText.match(/(?:Consumo\s*Compensado|Compensada\s*GD|Energia\s*Injetada|Energia\s*Compensada|Compensa\u00E7\u00E3o)\s*\(?kWh\)?\s*(-?\d+[\d.,]*)/i) ||
            fullText.match(/(-?\d+[\d.,]*)\s*kWh\s*(?:Compensada|Compensa\u00E7\u00E3o)/i);
        const compensatedEnergy = Math.abs(normalizeValue(gdMatch ? gdMatch[1] : null));

        const tariffMatch =
            fullText.match(/(?:Consumo\s*Compensado|Compensada\s*GD|Energia\s*El\u00E9trica|Consumo\s*Ativo|Parcela\s*Ativa|Val\.\s*Unit|Pre\u00E7o\s*Unit|TUSD|TE)\s*\(?kWh\)?\s*\d+\s+([01],[\d.]+)/i) ||
            fullText.match(/kWh\s+\d+\s+([01],[\d.]+)\s+[\d,.]+/i) || // Padrão: kWh [Qtd] [Tarifa] [Valor]
            fullText.match(/([01],[\d.]+)\s+[\d,.]+\s+[\d,.]+\s+TUSD/i) ||
            fullText.match(/(?:Consumo\s*Compensado|Compensada\s*GD).*?([01],[\d,.]{4,})/i) || // Tarifa após "Consumo Compensado"
            fullText.match(/kWh\s+([01],[\d]{2,})/i) ||
            fullText.match(/(?:Pre\u00E7o|Valor)\s*Unit\u00E1rio.*?(0,[\d,.]+)/i);

        const tariffKwh = normalizeValue(tariffMatch ? tariffMatch[1] : '0');

        // 5. BLOCO FINANCEIRO (CIP e Ajustes)
        const financeirosIdx = fullText.search(/ITENS\s*FINANCEIROS|Demonstrativo\s*de\s*Consumo|OUTROS\s*ITENS/i);
        const financeirosSecao = financeirosIdx !== -1 ? fullText.substring(financeirosIdx) : fullText;

        const cipMatch =
            financeirosSecao.match(/(?:Cip-Ilum|COSIP|\bCIP\b|\bIP\b|Taxa\s*IP|Contrib\b).*?\s+([\d,.]+)/i) ||
            fullText.match(/(?:Cip-Ilum|ILUMINAÇÃO\s*PÚBLICA|COSIP|CIP|ILUMINACAO\s*PUBLICA|TAXA\s*IP|CONTR\.\s*ILUM\.\s*PUBLICA|CONTRIB\.\s*ILUM\.\s*PUBLICA|CONTR\s*ILUM\s*PUB)\s*(?:R\$)?\s*([\d,.]+)/i) ||
            fullText.match(/([\d,.]+)\s*(?:CIP|COSIP|CONTRIB\s*ILUM|ILUMINAÇÃO)/i);
        const streetLighting = normalizeValue(cipMatch ? cipMatch[1] : '0');

        // 6. BLOCO CRÉDITOS (FONTE OFICIAL - PRIORIDADE ALTA)
        const infoClienteSecao = fullText.substring(fullText.search(/Informa\u00E7\u00F5es\s*para\s*o\s*Cliente|Sal\.\s*Acum|Saldo\s*Ger/i));
        const saldoMatch =
            infoClienteSecao.match(/(?:Saldo\s*Acumulado\s*Geral\s*Total|Saldo\s*acumulado|Cr\u00E9dito\s*Expirar|Saldo\s*Mes\s*Seg|Saldo\s*Total|Cr\u00E9dito\s*kWh|Saldo\s*Gerador|Saldo\s*Atual)\s*[:#-]?\s*([\d,.]+)/i) ||
            fullText.match(/Saldo\s*Total\s*Acumulado\s*([\d,.]+)/i) ||
            fullText.match(/Saldo\s*Geral\s*Acumulado\s*([\d,.]+)/i);
        const creditBalance = saldoMatch ? Math.round(normalizeValue(saldoMatch[1])) : 0;

        // --- ETAPA 2: VALIDAÇÃO INTELIGENTE ---

        const isUCOk = uc !== 'N/A';
        const isValOk = valorFatura > 0;

        // Regra de Confiança baseada na integridade dos blocos extraídos
        let confidence = 0.5;
        if (isUCOk && isValOk) {
            confidence = 0.8;
            if (gridConsumption > 0 || compensatedEnergy > 0 || creditBalance > 0) confidence = 0.95;
            if (infoClienteSecao.length > 30) confidence = 1.0;
        }

        console.log(`[PDF READER] Detecção Finalizada: Conf=${confidence}, CC=${uc}, Total=${valorFatura}`);

        return {
            uc,
            competency,
            totalValue: valorFatura,
            gridConsumption,
            injectedEnergy,
            compensatedEnergy,
            creditBalance,
            streetLighting,
            tariffKwh,
            confidence
        };
    } catch (error: any) {
        console.error(`[PDF READER ERROR]`, error);
        throw new Error(`Erro na leitura inteligente da fatura: ${error.message}`);
    }
};
