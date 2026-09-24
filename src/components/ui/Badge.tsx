import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium transition-colors select-none';

  const variants = {
    default:
      'bg-slate-100/70 text-neutral-700 border border-slate-200/80 dark:bg-white/[0.045] dark:text-[#B8B8B8] dark:border-white/10 backdrop-blur-xs',
    primary:
      'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/25 backdrop-blur-xs',
    success:
      'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 backdrop-blur-xs',
    warning:
      'bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/25 backdrop-blur-xs',
    danger:
      'bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-500/25 backdrop-blur-xs',
    outline:
      'border border-slate-300/80 text-neutral-700 dark:border-white/15 dark:text-[#B8B8B8] backdrop-blur-xs',
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
