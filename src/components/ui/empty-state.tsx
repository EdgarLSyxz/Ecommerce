'use client';

import * as React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-5 rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 px-6 py-20 text-center',
        'animate-[fade-in_300ms_ease-out]',
        className,
      )}
    >
      <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary ring-1 ring-primary/20 transition-transform hover:scale-110">
        {icon ?? <Inbox className="size-7" />}
      </div>
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}
