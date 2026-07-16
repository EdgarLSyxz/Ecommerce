'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
};

const sizeMap: Record<NonNullable<SpinnerProps['size']>, string> = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-6',
};

export function Spinner({ size = 'md', className, label = 'Cargando' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn('inline-flex items-center gap-2', className)}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeMap[size])} />
      {label ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}
