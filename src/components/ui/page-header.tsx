'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

type PageHeaderProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
};

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  actions,
  loading,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between',
        className,
      )}
    >
      <div className="flex items-start gap-4">
        {icon ? (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft via-primary/10 to-primary/5 text-primary ring-1 ring-primary/20 shadow-sm transition-transform hover:scale-105">
            {icon}
          </div>
        ) : null}
        <div className="space-y-2.5">
          {eyebrow ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-gradient-to-r from-primary-soft to-primary/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              {eyebrow}
            </span>
          ) : null}
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground sm:text-[28px]">
            {title}
            {loading ? <Spinner size="sm" /> : null}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5 lg:flex-shrink-0">{actions}</div>
      ) : null}
    </div>
  );
}
