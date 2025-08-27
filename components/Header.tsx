
import React, { useState, useEffect, useRef } from 'react';
import type { User } from '../types';
import { Icon } from './Icon';
import { ICONS } from './constants';

interface HeaderProps {
    user: User | null;
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onReportsClick: () => void;
    onNavigateHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLoginClick, onLogoutClick, onReportsClick, onNavigateHome }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white border-b border-medium-border sticky top-0 z-40">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <button onClick={onNavigateHome} className="flex items-center">
                            <img 
                                src="https://raw.githubusercontent.com/riquelima/avaliao-imvel-quality-home/main/logoTransparente2.png" 
                                alt="Quality Home Avalia Logo" 
                                className="h-8 w-auto" 
                            />
                        </button>
                    </div>
                    <nav className="hidden md:flex items-center space-x-8">
                        <button onClick={onNavigateHome} className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">CONSULTAS</button>
                        <button onClick={onNavigateHome} className="text-sm font-semibold text-secondary-text hover:text-primary transition-colors">PREÇOS</button>
                         {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={toggleDropdown} className="flex items-center space-x-2">
                                   <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                                   <span className="text-sm font-semibold text-primary-text">{user.name.split(' ')[0]}</span>
                                   <Icon path={ICONS.chevronDown} className={`w-4 h-4 text-secondary-text transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isDropdownOpen && (
                                     <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-medium-border">
                                        <button 
                                            onClick={() => { onReportsClick(); setIsDropdownOpen(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-primary-text hover:bg-slate-100"
                                        >
                                            Meus Relatórios
                                        </button>
                                        <button 
                                            onClick={() => { onLogoutClick(); setIsDropdownOpen(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-primary-text hover:bg-slate-100"
                                        >
                                            Sair
                                        </button>
                                    </div>
                                )}
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
