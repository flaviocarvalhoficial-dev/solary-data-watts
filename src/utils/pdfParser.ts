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

export const parseFaturaPDF = async (file: File): Promise<ParsedBillData> => {
    console.log(`[PDF READER] Iniciando leitura: ${file.name}`);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        const numPages = Math.min(pdf.numPages, 2); // Analisamos até as 2 primeiras pgs

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }

        console.log('[PDF READER] Texto extraído total (primeiros 200 char):', fullText.substring(0, 200));

        // 1. CONTA CONTRATO / UC / INSTALAÇÃO / C.C (Com suporte a Equatorial e Celpa)
        const ucMatch =
            fullText.match(/(?:CONTA\s*CONTRATO|CONTA\s*CONTRATO|C\.C|N[º°]?\s*DO?\s*CONTRATO|N[º°]?\s*DA?\s*CONTA)\s*[:#-]?\s*(\d{8,12})/i)
            || fullText.match(/(?:UNIDADE\s*CONSUMIDORA|UC|INSTALA\u00C7\u00C3O|N[º°]?\s*DA?\s*INSTALA\u00C7\u00C3O|C\u00D3DIGO\s*DO?\s*CLIENTE)\s*[:#-]?\s*(\d{5,15})/i)
            || fullText.match(/(\d{8,12})/);

        const uc = ucMatch ? ucMatch[1] : 'N/A';

        // 2. COMPETENCY (MÊS/ANO)
        const compMatch =
            fullText.match(/(?:REFER\u00CANCIA|M\u00CAS|COMPET\u00CANCIA|REF\s*\.\s*)\s*[:#-]?\s*(\d{2}\/20\d{2})/i)
            || fullText.match(/(\d{2}\/20\d{2})/);
        const competency = compMatch ? compMatch[1] : 'N/A';

        // 3. TOTAL A PAGAR (R$)
        // Priorizamos strings que contenham "Total a Pagar" e valores com vírgula (formato brasileiro de moeda)
        // para evitar que leituras de medidores (ex: 5.527) sejam confundidas com o valor da fatura.
        const moneyValueRegex = /([\d.]*,\d{2})/; // Busca valores com vírgula e 2 decimais (ex: 166,06 ou 1.166,06)

        let totalValue = 0;
        const totalPayableMatch = fullText.match(/Total a Pagar\s*(?:R\$)?\s*([\d,.]+)/i);
        const valorPagarMatch = fullText.match(/VALOR A PAGAR\s*(?:R\$)?\s*([\d,.]+)/i);
        const genericMoneyMatch = fullText.match(/R\$\s*([\d,.]+)/);

        const bestMatch = totalPayableMatch || valorPagarMatch || genericMoneyMatch;

        if (bestMatch) {
            const rawValue = bestMatch[1];
            // Se o valor contiver vírgula, é muito provavelmente o preço correto
            if (rawValue.includes(',')) {
                totalValue = parseFloat(rawValue.replace(/\.(?=\d{3})/g, '').replace(',', '.'));
            } else {
                // Se não tiver vírgula, verificamos se o próximo token no texto é um valor monetário
                const index = fullText.indexOf(bestMatch[0]) + bestMatch[0].length;
                const searchArea = fullText.substring(index, index + 20);
                const secondaryMatch = searchArea.match(/([\d.]*,\d{2})/);
                if (secondaryMatch) {
                    totalValue = parseFloat(secondaryMatch[1].replace(/\.(?=\d{3})/g, '').replace(',', '.'));
                } else {
                    // Fallback para o valor original se for o melhor que temos
                    totalValue = parseFloat(rawValue.replace(/\.(?=\d{3})/g, '').replace(',', '.'));
                }
            }
        }

        // 4. CONSUMO DA REDE (kWh)
        const consMatch =
            fullText.match(/(?:Energia El\u00E9trica|Consumo|Consumo Ativo|Fat\. Ativo|Energia Ativa)\s*\(?kWh\)?\s*(\d+)/i)
            || fullText.match(/(\d+)\s*kWh(?:\s*Energia Ativa)?/i);
        const gridConsumption = consMatch ? parseInt(consMatch[1]) : 0;

        // 5. ENERGIA COMPENSADA / GD (kWh)
        const compensatedMatch =
            fullText.match(/(?:Energia Compensada|Consumo Compensado|Consumo Fat\. Injetado|Energia Injetada GD|Compensa\u00E7\u00E3o GD|Injetada\s*HFP)\s*\(?kWh\)?\s*(-?\d+)/i)
            || fullText.match(/(-?\d+)\s*kWh\s*(?:Energia Injetada faturamento|Energia Injetada GD)/i);
        const compensatedEnergy = compensatedMatch ? Math.abs(parseInt(compensatedMatch[1])) : 0;

        // 6. ENERGIA INJETADA (kWh) - Total enviado
        const injMatch =
            fullText.match(/(?:Energia Ativa Injetada|Injetada|Energia Injetada Total|Quant\.\s*Injetada)\s*\(?kWh\)?\s*(\d+)/i)
            || fullText.match(/(\d+)\s*kWh\s*(?:Ativa Injetada|Injetada)/i);
        const injectedEnergy = injMatch ? parseInt(injMatch[1]) : 0;

        // 7. SALDO DE CRÉDITOS (kWh)
        const creditMatch =
            fullText.match(/(?:Saldo\s*m\u00EAs\s*seguinte|Saldo Atual|Cr\u00E9dito Acumulado|Saldo Atual de Cr\u00E9ditos|Saldo p\/ Mes Seg)\s*:?\s*(\d+)/i)
            || fullText.match(/(\d+)\s*kWh\s*Saldo Acumulado/i);
        const creditBalance = creditMatch ? parseInt(creditMatch[1]) : 0;

        // 8. CIP / STREET LIGHTING (Taxa de Iluminação Pública)
        const cipMatch = fullText.match(/(?:Cip-Ilum|ILUMINA\u00C7\u00C3O P\u00DABLICA|COSIP|CONTR\.\s*ILUM\.\s*PUBLICA|TAXA IP)\s*[^\d]*?([\d,.]+)/i);
        const streetLightingText = cipMatch ? cipMatch[1] : '0';
        const streetLighting = parseFloat(streetLightingText.replace(/\.(?=\d{3})/g, '').replace(',', '.'));

        // 9. TARIFA (R$/kWh)
        const tariffMatch =
            fullText.match(/(?:Consumo Compensado|Energia El\u00E9trica|Consumo Ativo|Parcela Ativa)\s*\(?kWh\)?\s*\d+\s+([\d,.]+)/i)
            || fullText.match(/kWh\s+([01],[\d]{4,})/); // Padrão decimal longo 0,XXXX
        const tariffKwhText = tariffMatch ? tariffMatch[1] : '0';
        const tariffKwh = parseFloat(tariffKwhText.replace(',', '.'));

        const isUCOk = uc !== 'N/A';
        const isValOk = totalValue > 0;
        const confidence = (isUCOk && isValOk && (compensatedEnergy > 0 || gridConsumption > 0)) ? 1.0 : (isUCOk && isValOk) ? 0.9 : 0.5;

        const sanitize = (n: any) => isNaN(n) ? 0 : n;
        console.log(`[PDF READER] Resultado: UC=${uc}, Competencia=${competency}, Conf=${confidence}`);

        return {
            uc,
            competency,
            totalValue: sanitize(totalValue),
            gridConsumption: sanitize(gridConsumption),
            injectedEnergy: sanitize(injectedEnergy),
            compensatedEnergy: sanitize(compensatedEnergy),
            creditBalance: sanitize(creditBalance),
            streetLighting: sanitize(streetLighting),
            tariffKwh: sanitize(tariffKwh),
            confidence
        };
    } catch (error: any) {
        console.error(`[PDF READER ERROR] Falha ao processar:`, error);
        throw new Error(`Erro na leitura do PDF: ${error.message}`);
    }
};
