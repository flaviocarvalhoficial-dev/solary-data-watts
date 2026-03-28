import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { FinalReportObject } from './solarHelpers';

export const generateClientReport = async (elementId: string, data: FinalReportObject, save = true) => {
    const element = document.getElementById(elementId);
    if (!element) return null;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
    });

    // Converte para JPEG com qualidade controlada (0.8) para reduzir tamanho do arquivo significativamente
    const imgData = canvas.toDataURL('image/jpeg', 0.8);

    // Target standard A4 width (210mm) but calculate dynamic height to avoid distortion
    const pdfWidth = 210;
    const canvasRatio = canvas.height / canvas.width;
    const pdfHeight = pdfWidth * canvasRatio;

    // Criamos um documento com a altura real do conteúdo para evitar que fique achatado
    const finalPdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
        compress: true
    });

    finalPdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    if (save) {
        finalPdf.save(`relatorio_${data.cliente.replace(/\s/g, '_')}_${data.competencia.replace(/\//g, '-')}.pdf`);
    }

    return finalPdf.output('blob');
};
