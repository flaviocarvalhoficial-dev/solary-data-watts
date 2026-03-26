import * as pdfjs from 'pdfjs-dist';

// Configurando o worker de forma robusta para Vite
// Usamos o import direto do pacote local para evitar erros de rede ou versão no CDN
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

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

export const parseFaturaPDF = async (file: File): Promise<ParsedBillData> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1);
    const textContent = await page.getTextContent();

    // Join all text items into one string for regex analysis
    const fullText = textContent.items.map((item: any) => item.str).join(' ');

    console.log('PDF Text extracted:', fullText);

    // REGEX STRATEGY (Specifically for Equatorial Pará / Similar Layouts)

    // 1. UC / INSTALAÇÃO / CONTA CONTRATO / CÓDIGO DO CLIENTE
    const ucMatch = fullText.match(/(?:INSTALAÇÃO|Nº DA INSTALAÇÃO|CONTA CONTRATO|CÓDIGO DO CLIENTE|UNID\. CONSUMIDORA)\s*:?\s*(\d+)/i)
        || fullText.match(/(\d{8,12})/); // Fallback p/ número longo isolado (comum em UCs)
    const uc = ucMatch ? ucMatch[1] : 'N/A';

    // 2. COMPETENCY (MÊS/ANO)
    const compMatch = fullText.match(/(?:REFERÊNCIA|MÊS|COMPETÊNCIA)\s*:?\s*(\d{2}\/20\d{2})/i)
        || fullText.match(/(\d{2}\/\d{4})/);
    const competency = compMatch ? compMatch[1] : 'N/A';

    // 3. TOTAL VALUE (R$)
    const valueMatch = fullText.match(/(?:Total a Pagar|VALOR A PAGAR|TOTAL DA FATURA|VALOR TOTAL)\s*(?:R\$)?\s*([\d,.]+)/i)
        || fullText.match(/R\$\s*([\d,.]+)/);
    const totalValueText = valueMatch ? valueMatch[1] : '0';
    const totalValue = parseFloat(totalValueText.replace(/\.(?=\d{3})/g, '').replace(',', '.'));

    // 4. CONSUMO DA REDE (kWh)
    const consMatch = fullText.match(/(?:Energia Elétrica|Consumo|Consumo Ativo)\s*\(?kWh\)?\s*(\d+)/i)
        || fullText.match(/(\d+)\s*kWh(?:\s*Energia Ativa)?/i);
    const gridConsumption = consMatch ? parseInt(consMatch[1]) : 0;

    // 5. ENERGIA COMPENSADA / GD (kWh)
    const compensatedMatch = fullText.match(/(?:Energia Compensada|Consumo Compensado|Energia Injetada faturamento|Energia Injetada GD|Compensação GD)\s*\(?kWh\)?\s*(-?\d+)/i)
        || fullText.match(/(-?\d+)\s*kWh\s*Energia Injetada faturamento/i);
    const compensatedEnergy = compensatedMatch ? Math.abs(parseInt(compensatedMatch[1])) : 0;

    // 6. ENERGIA INJETADA (kWh) - Total enviado
    const injMatch = fullText.match(/(?:Energia Ativa Injetada|Injetada|Energia Injetada Total)\s*\(?kWh\)?\s*(\d+)/i)
        || fullText.match(/(\d+)\s*kWh\s*Ativa Injetada/i);
    const injectedEnergy = injMatch ? parseInt(injMatch[1]) : 0;

    // 7. SALDO DE CRÉDITOS (kWh)
    const creditMatch = fullText.match(/(?:Saldo em kWh para o mês seguinte|Saldo Atual|Crédito Acumulado|Saldo Atual de Créditos)\s*:?\s*(\d+)/i)
        || fullText.match(/(\d+)\s*kWh\s*Saldo Acumulado/i);
    const creditBalance = creditMatch ? parseInt(creditMatch[1]) : 0;

    // 8. CIP / STREET LIGHTING (Taxa de Iluminação Pública)
    const cipMatch = fullText.match(/(?:Cip-Ilum|TAXA DE ILUMINAÇÃO PÚBLICA|COSIP|CIP - ILUMINAÇÃO PÚBLICA|CONTR\. ILUM\. PUBLICA)\s*[^\d]*?([\d,.]+)/i);
    const streetLightingText = cipMatch ? cipMatch[1] : '0';
    const streetLighting = parseFloat(streetLightingText.replace(/\.(?=\d{3})/g, '').replace(',', '.'));

    // 9. TARIFA (R$/kWh) - Buscando preço unitário em linhas de consumo
    const tariffMatch = fullText.match(/(?:Consumo Compensado|Energia Elétrica|Consumo Ativo|Parcela Ativa)\s*\(?kWh\)?\s*\d+\s+([\d,]+)/i)
        || fullText.match(/kWh\s+([\d,]{4,})/); // Padrão decimal longo 0,XXXX
    const tariffKwhText = tariffMatch ? tariffMatch[1] : '0';
    const tariffKwh = parseFloat(tariffKwhText.replace(',', '.'));

    // Confidence Level Check
    const isUCOk = uc !== 'N/A';
    const isValOk = totalValue > 0;
    const confidence = (isUCOk && isValOk && (compensatedEnergy > 0 || gridConsumption > 0)) ? 1.0 : (isUCOk && isValOk) ? 0.9 : 0.5;

    return {
        uc,
        competency,
        totalValue,
        gridConsumption,
        injectedEnergy,
        compensatedEnergy,
        creditBalance,
        streetLighting,
        tariffKwh,
        confidence
    };
};
