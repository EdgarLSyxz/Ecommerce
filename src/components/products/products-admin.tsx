'use client';

import * as React from 'react';
import {
  Plus,
  RefreshCw,
  Sparkles,
  Inbox,
  LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { ProductMetricsGrid } from './product-metrics';
import { ProductFilters } from './product-filters';
import { ProductTable } from './product-table';
import { ProductPagination } from './product-pagination';
import { ProductFormDialog } from './product-form-dialog';
import { ProductDetailsDialog } from './product-details-dialog';
import { ConfirmDeleteDialog } from './confirm-delete-dialog';
import { ApiError, deleteProduct, fetchProducts } from '@/lib/api/client';
import type {
  Product,
  ProductListQuery,
  ProductMetrics,
  ProductSortBy,
  SortDirection,
} from '@/domain/products';

const DEFAULT_QUERY: ProductListQuery = {
  page: 1,
  pageSize: 8,
  search: '',
  status: 'all',
  category: 'all',
  sortBy: 'createdAt',
  sortDir: 'desc',
};

const STATUS_CYCLE = ['all', 'active', 'inactive'] as const;
type StatusFilter = (typeof STATUS_CYCLE)[number];

function nextStatus(current: StatusFilter): StatusFilter {
  const idx = STATUS_CYCLE.indexOf(current);
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
}

const DEFAULT_SORT: { sortBy: ProductSortBy; sortDir: SortDirection } = {
  sortBy: 'createdAt',
  sortDir: 'desc',
};

function toggleSort(
  column: ProductSortBy,
  currentSortBy: ProductSortBy,
  currentSortDir: SortDirection,
): { sortBy: ProductSortBy; sortDir: SortDirection } {
  if (currentSortBy !== column) {
    const initialDir: SortDirection =
      column === 'price' || column === 'stock' ? 'desc' : 'asc';
    return { sortBy: column, sortDir: initialDir };
  }
  if (currentSortDir === 'asc') return { sortBy: column, sortDir: 'desc' };
  if (currentSortDir === 'desc') return DEFAULT_SORT;
  return { sortBy: column, sortDir: 'asc' };
}

export function ProductsAdmin() {
  const [query, setQuery] = React.useState<ProductListQuery>(DEFAULT_QUERY);
  const [searchInput, setSearchInput] = React.useState(DEFAULT_QUERY.search);
  const [data, setData] = React.useState<{
    items: Product[];
    categories: string[];
    total: number;
    totalPages: number;
    globalTotal: number;
    hasLowStock: boolean;
  } | null>(null);
  const [metrics, setMetrics] = React.useState<ProductMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);

  const [detailsDialogOpen, setDetailsDialogOpen] = React.useState(false);
  const [viewingProduct, setViewingProduct] = React.useState<Product | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const queryRef = React.useRef(query);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => {
    queryRef.current = query;
  }, [query]);

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleSearchInputChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setQuery((prev) =>
        prev.search === value.trim() ? prev : { ...prev, search: value.trim(), page: 1 },
      );
    }, 300);
  }

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProducts(queryRef.current);
      setData({
        items: response.items,
        categories: response.categories,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
        globalTotal: response.globalTotal,
        hasLowStock: response.hasLowStock,
      });
      setMetrics(response.metrics);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.body.message : 'No se pudieron cargar los productos';
      setError(message);
      toast.error('Error al cargar productos', { description: message });
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load, query]);

  function handleSortToggle(column: ProductSortBy) {
    setQuery((prev) => {
      const next = toggleSort(column, prev.sortBy, prev.sortDir);
      return { ...prev, ...next, page: 1 };
    });
  }

  function handleStatusCycle() {
    setQuery((prev) => ({ ...prev, status: nextStatus(prev.status), page: 1 }));
  }

  function handleCategoryCycle() {
    setQuery((prev) => {
      const available = data?.categories ?? [];
      if (available.length === 0) return prev;
      const sequence: ('all' | string)[] = ['all', ...available];
      const currentIdx = sequence.indexOf(prev.category as 'all' | string);
      const safeIdx = currentIdx === -1 ? 0 : currentIdx;
      const nextValue = sequence[(safeIdx + 1) % sequence.length];
      return { ...prev, category: nextValue, page: 1 };
    });
  }

  function handleCategoryClick(category: string) {
    setQuery((prev) =>
      prev.category === category
        ? { ...prev, category: 'all', page: 1 }
        : { ...prev, category, page: 1 },
    );
  }

  function handleCategoryClear() {
    setQuery((prev) => ({ ...prev, category: 'all', page: 1 }));
  }

  function handleStatusClear() {
    setQuery((prev) => ({ ...prev, status: 'all', page: 1 }));
  }

  function handleCreate() {
    setEditingProduct(null);
    setFormDialogOpen(true);
  }

  function handleView(product: Product) {
    setViewingProduct(product);
    setDetailsDialogOpen(true);
  }

  function handleEdit(product: Product) {
    setEditingProduct(product);
    setFormDialogOpen(true);
  }

  function handleEditFromDetails(product: Product) {
    setDetailsDialogOpen(false);
    setViewingProduct(null);
    setEditingProduct(product);
    setFormDialogOpen(true);
  }

  function handleDeleteRequest(product: Product) {
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  }

  function handleDeleteFromDetails(product: Product) {
    setDetailsDialogOpen(false);
    setViewingProduct(null);
    setDeletingProduct(product);
    setDeleteDialogOpen(true);
  }

  async function handleDeleteConfirm(product: Product) {
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      toast.success('Producto eliminado', {
        description: `«${product.name}» se eliminó del catálogo.`,
      });
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      if (data && data.items.length === 1 && query.page > 1) {
        setQuery((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        await load();
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.body.message : 'No se pudo eliminar el producto';
      toast.error('Error al eliminar', { description: message });
    } finally {
      setDeleting(false);
    }
  }

  async function handleFormSuccess(_product: Product, mode: 'create' | 'update') {
    if (mode === 'create' && query.page !== 1) {
      setQuery((prev) => ({ ...prev, page: 1 }));
    } else {
      await load();
    }
  }

  function handlePageChange(page: number) {
    setQuery((prev) => ({ ...prev, page }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handlePageSizeChange(size: number) {
    setQuery((prev) => ({ ...prev, pageSize: size, page: 1 }));
  }

  function handleRefresh() {
    load();
  }

  function handleClearFilters() {
    setSearchInput('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery((prev) => ({
      ...prev,
      search: '',
      status: 'all',
      category: 'all',
      page: 1,
    }));
  }

  const hasActiveFilters =
    query.search.length > 0 || query.status !== 'all' || query.category !== 'all';

  const hasAnyProduct = data ? data.globalTotal > 0 : true;
  const showInitialEmpty = !loading && data !== null && data.globalTotal === 0;

  const hasLowStock = data?.hasLowStock ?? false;

  const totalLabel = data
    ? `${data.total} ${data.total === 1 ? 'Producto' : 'Productos'}`
    : undefined;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Panel de administración"
        title="Catálogo de productos"
        description="Gestiona tu inventario, crea nuevos productos y mantén la información al día."
        icon={<LayoutGrid className="size-5" />}
        loading={loading && !data}
        actions={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} />
              Actualizar
            </Button>
            <Button size="md" onClick={handleCreate}>
              <Plus />
              Nuevo producto
            </Button>
          </>
        }
      />

      <ProductMetricsGrid
        metrics={metrics ?? undefined}
        loading={loading && !data}
        hasLowStock={hasLowStock}
      />

      {error ? (
        <Alert
          variant="destructive"
          title="No se pudo cargar el catálogo"
          description={error}
        />
      ) : null}

      <div className="space-y-3">
        <ProductFilters
          categories={data?.categories ?? []}
          query={query}
          searchInput={searchInput}
          onSearchInputChange={handleSearchInputChange}
          onQueryChange={setQuery}
          totalLabel={totalLabel}
        />

        {loading && !data ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-gradient-to-br from-muted/30 to-muted/10 py-24 text-sm text-muted-foreground">
            <Spinner size="lg" />
            <p className="font-medium">Cargando productos…</p>
          </div>
        ) : showInitialEmpty ? (
          <EmptyState
            icon={<Inbox className="size-5" />}
            title="Aún no hay productos"
            description="Crea el primer producto para empezar a construir tu catálogo."
            action={
              <Button onClick={handleCreate} size="lg">
                <Sparkles />
                Crear primer producto
              </Button>
            }
          />
        ) : (
          <>
            <ProductTable
              products={data?.items ?? []}
              loading={loading}
              pendingId={deleting ? deletingProduct?.id ?? null : null}
              categories={data?.categories ?? []}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onCreate={handleCreate}
              sortBy={query.sortBy}
              sortDir={query.sortDir}
              statusFilter={query.status}
              categoryFilter={query.category}
              onSortToggle={handleSortToggle}
              onStatusCycle={handleStatusCycle}
              onStatusClear={handleStatusClear}
              onCategoryCycle={handleCategoryCycle}
              onCategoryClear={handleCategoryClear}
              onCategoryClick={handleCategoryClick}
              hasAnyProduct={hasAnyProduct}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />

            {data && data.total > 0 ? (
              <ProductPagination
                pagination={{
                  page: query.page,
                  pageSize: query.pageSize,
                  total: data.total,
                  totalPages: data.totalPages,
                }}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : null}
          </>
        )}
      </div>

      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />

      <ProductDetailsDialog
        open={detailsDialogOpen}
        product={viewingProduct}
        pendingDelete={deleting && deletingProduct?.id === viewingProduct?.id}
        onOpenChange={(open) => {
          setDetailsDialogOpen(open);
          if (!open) setViewingProduct(null);
        }}
        onEdit={handleEditFromDetails}
        onDelete={handleDeleteFromDetails}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        product={deletingProduct}
        pending={deleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
