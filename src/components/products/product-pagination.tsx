'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ProductListPagination } from '@/domain/products';

type Props = {
  pagination: ProductListPagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  className?: string;
};

export function ProductPagination({ pagination, onPageChange, onPageSizeChange, className }: Props) {
  const { page, pageSize, total, totalPages } = pagination;
  const canPrev = page > 1;
  const canNext = page < totalPages;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <p className="tabular-nums">
          <span className="font-semibold text-foreground">{from}</span>
          {' – '}
          <span className="font-semibold text-foreground">{to}</span>
          {' de '}
          <span className="font-semibold text-foreground">{total}</span>
        </p>
        <div className="hidden h-4 w-px bg-border sm:block" />
        <div className="hidden items-center gap-1.5 sm:flex">
          <span>Por página</span>
          <Select
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-7 w-[72px] text-xs transition-all hover:ring-2 hover:ring-primary/20"
            aria-label="Tamaño de página"
          >
            {[5, 8, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={!canPrev}
          aria-label="Primera página"
          className="transition-all hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!canPrev}
          aria-label="Página anterior"
          className="transition-all hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronLeft />
        </Button>
        <span className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <span className="tabular-nums">{page}</span>
          <span className="text-primary/60">/</span>
          <span className="tabular-nums text-primary/80">{totalPages}</span>
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!canNext}
          aria-label="Página siguiente"
          className="transition-all hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canNext}
          aria-label="Última página"
          className="transition-all hover:scale-105 disabled:hover:scale-100"
        >
          <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}
