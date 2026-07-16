'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SortState = 'asc' | 'desc' | 'none';

type SortableHeaderProps = {
  label: string;
  sort: SortState;
  onSortToggle: () => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
  skipDefault?: boolean;
};

function nextSortLabel(current: SortState, skipDefault: boolean): string {
  if (current === 'asc') return skipDefault ? 'Ordenar Z → A' : 'Ordenar de mayor a menor';
  if (current === 'desc') return skipDefault ? 'Ordenar A → Z' : 'Quitar orden';
  return skipDefault ? 'Ordenar A → Z' : 'Ordenar de menor a mayor';
}

export function SortableHeader({
  label,
  sort,
  onSortToggle,
  align = 'left',
  className,
  skipDefault = false,
}: SortableHeaderProps) {
  const Icon =
    sort === 'asc' ? ChevronUp : sort === 'desc' ? ChevronDown : ChevronsUpDown;
  const ariaSort: 'ascending' | 'descending' | 'none' =
    sort === 'asc' ? 'ascending' : sort === 'desc' ? 'descending' : 'none';
  const isActive = sort !== 'none';
  return (
    <span
      role="columnheader"
      aria-sort={ariaSort}
      className={cn('inline-flex', className)}
    >
      <button
        type="button"
        onClick={onSortToggle}
        title={nextSortLabel(sort, skipDefault)}
        aria-label={`${label}: ${nextSortLabel(sort, skipDefault)}`}
        className={cn(
          'group inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all',
          'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
          'focus-visible:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card',
          isActive && 'bg-primary-soft/60 text-primary hover:bg-primary-soft',
          align === 'right' && 'flex-row-reverse',
          align === 'center' && 'justify-center',
        )}
      >
        <span>{label.toUpperCase()}</span>
        <span
          aria-hidden
          className={cn(
            'inline-flex items-center gap-1 rounded transition-all px-1 py-0.5',
            isActive
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground/50 opacity-60 group-hover:opacity-100 group-hover:text-foreground',
          )}
        >
          <Icon className="size-3" />
        </span>
      </button>
    </span>
  );
}

type CycleFilterHeaderProps<TValue extends string> = {
  label: string;
  cycle: ReadonlyArray<{ value: TValue; label: string }>;
  current: TValue;
  onCycle: () => void;
  onClear?: () => void;
  align?: 'left' | 'right' | 'center';
  className?: string;
  showLabelInHeader?: boolean;
  showChevronWhenInactive?: boolean;
};

export function CycleFilterHeader<TValue extends string>({
  label,
  cycle,
  current,
  onCycle,
  onClear,
  align = 'left',
  className,
  showLabelInHeader = false,
  showChevronWhenInactive = false,
}: CycleFilterHeaderProps<TValue>) {
  const active = current !== cycle[0].value;
  const currentLabel = cycle.find((c) => c.value === current)?.label ?? label;
  const headerText = active && showLabelInHeader ? currentLabel : label;
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear?.();
  };
  return (
    <span
      role="columnheader"
      className={cn(
        'group inline-flex cursor-pointer select-none items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all',
        'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
        'focus-within:bg-muted/60 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card',
        active && 'text-primary',
        align === 'right' && 'flex-row-reverse',
        align === 'center' && 'justify-center',
        className,
      )}
      title={
        active
          ? `Click en «${label}» para cambiar. Click en la ✕ para quitar el filtro.`
          : `Filtrar por ${label.toLowerCase()}`
      }
    >
      <button
        type="button"
        onClick={onCycle}
        aria-label={active ? `Cambiar filtro de ${label.toLowerCase()}` : `Filtrar por ${label.toLowerCase()}`}
        className="inline-flex cursor-pointer items-center gap-1.5 focus:outline-none"
      >
        <span>{headerText.toUpperCase()}</span>
        {!active && showLabelInHeader && showChevronWhenInactive ? (
          <span
            aria-hidden
            className={cn(
              'inline-flex items-center gap-1 rounded px-1 py-0.5 transition-all',
              'text-muted-foreground/50 opacity-60 group-hover:opacity-100 group-hover:text-foreground',
            )}
          >
            <ChevronsUpDown className="size-3" />
          </span>
        ) : null}
        {!showLabelInHeader ? (
          <span
            aria-hidden
            className={cn(
              'inline-flex items-center gap-1 rounded transition-all px-1.5 py-0.5',
              active
                ? 'text-primary'
                : 'text-muted-foreground/50 opacity-60 group-hover:opacity-100 group-hover:text-foreground',
            )}
          >
            {active ? (
              <span className="text-[10px] font-semibold">{currentLabel}</span>
            ) : (
              <Filter className="size-3" />
            )}
          </span>
        ) : null}
      </button>
      {active ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label={`Quitar filtro de ${label.toLowerCase()}`}
          title="Quitar filtro"
          className={cn(
            'inline-flex size-4 cursor-pointer items-center justify-center rounded text-primary transition-all',
            'hover:bg-destructive/10 hover:text-destructive',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
