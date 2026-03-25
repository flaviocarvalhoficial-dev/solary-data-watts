import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
    clientName: string;
    uc: string;
    competency: string;
    generation: string;
    economy: string;
    reduction: string;
    payback: string;
    injected: string;
    totalValue: string;
}

export const generateClientReport = async (elementId: string, data: ReportData, save = true) => {
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

    pdf.setFontSize(22);
    pdf.setTextColor(99, 102, 241);
    pdf.text('SOLARY DATA', 10, 20);
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    pdf.text(`RELATÓRIO MENSAL - COMPETÊNCIA ${data.competency}`, 10, 28);

    pdf.addImage(imgData, 'PNG', 0, 35, pdfWidth, pdfHeight);

    pdf.setFontSize(8);
    pdf.text('Este relatório foi gerado automaticamente pelo sistema Solary Data.', 10, 285);
    pdf.text(`Página 1 de 1`, pdfWidth - 25, 285);

    if (save) {
        pdf.save(`relatorio_${data.clientName.replace(/\s/g, '_')}_${data.competency.replace(/\//g, '-')}.pdf`);
    }

    return pdf.output('blob');
};
