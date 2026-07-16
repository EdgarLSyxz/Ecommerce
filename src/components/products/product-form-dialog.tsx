'use client';

import * as React from 'react';
import { Plus, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';
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
import { ProductForm } from './product-form';
import { ApiError, createProduct, updateProduct } from '@/lib/api/client';
import type { Product, ProductCreateInput, ProductStatus } from '@/domain/products';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: (product: Product, mode: 'create' | 'update') => void;
};

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: Props) {
  const isEditing = product !== null;
  const formId = React.useId();
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(values: {
    name: string;
    price: number;
    stock: number | null;
    status: ProductStatus;
    category: string | null;
  }) {
    setSubmitting(true);
    const payload: ProductCreateInput = {
      name: values.name,
      price: values.price,
      stock: values.stock,
      status: values.status,
      category: values.category,
    };
    try {
      if (isEditing && product) {
        const updated = await updateProduct(product.id, payload);
        toast.success('Producto actualizado', {
          description: `«${updated.name}» se guardó correctamente.`,
        });
        onSuccess(updated, 'update');
      } else {
        const created = await createProduct(payload);
        toast.success('Producto creado', {
          description: `«${created.name}» fue añadido al catálogo.`,
        });
        onSuccess(created, 'create');
      }
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof ApiError ? error.body.message : 'Error inesperado';
      toast.error(isEditing ? 'No se pudo actualizar' : 'No se pudo crear', {
        description: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <DialogIcon
              className={
                isEditing
                  ? 'bg-gradient-to-br from-warning-soft to-warning/5 text-warning ring-warning/20'
                  : 'bg-gradient-to-br from-primary-soft to-primary/5 text-primary ring-primary/15'
              }
            >
              {isEditing ? <Pencil className="size-5" /> : <Plus className="size-5" />}
            </DialogIcon>
            <div className="min-w-0 flex-1 space-y-1">
              <DialogTitle>{isEditing ? 'Editar producto' : 'Crear nuevo producto'}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los campos y guarda los cambios.'
                  : 'Completa los datos para añadir un producto al catálogo.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ProductForm
          key={product?.id ?? 'new'}
          initialProduct={product}
          onSubmit={handleSubmit}
          formId={formId}
          submitLabel={isEditing ? 'Guardar cambios' : 'Crear producto'}
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            <X />
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={submitting}>
            <Save />
            {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
