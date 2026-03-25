import * as pdfjs from 'pdfjs-dist';

// Setting up the worker for pdfjs
// In Vite, it's easier to use the CDN for the worker if not using a specific loader
// But we can try to point it to the local node_modules path if needed.
// For browser usage with Vite:
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface ParsedBillData {
    uc: string;
    competency: string; // MM/YYYY
    totalValue: number;
    consumption: number; // kWh
    injectedEnergy: number; // kWh
    streetLighting: number; // R$
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

    // 1. UC / INSTALAÇÃO (Looking for numbers after 'INSTALAÇÃO:')
    const ucMatch = fullText.match(/INSTALAÇÃO:\s*(\d+)/i) || fullText.match(/Instalação:\s*(\d+)/i);
    const uc = ucMatch ? ucMatch[1] : 'N/A';

    // 2. COMPETENCY (Looking for MM/YYYY pattern near 'Mês/Ano' or 'Conta Mês')
    const compMatch = fullText.match(/(\d{2}\/\d{4})/);
    const competency = compMatch ? compMatch[1] : 'N/A';

    // 3. TOTAL VALUE (Looking for R$ XX,XX)
    // Equatorial Pará has "Total a Pagar" field
    const valueMatch = fullText.match(/Total a Pagar\s*R\$\s*([\d,.]+)/i) || fullText.match(/R\$\s*([\d,.]+)/);
    const totalValue = valueMatch ? parseFloat(valueMatch[1].replace('.', '').replace(',', '.')) : 0;

    // 4. CONSUMO COMPENSADO (kWh)
    // "Consumo Compensado (kWh) 249"
    const consMatch = fullText.match(/Consumo Compensado\s*\(kWh\)\s*(\d+)/i);
    const consumption = consMatch ? parseInt(consMatch[1]) : 0;

    // 5. ENERGIA INJETADA (kWh)
    // "Energia Ativa Injetada (kWh) 368"
    const injMatch = fullText.match(/Energia Ativa Injetada\s*\(kWh\)\s*(\d+)/i);
    const injectedEnergy = injMatch ? parseInt(injMatch[1]) : 0;

    // 6. CIP / STREET LIGHTING
    // "Cip-Ilum Pub-Pref Munic R$ 56,19"
    const cipMatch = fullText.match(/Cip-Ilum Pub-Pref Munic\s*R\$\s*([\d,.]+)/i);
    const streetLighting = cipMatch ? parseFloat(cipMatch[1].replace('.', '').replace(',', '.')) : 0;

    return {
        uc,
        competency,
        totalValue,
        consumption,
        injectedEnergy,
        streetLighting,
        confidence: (uc !== 'N/A' && totalValue > 0) ? 0.95 : 0.5
    };
};
