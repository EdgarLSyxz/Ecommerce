'use client';

import {
  Pencil,
  Trash2,
  Package,
  Tag,
  Layers,
  Hash,
  X,
  Eye,
  CircleDot,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import {
  SortableHeader,
  CycleFilterHeader,
  type SortState,
} from '@/components/ui/data-table-header';
import { cn, formatCurrencyMXN } from '@/lib/utils';
import type { Product, ProductSortBy, SortDirection } from '@/domain/products';

type Props = {
  products: Product[];
  loading?: boolean;
  pendingId?: number | null;
  categories?: string[];
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreate: () => void;
  sortBy: ProductSortBy;
  sortDir: SortDirection;
  statusFilter: 'all' | 'active' | 'inactive';
  categoryFilter: 'all' | string;
  onSortToggle: (column: ProductSortBy) => void;
  onStatusCycle: () => void;
  onStatusClear?: () => void;
  onCategoryCycle: () => void;
  onCategoryClear?: () => void;
  onCategoryClick?: (category: string) => void;
  hasAnyProduct?: boolean;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
};

const formatCurrency = formatCurrencyMXN;

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));

function getSortState(
  column: ProductSortBy,
  sortBy: ProductSortBy,
  sortDir: SortDirection,
): SortState {
  if (sortBy !== column) return 'none';
  return sortDir;
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-border/60 last:border-b-0 align-middle">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3.5 align-middle">
          <Skeleton className="h-5 w-full" />
        </td>
      ))}
    </tr>
  );
}

function MobileCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3.5 w-1/3" />
        </div>
        <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-24" />
        <div className="flex gap-1">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      </div>
    </Card>
  );
}

function NoResultsBanner({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-border bg-gradient-to-r from-muted/40 to-muted/20 px-5 py-4 text-sm shadow-sm">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <X className="size-4" />
        </div>
        <span className="font-medium">No hay productos que coincidan con los filtros aplicados.</span>
      </div>
      {onClearFilters ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <X />
          Limpiar filtros
        </Button>
      ) : null}
    </div>
  );
}

function RowActions({
  product,
  pending,
  onView,
  onEdit,
  onDelete,
}: {
  product: Product;
  pending: boolean;
  onView: (p: Product) => void;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div
      className="flex items-center justify-end gap-0.5"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onView(product)}
        disabled={pending}
        aria-label={`Ver detalles de ${product.name}`}
        title="Ver detalles"
      >
        <Eye />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onEdit(product)}
        disabled={pending}
        aria-label={`Editar ${product.name}`}
        title="Editar"
      >
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(product)}
        disabled={pending}
        aria-label={`Eliminar ${product.name}`}
        className="text-muted-foreground hover:text-destructive"
        title="Eliminar"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

const tableHeadClass = 'px-4 py-3 first:pl-5 last:pr-5';
const headerCellClass = 'px-4 py-3 first:pl-5 last:pr-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground';

export function ProductTable({
  products,
  loading,
  pendingId,
  categories = [],
  onView,
  onEdit,
  onDelete,
  onCreate,
  sortBy,
  sortDir,
  statusFilter,
  categoryFilter,
  onSortToggle,
  onStatusCycle,
  onStatusClear,
  onCategoryCycle,
  onCategoryClear,
  onCategoryClick,
  hasAnyProduct = true,
  hasActiveFilters = false,
  onClearFilters,
}: Props) {
  return (
    <>
      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr
                className={cn(
                  'border-b border-border bg-muted/30 text-left align-middle transition-colors',
                  hasActiveFilters && 'bg-primary-soft/35',
                )}
              >
                <th className={cn(headerCellClass, 'w-[35%]')}>
                  <SortableHeader
                    label="Producto"
                    sort={getSortState('name', sortBy, sortDir)}
                    onSortToggle={() => onSortToggle('name')}
                    skipDefault
                  />
                </th>
                <th className={cn(headerCellClass, 'w-[18%]')}>
                  <CycleFilterHeader
                    label="Categoría"
                    current={categoryFilter as 'all' | (string & {})}
                    cycle={[
                      { value: 'all', label: 'Todas' },
                      ...categories.map((category) => ({ value: category, label: category })),
                    ]}
                    onCycle={onCategoryCycle}
                    onClear={onCategoryClear}
                    showLabelInHeader
                    showChevronWhenInactive
                  />
                </th>
                <th className={cn(headerCellClass, 'w-[12%]')}>
                  <SortableHeader
                    label="Precio"
                    sort={getSortState('price', sortBy, sortDir)}
                    onSortToggle={() => onSortToggle('price')}
                    align="right"
                  />
                </th>
                <th className={cn(headerCellClass, 'w-[10%]')}>
                  <SortableHeader
                    label="Stock"
                    sort={getSortState('stock', sortBy, sortDir)}
                    onSortToggle={() => onSortToggle('stock')}
                    align="right"
                  />
                </th>
                <th className={cn(headerCellClass, 'w-[12%]')}>
                  <CycleFilterHeader
                    label="Estado"
                    current={statusFilter}
                    cycle={[
                      { value: 'all', label: 'Todos' },
                      { value: 'active', label: 'Activos' },
                      { value: 'inactive', label: 'Inactivos' },
                    ]}
                    onCycle={onStatusCycle}
                    onClear={onStatusClear}
                    showLabelInHeader
                    showChevronWhenInactive
                  />
                </th>
                <th className={cn(headerCellClass, 'w-[13%] text-right')}>
                  <span className="inline-flex items-center rounded-md border border-transparent px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground transition-all hover:border-border/70 hover:bg-muted/60 hover:text-foreground">
                    Acciones
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-0">
                    {hasAnyProduct && hasActiveFilters ? (
                      <NoResultsBanner onClearFilters={onClearFilters} />
                    ) : (
                      <EmptyState
                        className="m-4 border-0 bg-transparent"
                        title="No se encontraron productos"
                        description="Prueba ajustando los filtros o crea un nuevo producto para empezar."
                        action={
                          <Button size="sm" onClick={onCreate}>
                            Crear producto
                          </Button>
                        }
                      />
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver detalles de ${product.name}`}
                    onClick={() => onView(product)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onView(product);
                      }
                    }}
                    className={cn(
                      'group cursor-pointer border-b border-border/60 transition-all duration-200 last:border-b-0',
                      'hover:bg-gradient-to-r hover:from-primary/[0.03] hover:to-transparent hover:shadow-sm focus-visible:bg-primary/[0.04] focus-visible:outline-none',
                      pendingId === product.id && 'pointer-events-none opacity-60',
                    )}
                  >
                    <td className={cn(tableHeadClass, 'align-middle')}>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-soft to-primary/5 text-primary ring-1 ring-inset ring-primary/15 transition-all duration-200 group-hover:scale-110 group-hover:shadow-md">
                          <Package className="size-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {product.name}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <span>Actualizado {formatDate(product.updatedAt)}</span>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={cn(tableHeadClass, 'align-middle')}>
                      {product.category ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryClick?.(product.category as string);
                          }}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-all duration-200',
                            'hover:bg-primary-soft hover:text-primary hover:shadow-sm',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          )}
                          title={`Filtrar por «${product.category}»`}
                        >
                          <Tag className="size-3" />
                          {product.category}
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </td>
                    <td className={cn(tableHeadClass, 'text-right align-middle whitespace-nowrap')}>
                      <span className="text-sm font-bold tabular-nums text-foreground">
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className={cn(tableHeadClass, 'text-right align-middle whitespace-nowrap')}>
                      {product.stock === null ? (
                        <span className="text-xs text-muted-foreground/60">Sin control</span>
                      ) : (
                        <span
                          className={cn(
                            'inline-flex min-w-[2ch] items-center justify-end gap-1 rounded-md px-1.5 py-0.5 text-sm font-semibold tabular-nums transition-colors',
                            product.stock === 0
                              ? 'bg-destructive/10 text-destructive'
                              : product.stock <= 5
                                ? 'bg-warning/10 text-warning'
                                : 'text-foreground',
                          )}
                        >
                          {product.stock}
                        </span>
                      )}
                    </td>
                    <td className={tableHeadClass}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusCycle();
                        }}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                          product.status === 'active'
                            ? 'bg-success-soft text-success hover:bg-success/20 hover:shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:shadow-sm',
                        )}
                        title={`Filtrar solo ${product.status === 'active' ? 'activos' : 'inactivos'}`}
                      >
                        <CircleDot
                          className={cn(
                            'size-2.5',
                            product.status === 'active' ? 'text-success' : 'text-muted-foreground/50',
                          )}
                        />
                        {product.status === 'active' ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className={cn(tableHeadClass, 'text-right align-middle')}>
                      <RowActions
                        product={product}
                        pending={pendingId === product.id}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-3 md:hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <MobileCardSkeleton key={i} />)
        ) : products.length === 0 ? (
          hasAnyProduct && hasActiveFilters ? (
            <NoResultsBanner onClearFilters={onClearFilters} />
          ) : (
            <EmptyState
              title="No se encontraron productos"
              description="Prueba ajustando los filtros o crea un nuevo producto."
              action={
                <Button size="sm" onClick={onCreate}>
                  Crear producto
                </Button>
              }
            />
          )
        ) : (
          products.map((product) => (
            <Card
              key={product.id}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalles de ${product.name}`}
              onClick={() => onView(product)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onView(product);
                }
              }}
              className={cn(
                'cursor-pointer p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                pendingId === product.id && 'pointer-events-none opacity-60',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-soft to-primary/5 text-primary ring-1 ring-inset ring-primary/15 transition-transform duration-200 group-hover:scale-110">
                    <Package className="size-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground transition-colors hover:text-primary">
                      {product.name}
                    </p>
                    {product.category ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCategoryClick?.(product.category as string);
                        }}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-0.5 text-xs font-medium text-muted-foreground transition-all hover:bg-primary-soft hover:text-primary"
                      >
                        <Layers className="size-3" />
                        {product.category}
                      </button>
                    ) : null}
                    <p className="mt-2 text-base font-bold tabular-nums text-foreground">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusCycle();
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200',
                    product.status === 'active'
                      ? 'bg-success-soft text-success hover:bg-success/20'
                      : 'bg-muted text-muted-foreground hover:bg-accent',
                  )}
                >
                  <CircleDot
                    className={cn(
                      'size-2.5',
                      product.status === 'active' ? 'text-success' : 'text-muted-foreground/50',
                    )}
                  />
                  {product.status === 'active' ? 'Activo' : 'Inactivo'}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                <span
                  className={cn(
                    'tabular-nums text-xs font-medium',
                    product.stock === null
                      ? 'text-muted-foreground'
                      : product.stock === 0
                        ? 'text-destructive font-semibold'
                        : product.stock <= 5
                          ? 'text-warning font-semibold'
                          : 'text-muted-foreground',
                  )}
                >
                  <Hash className="mr-0.5 inline size-3" />
                  {product.stock === null
                    ? 'Sin control de stock'
                    : product.stock === 0
                      ? 'Agotado'
                      : `${product.stock} uds. en stock`}
                </span>
                <RowActions
                  product={product}
                  pending={pendingId === product.id}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
