import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="bg-white border-b border-medium-border sticky top-0 z-30">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <a href="/" className="flex items-center">
                            <img 
                                src="https://raw.githubusercontent.com/riquelima/avaliao-imvel-quality-home/main/logoTransparente2.png" 
                                alt="RED ATLAS VALUATIONS Logo" 
                                className="h-8 w-auto" 
                            />
                        </a>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">CONSULTAS</a>
                        <a href="#" className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">PREÇOS</a>
                        <a href="#" className="text-sm font-semibold text-primary-text hover:text-primary transition-colors">INICIAR SESSÃO</a>
                    </nav>
                </div>
            </div>
        </header>
    );
};