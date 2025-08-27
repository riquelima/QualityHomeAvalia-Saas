import React from 'react';
import { Icon } from './Icon';
import { ICONS } from './constants';

interface DarkModeToggleProps {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ isDarkMode, toggleDarkMode }) => {
    return (
        <button
            onClick={toggleDarkMode}
            className="dark-mode-toggle bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm p-2 rounded-full shadow-md hover:scale-110 transition-transform"
            aria-label="Toggle Dark Mode"
        >
            {isDarkMode ? (
                <Icon path={ICONS.sun} className="w-6 h-6 text-yellow-300" />
            ) : (
                <Icon path={ICONS.moon} className="w-6 h-6 text-primary" />
            )}
        </button>
    );
};