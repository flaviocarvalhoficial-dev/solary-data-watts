import React from 'react';
import WattsMascot from './WattsMascot';
import { FileText, RefreshCw, Zap, FileArchive } from 'lucide-react';

interface InvoiceProcessingViewProps {
    isDragging: boolean;
    isUploading: boolean;
    handleDragOver: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InvoiceProcessingView: React.FC<InvoiceProcessingViewProps> = ({
    isDragging,
    isUploading,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileUpload
}) => {
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
            <div
                className="card"
                style={{
                    padding: '80px 40px',
                    textAlign: 'center',
                    background: isDragging ? 'rgba(232, 89, 60, 0.03)' : 'var(--color-bg-surface)',
                    border: isDragging ? '2px dashed var(--color-primary)' : '2px dashed var(--color-primary-light)',
                    borderRadius: '24px',
                    boxShadow: isDragging ? '0 20px 40px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div style={{ marginBottom: '32px', position: 'relative', display: 'inline-block' }}>
                    <WattsMascot state={isDragging ? 'saudando' : 'celebrando'} size={160} />
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                    {isDragging ? 'Solte para Iniciar!' : 'Central de Processamento de Faturas'}
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                    Nossa IA identifica a Unidade Consumidora (UC) automaticamente nos PDFs e vincula os dados aos sistemas correspondentes da sua frota.
                </p>

                <label className="btn btn-primary" style={{ padding: '14px 40px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(232, 89, 60, 0.15)', cursor: 'pointer' }}>
                    {isUploading ? (
                        <>
                            <RefreshCw size={20} className="spin" /> Processando Arquivos...
                        </>
                    ) : (
                        <>
                            <FileArchive size={20} /> Selecionar PDFs para Upload
                        </>
                    )}
                    <input type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                </label>

                <p style={{ marginTop: '24px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {isDragging ? 'Solte para importar agora mesmo' : 'Arraste seus arquivos PDF aqui para iniciar o processamento em lote.'}
                </p>
            </div>

            <div style={{ marginTop: '60px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                {[
                    { icon: <FileText size={24} />, title: "Leitura Automatizada", text: "Extraímos consumo, injeção, tarifa e tributos diretamente do PDF original." },
                    { icon: <RefreshCw size={24} />, title: "Vínculo Inteligente", text: "O sistema detecta a UC e associa a fatura ao cliente correto sem cliques extras." },
                    { icon: <Zap size={24} />, title: "Cálculo de Economia", text: "Geramos o relatório executivo cruzando os dados da plataforma solar com a fatura." }
                ].map((step, i) => (
                    <div key={i} style={{ textAlign: 'left' }}>
                        <div style={{ color: 'var(--color-primary)', marginBottom: '16px', background: 'var(--color-primary-muted)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {step.icon}
                        </div>
                        <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{step.title}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{step.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvoiceProcessingView;
