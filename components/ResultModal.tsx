import React, { useEffect, useRef } from 'react';
import type { ValuationResult } from '../types';
import { Icon } from './Icon';
import { ICONS } from './constants';

declare global {
    interface Window {
        jspdf: any;
        Chart: any;
        L: any;
    }
}

interface ResultModalProps {
    result: ValuationResult;
    onClose: () => void;
}

const formatCurrency = (value: number, short = false) => {
    if (short) {
        if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(1)}M`;
        if (value >= 1e3) return `R$ ${(value / 1e3).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-white rounded-lg shadow-md border border-slate-200 p-6 mb-6 ${className}`}>
        <h3 className="text-xl font-bold text-red-700 mb-4">{title}</h3>
        {children}
    </div>
);

const PriceCard: React.FC<{ title: string; value: number; primary?: boolean }> = ({ title, value, primary = false }) => (
    <div className={`p-4 rounded-lg ${primary ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}>
        <p className={`text-sm ${primary ? 'text-slate-300' : 'text-slate-500'}`}>{title}</p>
        <p className={`text-2xl font-bold ${primary ? 'text-white' : 'text-slate-800'}`}>{formatCurrency(value)}</p>
    </div>
);

const FeatureIcon: React.FC<{ icon: keyof typeof ICONS; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center text-center">
        <Icon path={ICONS[icon]} className="w-8 h-8 text-slate-600 mb-2" />
        <p className="font-bold text-lg">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
    </div>
);


export const ResultModal: React.FC<ResultModalProps> = ({ result, onClose }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any | null>(null);
    const chartRefs = {
        bedrooms: useRef<HTMLCanvasElement>(null),
        bathrooms: useRef<HTMLCanvasElement>(null),
        parking: useRef<HTMLCanvasElement>(null),
        marketTrend: useRef<HTMLCanvasElement>(null),
    };

    const handleDownloadPdf = () => {
        // A simplified PDF generation due to complexity of rendering charts/maps
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("Relatório de Avaliação de Imóvel", 14, 22);
        
        doc.setFontSize(12);
        doc.text(`Endereço: ${result.address}`, 14, 32);
        doc.text(`Data: ${result.generatedDate}`, 14, 38);
        
        doc.setFontSize(14);
        doc.text(`Valor de Venda Estimado: ${formatCurrency(result.salePrice.estimated)}`, 14, 50);
        doc.text(`Valor de Aluguel Estimado: ${formatCurrency(result.rentPrice.estimated)}`, 14, 58);
        
        // ... add more text-based info
        
        doc.save('relatorio-quality-home.pdf');
    };

    useEffect(() => {
        // Initialize Map
        if (mapRef.current && !mapInstance.current && result.address) {
             fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(result.address)}&countrycodes=br&limit=1`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const { lat, lon } = data[0];
                        const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
                        mapInstance.current = window.L.map(mapRef.current).setView(coords, 15);
                        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance.current);
                        window.L.marker(coords).addTo(mapInstance.current);
                    }
                });
        }
        
        // Initialize Charts
        const chartInstances: any[] = [];
        const commonBarOptions = {
            indexAxis: 'y',
            scales: { x: { beginAtZero: true, max: 100 }, y: { grid: { display: false } } },
            plugins: { legend: { display: true, position: 'top' as const } }
        };

        if (chartRefs.bedrooms.current && result.sectorStatistics.bedrooms) {
             const ctx = chartRefs.bedrooms.current.getContext('2d');
             if(ctx) chartInstances.push(new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: result.sectorStatistics.bedrooms.map(d => `${d.label} Quarto(s)`),
                    datasets: [
                        { label: 'Este imóvel', data: result.sectorStatistics.bedrooms.map(d => d.propertyValue), backgroundColor: '#DC2626' },
                        { label: 'Média do setor', data: result.sectorStatistics.bedrooms.map(d => d.averageValue), backgroundColor: '#374151' }
                    ]
                },
                options: commonBarOptions,
            }));
        }
        // ... similar chart for bathrooms and parking
        if (chartRefs.bathrooms.current && result.sectorStatistics.bathrooms) {
            const ctx = chartRefs.bathrooms.current.getContext('2d');
            if (ctx) chartInstances.push(new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: result.sectorStatistics.bathrooms.map(d => `${d.label} Banheiro(s)`),
                    datasets: [
                        { label: 'Este imóvel', data: result.sectorStatistics.bathrooms.map(d => d.propertyValue), backgroundColor: '#DC2626' },
                        { label: 'Média do setor', data: result.sectorStatistics.bathrooms.map(d => d.averageValue), backgroundColor: '#374151' }
                    ]
                },
                options: commonBarOptions,
            }));
        }
        if (chartRefs.parking.current && result.sectorStatistics.parking) {
            const ctx = chartRefs.parking.current.getContext('2d');
            if (ctx) chartInstances.push(new window.Chart(ctx, {
                type: 'bar',
                data: {
                    labels: result.sectorStatistics.parking.map(d => `${d.label} Vaga(s)`),
                    datasets: [
                        { label: 'Este imóvel', data: result.sectorStatistics.parking.map(d => d.propertyValue), backgroundColor: '#DC2626' },
                        { label: 'Média do setor', data: result.sectorStatistics.parking.map(d => d.averageValue), backgroundColor: '#374151' }
                    ]
                },
                options: commonBarOptions,
            }));
        }

        if (chartRefs.marketTrend.current && result.marketTrend) {
             const ctx = chartRefs.marketTrend.current.getContext('2d');
             if(ctx) chartInstances.push(new window.Chart(ctx, {
                type: 'line',
                data: {
                    labels: result.marketTrend.labels,
                    datasets: [
                        { label: 'Preço de Venda', data: result.marketTrend.salePrices, borderColor: '#DC2626', tension: 0.1 },
                        { label: 'Preço de Aluguel', data: result.marketTrend.rentPrices, borderColor: '#374151', tension: 0.1 }
                    ]
                },
             }));
        }

        return () => {
            chartInstances.forEach(chart => chart.destroy());
        };

    }, [result]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-start p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div 
                className="bg-slate-100 rounded-lg shadow-2xl max-w-4xl w-full my-8 fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-white p-6 rounded-t-lg border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Análise de Imóveis: <span className="text-red-700">{result.address.split(',')[0]}</span></h2>
                        <p className="text-sm text-slate-500">
                            Cidade: <span className="font-semibold">{result.city}</span> | 
                            Consulta gerada em: <span className="font-semibold">{result.generatedDate}</span> | 
                            Tipo: <span className="font-semibold">{result.propertyType}</span>
                        </p>
                    </div>
                     <button 
                        onClick={onClose} 
                        className="text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 p-2 transition-colors"
                        aria-label="Fechar modal"
                    >
                        <Icon path={ICONS.close} className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                             <div ref={mapRef} className="h-96 w-full rounded-lg border border-slate-200 shadow-md"></div>
                             <div className="bg-red-700 text-white p-4 rounded-lg shadow-md mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                                <FeatureIcon icon="ruler" label="Área (m²)" value={result.area} />
                                <FeatureIcon icon="bed" label="Quartos" value={result.bedrooms} />
                                <FeatureIcon icon="bath" label="Banheiros" value={result.bathrooms} />
                                <FeatureIcon icon="car" label="Vagas" value={result.parkingSpaces} />
                             </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <PriceCard title="Preço máximo de venda estimado" value={result.salePrice.max} />
                            <PriceCard title="Preço mínimo de venda estimado" value={result.salePrice.min} />
                            <PriceCard title="Preço estimado por m²" value={result.pricePerSqM} primary />
                            <PriceCard title="Preço estimado de aluguel" value={result.rentPrice.estimated} />
                        </div>
                    </div>
                    
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Section title="Informações geográficas">
                            <h4 className="font-bold text-slate-600 mb-2">Pontos de interesse próximos</h4>
                            {result.pointsOfInterest.map(poi => (
                                <div key={poi.type} className="flex justify-between items-center border-b py-2">
                                    <span className="font-semibold">{poi.type}</span>
                                    <span className="text-xl font-bold text-red-700">{poi.count}</span>
                                </div>
                            ))}
                        </Section>

                        <Section title="Segurança na área">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold">Índice de Segurança para a área</span>
                                <span className="bg-red-700 text-white text-xl font-bold px-3 py-1 rounded-md">{result.securityIndex.overallScore}</span>
                            </div>
                            {result.securityIndex.metrics.map(metric => (
                                <div key={metric.type} className="mb-2">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold">{metric.type}</span>
                                        <span className="text-slate-500">{metric.score > 70 ? "Mais seguro" : "Menos seguro"}</span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className="h-2.5 rounded-full" style={{ width: `${metric.score}%`, backgroundColor: metric.score > 70 ? '#10B981' : '#F59E0B' }}></div>
                                    </div>
                                </div>
                            ))}
                        </Section>
                    </div>

                     <Section title="Custos de Transação Associados">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {result.transactionCosts.map(cost => (
                                <div key={cost.name} className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
                                    <p className="font-semibold">{cost.name}</p>
                                    <p className="text-2xl font-bold text-red-700 my-1">{formatCurrency(cost.value)}</p>
                                    <p className="text-xs text-slate-500">{cost.description}</p>
                                </div>
                            ))}
                        </div>
                     </Section>

                     <Section title="Estatísticas do Setor">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div>
                                <h4 className="font-bold text-center mb-2">Número de quartos</h4>
                                <canvas ref={chartRefs.bedrooms}></canvas>
                           </div>
                           <div>
                                <h4 className="font-bold text-center mb-2">Número de banheiros</h4>
                                <canvas ref={chartRefs.bathrooms}></canvas>
                           </div>
                           <div>
                                <h4 className="font-bold text-center mb-2">Número de vagas</h4>
                                <canvas ref={chartRefs.parking}></canvas>
                           </div>
                        </div>
                     </Section>

                     <Section title="Comportamento de Mercado">
                         <h4 className="font-bold text-center mb-2">Tendências de preço no setor</h4>
                         <canvas ref={chartRefs.marketTrend}></canvas>
                     </Section>

                </div>
                <div className="bg-white p-4 rounded-b-lg border-t border-slate-200 flex justify-end gap-4">
                     <button 
                        onClick={handleDownloadPdf}
                        className="px-6 py-2 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        <Icon path={ICONS.download} className="w-5 h-5" />
                        Baixar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};