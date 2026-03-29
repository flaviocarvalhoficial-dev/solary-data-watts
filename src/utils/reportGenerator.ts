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

    // Converte para JPEG com qualidade controlada (0.8) para reduzir tamanho
    const imgData = canvas.toDataURL('image/jpeg', 0.8);

    // PDF em formato A4 (210mm x 297mm)
    const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Proporção para manter a largura do PDF
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Adiciona a primeira página
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Se o conteúdo for maior que uma página A4, adiciona novas páginas
    while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
    }

    if (save) {
        pdf.save(`relatorio_${data.cliente.replace(/\s/g, '_')}_${data.competencia.replace(/\//g, '-')}.pdf`);
    }

    return pdf.output('blob');
};
