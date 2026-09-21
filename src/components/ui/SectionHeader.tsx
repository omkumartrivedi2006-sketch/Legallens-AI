import React from 'react';
import { cn } from '../../lib/utils';
import { Badge } from './Badge';

export interface SectionHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  badge,
  title,
  subtitle,
  align = 'center',
  className,
}) => {
  return (
    <div
      className={cn(
        'max-w-3xl mb-12 md:mb-16',
        align === 'center' ? 'mx-auto text-center' : 'text-left',
        className
      )}
    >
      {badge && (
        <div className={cn('mb-3', align === 'center' ? 'flex justify-center' : '')}>
          <Badge variant="primary" className="px-3 py-1 text-xs tracking-wide uppercase font-semibold">
            {badge}
          </Badge>
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
};
