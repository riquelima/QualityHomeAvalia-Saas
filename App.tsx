
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ValuationForm } from './components/ValuationForm';
import { ResultModal } from './components/ResultModal';
import { AuthModal } from './components/AuthModal';
import { ReportsPage } from './components/ReportsPage';
import type { ValuationFormData, ValuationResult, User, Report } from './types';
import { getValuation } from './services/geminiService';

const CallToActionBanner: React.FC = () => (
    <div className="bg-primary text-white py-12">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Averigue o preço por metro quadrado, valor de venda e aluguel do seu imóvel junto com os argumentos que o suportam.</h2>
            <button className="bg-cta text-primary-text font-bold py-3 px-8 rounded-md hover:bg-amber-600 transition-colors">
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
            {currentPage === 'home' && <CallToActionBanner />}

            {selectedReport && <ResultModal result={selectedReport.result} onClose={closeModal} />}
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
