import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'labeled';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, variant = 'icon' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600',
        variant === 'labeled' ? 'px-3 py-2 gap-2 text-sm' : 'h-9 w-9',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
      {variant === 'labeled' && (
        <span className="capitalize">{isDark ? 'Light' : 'Dark'} Mode</span>
      )}
    </button>
  );
};
