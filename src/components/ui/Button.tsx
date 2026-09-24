import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 select-none';

    const variants = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-xs border border-blue-500/30 backdrop-blur-xs',
      secondary:
        'bg-white/60 text-neutral-900 border border-slate-200/80 hover:bg-white/90 dark:bg-white/[0.045] dark:text-neutral-100 dark:border-white/10 dark:hover:bg-white/[0.08] dark:hover:border-white/20 backdrop-blur-md shadow-xs',
      outline:
        'bg-transparent border border-slate-300/80 text-neutral-800 hover:bg-white/60 hover:text-neutral-950 dark:border-white/15 dark:text-white dark:hover:bg-white/[0.06] dark:hover:border-white/25 backdrop-blur-xs',
      ghost:
        'bg-transparent text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/50 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-white/[0.06]',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 shadow-xs border border-rose-500/30 dark:bg-rose-600/90 dark:hover:bg-rose-600',
    };

    const sizes = {
      sm: 'text-xs h-8 px-3 gap-1.5',
      md: 'text-sm h-10 px-4 gap-2',
      lg: 'text-sm h-11 px-5 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
