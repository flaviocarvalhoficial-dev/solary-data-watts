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

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // A4 height is 297mm. If report is longer, it will scale down or we could split.
    // For now, we capture as one high-qual block.
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(297, pdfHeight));

    if (save) {
        pdf.save(`relatorio_${data.cliente.replace(/\s/g, '_')}_${data.competencia.replace(/\//g, '-')}.pdf`);
    }

    return pdf.output('blob');
};
