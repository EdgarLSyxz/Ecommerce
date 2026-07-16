'use client';

import { AlertTriangle, Trash2, X } from 'lucide-react';
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
import type { Product } from '@/domain/products';

type Props = {
  open: boolean;
  product: Product | null;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (product: Product) => void;
};

export function ConfirmDeleteDialog({ open, product, pending, onOpenChange, onConfirm }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogIcon className="bg-gradient-to-br from-destructive-soft to-destructive/5 text-destructive ring-destructive/20">
              <AlertTriangle className="size-5" />
            </DialogIcon>
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle>Eliminar producto</DialogTitle>
              <DialogDescription>
                Esta acción no se puede deshacer. El producto se eliminará permanentemente.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {product ? (
          <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-sm">
            <p className="font-medium text-foreground">{product.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {product.category ?? 'Sin categoría'} ·{' '}
              {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(
                product.price,
              )}
            </p>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>
            <X />
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={() => product && onConfirm(product)}
            loading={pending}
          >
            <Trash2 />
            Sí, eliminar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
