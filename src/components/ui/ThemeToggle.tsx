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
        'relative inline-flex items-center justify-center rounded-lg p-2 text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 dark:text-[#B8B8B8] dark:hover:text-white dark:hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-blue-600',
        variant === 'labeled' ? 'px-3 py-2 gap-2 text-xs font-medium' : 'h-8 w-8',
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 hover:rotate-45 text-amber-400" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 -rotate-12 hover:rotate-0 text-neutral-700" />
      )}
      {variant === 'labeled' && (
        <span className="capitalize">{isDark ? 'Light' : 'Dark'} Mode</span>
      )}
    </button>
  );
};
