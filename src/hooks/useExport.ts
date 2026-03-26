import { useState } from 'react';
import JSZip from 'jszip';
import { generateClientReport } from '../utils/reportGenerator';
import { calculateFinalReport, ActiveClient } from '../utils/solarHelpers';
import { Branding } from './useBranding';

interface UseExportProps {
    branding: Branding;
    enrichedClients: ActiveClient[];
}

export function useExport({ branding, enrichedClients }: UseExportProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async (ac: ActiveClient) => {
        const bill = ac.latestBill;
        if (!bill) return alert('Vincule uma fatura.');

        const reportData = calculateFinalReport(ac, bill, ac.generation);

        // Pequeno delay p/ garantir renderização do template oculto
        await new Promise(r => setTimeout(r, 100));

        await generateClientReport('executive-report-template', reportData);
    };

    const handleBatchExport = async (setSelectedClientId: (id: string | null) => void) => {
        const valid = enrichedClients.filter(c => c.status === 'Completo' && c.latestBill);
        if (!valid.length) return alert('Nenhum sistema "Completo".');
        setIsExporting(true);
        const zip = new JSZip();
        for (const ac of valid) {
            setSelectedClientId(ac.id);
            const bill = ac.latestBill!;

            // Sync rendering delay
            await new Promise(r => setTimeout(r, 200));

            const reportData = calculateFinalReport(ac, bill, ac.generation);
            const blob = await generateClientReport('executive-report-template', reportData, false);

            if (blob) {
                zip.file(`relatorio_${ac.name.replace(/\s/g, '_')}_${bill.competency.replace(/\//g, '-')}.pdf`, blob);
            }
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(zipBlob);
        a.download = `relatorios.zip`; a.click();
        setIsExporting(false);
        setSelectedClientId(null);
    };

    return { handleExportPDF, handleBatchExport, isExporting };
}
