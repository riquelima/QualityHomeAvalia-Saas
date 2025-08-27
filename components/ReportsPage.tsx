import React from 'react';
import type { Report } from '../types';

interface ReportsPageProps {
    reports: Report[];
    onViewReport: (report: Report) => void;
    onBack: () => void;
    onCreateNew: () => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const ReportCard: React.FC<{ report: Report; onViewReport: (report: Report) => void; }> = ({ report, onViewReport }) => (
    <div className="bg-white rounded-lg shadow-md border border-medium-border p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
        <div>
            <div className="mb-4">
                <p className="text-sm text-secondary-text">Endereço</p>
                <p className="font-semibold text-primary-text truncate" title={report.formData.address}>
                    {report.formData.address || 'Endereço não informado'}
                </p>
            </div>
            <div className="mb-4">
                <p className="text-sm text-secondary-text">Data da Avaliação</p>
                <p className="font-semibold text-primary-text">{report.date}</p>
            </div>
            <div className="mb-6">
                <p className="text-sm text-secondary-text">Valor de Venda Estimado</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(report.result.salePrice.estimated)}</p>
            </div>
        </div>
        <button
            onClick={() => onViewReport(report)}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-md transition-colors"
        >
            Ver Relatório Completo
        </button>
    </div>
);

export const ReportsPage: React.FC<ReportsPageProps> = ({ reports, onViewReport, onBack, onCreateNew }) => {
    return (
        <div className="container mx-auto px-6 py-8 md:py-16 fade-in-up">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-primary-text">Meus Relatórios de Avaliação</h1>
                <button onClick={onBack} className="px-4 py-2 text-sm font-semibold text-secondary-text hover:text-primary transition-colors">
                    &larr; Voltar para o início
                </button>
            </div>

            {reports.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reports.map(report => (
                        <ReportCard key={report.id} report={report} onViewReport={onViewReport} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-medium-border">
                    <h2 className="text-xl font-semibold text-primary-text">Nenhum relatório encontrado</h2>
                    <p className="text-secondary-text mt-2 mb-6">Você ainda não gerou nenhuma avaliação de imóvel.</p>
                    <button 
                        onClick={onCreateNew}
                        className="px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md shadow-md"
                    >
                        Criar Nova Avaliação
                    </button>
                </div>
            )}
        </div>
    );
};
