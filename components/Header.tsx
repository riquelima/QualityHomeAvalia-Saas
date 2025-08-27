import React from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
}


export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogoutClick }) => {
    return (
        <header className="bg-white border-b border-medium-border sticky top-0 z-30">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <a href="/" className="flex items-center">
                            <img 
                                src="https://raw.githubusercontent.com/riquelima/avaliao-imvel-quality-home/main/logoTransparente2.png" 
                                alt="Quality Home Avalia Logo" 
                                className="h-8 w-auto" 
                            />
                        </a>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <a href="#" className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">CONSULTAS</a>
                        <a href="#" className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">PREÇOS</a>
                         {user ? (
                            <div className="flex items-center space-x-4">
                               <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                               <span className="text-sm font-semibold text-primary-text">{user.name.split(' ')[0]}</span>
                               <button onClick={onLogoutClick} className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">Sair</button>
                            </div>
                        ) : (
                             <button onClick={onLoginClick} className="text-sm font-semibold text-primary-text hover:text-primary transition-colors">INICIAR SESSÃO</button>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
};