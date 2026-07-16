'use client';

import * as React from 'react';
import {
  Pencil,
  Trash2,
  X,
  Package,
  DollarSign,
  Hash,
  Tag,
  Calendar,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn, formatCurrencyMXN } from '@/lib/utils';
import type { Product } from '@/domain/products';

type Props = {
  open: boolean;
  product: Product | null;
  pendingDelete?: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

const formatCurrency = formatCurrencyMXN;

const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

type DetailRowProps = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  tone?: 'default' | 'primary' | 'muted';
};

function DetailRow({ icon, label, children, tone = 'default' }: DetailRowProps) {
  const containerClass =
    tone === 'primary'
      ? 'border-primary/15 bg-primary-soft/40'
      : tone === 'muted'
        ? 'border-border bg-muted/40'
        : 'border-border bg-card';
  const iconClass =
    tone === 'primary'
      ? 'bg-primary-soft text-primary ring-primary/10'
      : 'bg-muted text-muted-foreground ring-border';
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-3.5',
        containerClass,
      )}
    >
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-md ring-1 ring-inset',
          iconClass,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <div className="mt-1 text-sm font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}

export function ProductDetailsDialog({
  open,
  product,
  pendingDelete,
  onOpenChange,
  onEdit,
  onDelete,
}: Props) {
  if (!product) return null;

  const stockTone =
    product.stock === null
      ? 'muted'
      : product.stock === 0
        ? 'default'
        : product.stock <= 5
          ? 'default'
          : 'primary';
  const stockLabel =
    product.stock === null
      ? 'Sin control'
      : product.stock === 0
        ? 'Agotado'
        : `${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'}`;

  function handleEdit() {
    onEdit(product!);
  }

  function handleDelete() {
    onDelete(product!);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogIcon className="bg-gradient-to-br from-primary-soft to-primary/5 text-primary ring-primary/15">
              <Package className="size-5" />
            </DialogIcon>
            <div className="min-w-0 flex-1 space-y-1.5">
              <DialogTitle className="leading-tight">{product.name}</DialogTitle>
              <DialogDescription>
                Detalle completo del producto. Desde aquí puedes editarlo o eliminarlo.
              </DialogDescription>
              <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
                    product.status === 'active'
                      ? 'bg-success-soft text-success'
                      : 'bg-muted text-muted-foreground',
                  )}
                >
                  {product.status === 'active' ? (
                    <CheckCircle2 className="size-3" />
                  ) : (
                    <XCircle className="size-3" />
                  )}
                  {product.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
                {product.category ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <Tag className="size-3" />
                    {product.category}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <DetailRow icon={<DollarSign className="size-4" />} label="Precio" tone="primary">
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(product.price)}
            </span>
          </DetailRow>
          <DetailRow
            icon={<Package className="size-4" />}
            label="Stock disponible"
            tone={stockTone}
          >
            <span
              className={cn(
                'text-base font-semibold tabular-nums',
                product.stock === 0 && 'text-destructive',
                product.stock !== null &&
                  product.stock > 0 &&
                  product.stock <= 5 &&
                  'text-warning',
              )}
            >
              {stockLabel}
            </span>
          </DetailRow>
          <DetailRow icon={<Hash className="size-4" />} label="Identificador">
            <span className="font-mono text-sm">#{product.id}</span>
          </DetailRow>
          <DetailRow icon={<Tag className="size-4" />} label="Categoría">
            {product.category ?? (
              <span className="font-normal text-muted-foreground">Sin categoría</span>
            )}
          </DetailRow>
          <DetailRow icon={<Calendar className="size-4" />} label="Fecha de creación">
            <span className="text-xs font-normal text-muted-foreground">
              {formatDateTime(product.createdAt)}
            </span>
          </DetailRow>
          <DetailRow
            icon={<CalendarClock className="size-4" />}
            label="Última actualización"
          >
            <span className="text-xs font-normal text-muted-foreground">
              {formatDateTime(product.updatedAt)}
            </span>
          </DetailRow>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="sm:mr-auto">
            <X />
            Cerrar
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={pendingDelete}>
            <Trash2 />
            Eliminar
          </Button>
          <Button onClick={handleEdit}>
            <Pencil />
            Editar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
