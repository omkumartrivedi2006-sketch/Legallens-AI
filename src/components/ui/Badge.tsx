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
      'bg-neutral-100 text-neutral-700 dark:bg-[#151515] dark:text-[#B8B8B8] dark:border dark:border-white/10',
    primary:
      'bg-blue-50 text-blue-700 border border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    success:
      'bg-emerald-50 text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50',
    warning:
      'bg-amber-50 text-amber-800 border border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    danger:
      'bg-rose-50 text-rose-800 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50',
    outline:
      'border border-neutral-300 text-neutral-700 dark:border-white/15 dark:text-[#B8B8B8]',
  };

  return (
    <span className={cn(base, variants[variant], className)} {...props}>
      {children}
    </span>
  );
};
