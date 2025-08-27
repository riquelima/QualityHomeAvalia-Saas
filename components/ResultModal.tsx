import React from 'react';
import type { ValuationResult } from '../types';
import { Icon } from './Icon';
import { ICONS } from './constants';

declare global {
    interface Window {
        jspdf: any;
    }
}

interface ResultModalProps {
    result: ValuationResult;
    onClose: () => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {

    const handleDownloadPdf = () => {
        if (!window.jspdf) {
            console.error("jsPDF library is not loaded.");
            alert("Não foi possível gerar o PDF. Verifique sua conexão ou tente novamente.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // --- PDF Content ---
        const primaryColor = '#1E40AF'; // Blue color
        const textColor = '#1E293B';
        const secondaryTextColor = '#64748B';
        let y = 20;

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.setTextColor(primaryColor);
        doc.text('Relatório de Avaliação de Imóvel', 105, y, { align: 'center' });
        y += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(secondaryTextColor);
        doc.text('Gerado por Quality Home Avalia', 105, y, { align: 'center' });

        // Line separator
        y += 10;
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 15;

        // Main Value Section
        doc.setFontSize(14);
        doc.setTextColor(textColor);
        doc.text('Valor Estimado do Imóvel:', 20, y);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(formatCurrency(result.estimatedValue), 190, y, { align: 'right' });
        y += 20;

        // Details Section
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.text('Valor por m²:', 20, y);
        doc.text(formatCurrency(result.valuePerSqM), 190, y, { align: 'right' });
        y += 10;
        doc.text('Nível de Confiança:', 20, y);
        doc.text(`${result.confidenceScore}%`, 190, y, { align: 'right' });
        y += 15;

        // Line separator
        doc.setDrawColor('#E2E8F0');
        doc.setLineWidth(0.2);
        doc.line(20, y, 190, y);
        y += 15;

        // AI Analysis Section
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text('Análise da IA', 20, y);
        y += 10;

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(textColor);
        const analysisLines = doc.splitTextToSize(result.analysis, 170); // 170mm width
        doc.text(analysisLines, 20, y);
        
        // Footer
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(10);
        doc.setTextColor(secondaryTextColor);
        doc.text(`Relatório gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, pageHeight - 10, { align: 'center' });

        // Save the PDF
        doc.save('relatorio-avaliacao-imovel.pdf');
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden fade-in-up relative"
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 left-4 text-secondary-text hover:text-primary-text rounded-full hover:bg-slate-100 p-1 transition-colors z-10"
                    aria-label="Fechar modal"
                >
                    <Icon path={ICONS.close} className="w-6 h-6" />
                </button>

                <div className="p-8">
                    <div className="text-center">
                        <h2 className="text-2xl md:text-3xl font-bold text-primary">Resultado da Avaliação</h2>
                        <p className="text-secondary-text mt-1">Baseado em nossa análise de mercado por IA.</p>
                    </div>

                    <div className="mt-8 text-center bg-blue-50 p-6 rounded-lg">
                        <p className="text-lg text-secondary-text">Valor Estimado do Imóvel</p>
                        <p className="text-4xl md:text-5xl font-bold text-primary my-2">
                            {formatCurrency(result.estimatedValue)}
                        </p>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="bg-slate-100 p-4 rounded-lg">
                             <p className="text-sm font-semibold text-secondary-text">Valor por m²</p>
                             <p className="text-xl font-bold text-primary-text">{formatCurrency(result.valuePerSqM)}</p>
                        </div>
                        <div className="bg-slate-100 p-4 rounded-lg">
                             <p className="text-sm font-semibold text-secondary-text">Nível de Confiança</p>
                             <p className="text-xl font-bold text-primary-text">{result.confidenceScore}%</p>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-primary-text">Análise da IA</h3>
                        <p className="mt-2 text-secondary-text bg-slate-50 p-4 rounded-md border-l-4 border-primary-light">
                            {result.analysis}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex flex-col sm:flex-row gap-4 justify-end">
                    <button 
                        onClick={handleDownloadPdf}
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        <Icon path={ICONS.download} className="w-5 h-5" />
                        Baixar PDF
                    </button>
                    <button className="px-6 py-2 bg-white border border-medium-border hover:bg-slate-100 text-primary-text font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                        <Icon path={ICONS.share} className="w-5 h-5" />
                        Compartilhar
                    </button>
                </div>
            </div>
        </div>
    );
};