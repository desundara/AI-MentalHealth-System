import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    );

    const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
    );

    const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
        onClick={toggleTheme}
        className={`
            relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
            bg-ink-100 dark:bg-ink-800 
            text-ink-600 dark:text-ink-300
            hover:bg-ink-200 dark:hover:bg-ink-700
            transition-all duration-200 group
            ${className}
        `}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
        <span className="transition-transform duration-300 group-hover:scale-110">
            {isDark ? <SunIcon /> : <MoonIcon />}
        </span>
        <span className="hidden sm:inline">
            {isDark ? 'Light' : 'Dark'}
        </span>
        </button>
    );
};

export default ThemeToggle;
