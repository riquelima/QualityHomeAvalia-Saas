
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ValuationForm } from './components/ValuationForm';
import { ResultModal } from './components/ResultModal';
import { AuthModal } from './components/AuthModal';
import { ReportsPage } from './components/ReportsPage';
import type { ValuationFormData, ValuationResult, User, Report } from './types';
import { getValuation } from './services/geminiService';

const sampleReportResult: ValuationResult = {
    city: "São Paulo",
    generatedDate: new Date().toLocaleDateString('pt-BR'),
    propertyType: "Apartamento",
    address: "Avenida Paulista, 1578 - Bela Vista, São Paulo - SP, Brasil",
    salePrice: {
        max: 950000,
        min: 820000,
        estimated: 875000,
    },
    rentPrice: {
        max: 4200,
        min: 3500,
        estimated: 3800,
    },
    pricePerSqM: 9722.22,
    area: 90,
    bedrooms: 2,
    bathrooms: 2,
    parkingSpaces: 1,
    pointsOfInterest: [
        { type: "Cinemas", count: 8, description: "Próximos à propriedade para lazer e cultura." },
        { type: "Centros Comerciais", count: 5, description: "Ampla variedade de lojas e serviços." },
    ],
    securityIndex: {
        overallScore: 78,
        metrics: [
            { type: "Roubo de bicicleta", score: 65, description: "Risco moderado." },
            { type: "Roubo comercial", score: 85, description: "Mais seguro." },
            { type: "Roubo residencial", score: 82, description: "Mais seguro." },
        ],
    },
    transactionCosts: [
        { name: "Registro de escritura", value: 4725, description: "Aproximadamente 0,54% do valor do imóvel." },
        { name: "ITBI (Imposto)", value: 26250, description: "3% do valor do imóvel, cobrado do comprador." },
        { name: "Taxas de inscrição", value: 13959, description: "1,6% do valor, cobrado do comprador." },
    ],
    sectorStatistics: {
        bedrooms: [
            { label: "1", propertyValue: 0, averageValue: 25 },
            { label: "2", propertyValue: 60, averageValue: 45 },
            { label: "3+", propertyValue: 0, averageValue: 30 },
        ],
        bathrooms: [
            { label: "1", propertyValue: 0, averageValue: 30 },
            { label: "2", propertyValue: 55, averageValue: 50 },
            { label: "3+", propertyValue: 0, averageValue: 20 },
        ],
        parking: [
            { label: "0", propertyValue: 0, averageValue: 15 },
            { label: "1", propertyValue: 70, averageValue: 60 },
            { label: "2+", propertyValue: 0, averageValue: 25 },
        ],
    },
    marketTrend: {
        labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun"],
        salePrices: [860000, 865000, 870000, 872000, 878000, 875000],
        rentPrices: [3700, 3750, 3780, 3800, 3850, 3800],
    },
};

const CallToActionBanner: React.FC<{ onShowSample: () => void }> = ({ onShowSample }) => (
    <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Averigue o preço por metro quadrado, valor de venda e aluguel do seu imóvel junto com os argumentos que o suportam.</h2>
            <button 
                onClick={onShowSample}
                className="bg-cta text-primary-text font-bold py-3 px-8 rounded-md hover:bg-amber-600 transition-colors">
                VER RELATÓRIO DE AMOSTRA
            </button>
        </div>
    </div>
);

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<ValuationFormData | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [currentPage, setCurrentPage] = useState<'home' | 'reports'>('home');
    const [showSampleReport, setShowSampleReport] = useState(false);

    // Load reports from localStorage on user login
    useEffect(() => {
        if (user) {
            try {
                const storedReports = localStorage.getItem(`reports_${user.email}`);
                if (storedReports) {
                    setReports(JSON.parse(storedReports));
                }
            } catch (e) {
                console.error("Failed to load reports from localStorage", e);
                setReports([]);
            }
        } else {
            setReports([]);
        }
    }, [user]);

    // Re-run evaluation if it was pending login
    useEffect(() => {
        if (user && pendingFormData) {
            handleFormSubmit(pendingFormData);
            setPendingFormData(null); 
        }
    }, [user, pendingFormData]);

    const handleFormSubmit = async (formData: ValuationFormData) => {
        if (!user) {
            setPendingFormData(formData);
            setShowAuthModal(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setSelectedReport(null);
        try {
            const result = await getValuation(formData);
            const newReport: Report = {
                id: new Date().toISOString(),
                date: new Date().toLocaleDateString('pt-BR'),
                formData,
                result,
            };
            
            // Update state and save to localStorage
            setReports(prevReports => {
                const updatedReports = [newReport, ...prevReports];
                try {
                     localStorage.setItem(`reports_${user.email}`, JSON.stringify(updatedReports));
                } catch(e) {
                    console.error("Failed to save report to localStorage", e);
                }
                return updatedReports;
            });

            setSelectedReport(newReport);

        } catch (e) {
            console.error(e);
            setError('Falha ao avaliar o imóvel. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const closeModal = () => {
        setSelectedReport(null);
        setError(null);
        setShowSampleReport(false);
    }

    const handleLoginSuccess = (loggedInUser: User) => {
        setUser(loggedInUser);
        setShowAuthModal(false);
    };

    const handleLogout = () => {
        setUser(null);
        setCurrentPage('home');
        if (window.google) {
            window.google.accounts.id.disableAutoSelect();
        }
    };
    
    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setCurrentPage('home'); // Go to home to show modal over it
    }

    const handleNavigateHome = () => setCurrentPage('home');

    return (
        <div className="min-h-screen bg-white text-primary-text flex flex-col">
            <Header 
                user={user}
                onLoginClick={() => setShowAuthModal(true)}
                onLogoutClick={handleLogout}
                onReportsClick={() => setCurrentPage('reports')}
                onNavigateHome={handleNavigateHome}
            />
            <main className="flex-grow">
                {currentPage === 'home' ? (
                    <div className="container mx-auto px-6 py-8 md:py-16">
                        <ValuationForm onEvaluate={handleFormSubmit} isLoading={isLoading} />
                    </div>
                ) : (
                    <ReportsPage 
                        reports={reports} 
                        onViewReport={handleViewReport}
                        onBack={() => setCurrentPage('home')}
                        onCreateNew={() => setCurrentPage('home')}
                    />
                )}
            </main>
            {currentPage === 'home' && <CallToActionBanner onShowSample={() => setShowSampleReport(true)} />}

            {selectedReport && <ResultModal result={selectedReport.result} onClose={closeModal} />}
            {showSampleReport && <ResultModal result={sampleReportResult} onClose={() => setShowSampleReport(false)} />}
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onLoginSuccess={handleLoginSuccess} />}
            {error && !isLoading && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50" onClick={closeModal}>
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center fade-in-up" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-warning mb-4">Ocorreu um Erro</h2>
                        <p className="text-secondary-text">{error}</p>
                        <button
                            onClick={closeModal}
                            className="mt-6 w-full bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Fechar
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default App;