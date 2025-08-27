
import React, { useState } from 'react';
import { Header } from './components/Header';
import { ValuationForm } from './components/ValuationForm';
import { ResultModal } from './components/ResultModal';
import type { ValuationFormData, ValuationResult } from './types';
import { getValuation } from './services/geminiService';

const CallToActionBanner: React.FC = () => (
    <div className="bg-primary-red text-white py-12">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Averigue o preço por metro quadrado, valor de venda e aluguel do seu imóvel junto com os argumentos que o suportam.</h2>
            <button className="bg-white text-primary-red font-bold py-3 px-8 rounded-md hover:bg-gray-200 transition-colors">
                VER RELATÓRIO DE AMOSTRA
            </button>
        </div>
    </div>
);


const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [valuationResult, setValuationResult] = useState<ValuationResult | null>(null);

    const handleFormSubmit = async (formData: ValuationFormData) => {
        setIsLoading(true);
        setError(null);
        setValuationResult(null);
        try {
            const result = await getValuation(formData);
            setValuationResult(result);
        } catch (e) {
            console.error(e);
            setError('Falha ao avaliar o imóvel. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const closeResultModal = () => {
        setValuationResult(null);
        setError(null);
    }

    return (
        <div className="min-h-screen bg-white text-primary-text flex flex-col">
            <Header />
            <main className="flex-grow">
                <div className="container mx-auto px-6 py-8 md:py-16">
                    <ValuationForm onEvaluate={handleFormSubmit} isLoading={isLoading} />
                </div>
            </main>
            <CallToActionBanner />
            {valuationResult && <ResultModal result={valuationResult} onClose={closeResultModal} />}
            {error && !isLoading && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center z-50" onClick={closeResultModal}>
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full text-center fade-in-up" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-warning mb-4">Ocorreu um Erro</h2>
                        <p className="text-secondary-text">{error}</p>
                        <button
                            onClick={closeResultModal}
                            className="mt-6 w-full bg-primary-red hover:bg-primary-red-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors"
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