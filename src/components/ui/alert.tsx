'use client';

import * as React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertProps = {
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
  description?: string | null;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const variantMap: Record<NonNullable<AlertProps['variant']>, string> = {
  info: 'border-info/20 bg-info-soft text-foreground',
  success: 'border-success/20 bg-success-soft text-foreground',
  warning: 'border-warning/20 bg-warning-soft text-foreground',
  destructive: 'border-destructive/20 bg-destructive-soft text-foreground',
};

const iconMap: Record<NonNullable<AlertProps['variant']>, React.ReactNode> = {
  info: <Info className="size-4 text-info" />,
  success: <CheckCircle2 className="size-4 text-success" />,
  warning: <AlertTriangle className="size-4 text-warning" />,
  destructive: <AlertCircle className="size-4 text-destructive" />,
};

const iconWrapperMap: Record<NonNullable<AlertProps['variant']>, string> = {
  info: 'bg-info/10',
  success: 'bg-success/10',
  warning: 'bg-warning/10',
  destructive: 'bg-destructive/10',
};

export function Alert({
  variant = 'info',
  title,
  description,
  icon,
  className,
  children,
}: AlertProps) {
  return (
    <div
      role={variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3.5 text-sm',
        variantMap[variant],
        className,
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md',
          iconWrapperMap[variant],
        )}
      >
        {icon ?? iconMap[variant]}
      </span>
      <div className="flex-1 space-y-0.5">
        {title ? <p className="font-medium leading-none">{title}</p> : null}
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}
