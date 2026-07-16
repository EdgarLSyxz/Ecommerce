'use client';

import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductListQuery, ProductStatus } from '@/domain/products';

type Props = {
  categories: string[];
  query: ProductListQuery;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onQueryChange: (next: ProductListQuery) => void;
  totalLabel?: string;
  className?: string;
};

export function ProductFilters({
  categories,
  query,
  searchInput,
  onSearchInputChange,
  onQueryChange,
  totalLabel,
  className,
}: Props) {
  const hasActiveFilters =
    query.search.length > 0 || query.status !== 'all' || query.category !== 'all';

  const activeFilterCount = [
    query.search.length > 0,
    query.status !== 'all',
    query.category !== 'all',
  ].filter(Boolean).length;

  function clearFilters() {
    onSearchInputChange('');
    onQueryChange({ ...query, search: '', status: 'all', category: 'all', page: 1 });
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center',
        className,
      )}
    >
      <div className="relative flex-1">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
        />
        <Input
          type="search"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Buscar productos por nombre…"
          className="pl-9 transition-all focus:ring-2 focus:ring-primary/20"
          aria-label="Buscar productos"
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      <div className="flex items-center gap-2 sm:max-w-md">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground sm:flex">
          <SlidersHorizontal className="size-3.5" />
          Filtros
          {activeFilterCount > 0 ? (
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          ) : null}
        </span>
        <Select
          value={query.status}
          onChange={(e) =>
            onQueryChange({
              ...query,
              status: e.target.value as ProductStatus | 'all',
              page: 1,
            })
          }
          aria-label="Filtrar por estado"
          className={cn(
            'min-w-[150px] flex-1 transition-all',
            query.status !== 'all' && 'ring-2 ring-primary/20',
          )}
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </Select>
        <Select
          value={query.category}
          onChange={(e) => onQueryChange({ ...query, category: e.target.value, page: 1 })}
          aria-label="Filtrar por categoría"
          className={cn(
            'min-w-[170px] flex-1 transition-all',
            query.category !== 'all' && 'ring-2 ring-primary/20',
          )}
        >
          <option value="all">Todas las categorías</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        {hasActiveFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="shrink-0 transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <X />
            Limpiar
          </Button>
        ) : null}
      </div>
      {totalLabel ? (
        <p className="hidden shrink-0 rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:block">
          {totalLabel}
        </p>
      ) : null}
    </div>
  );
}
