'use client';

import * as React from 'react';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { productCreateSchema } from '@/domain/products/schemas';
import type { Product, ProductStatus } from '@/domain/products';

type FormValues = {
  name: string;
  price: string;
  stock: string;
  status: ProductStatus;
  category: string;
};

type Props = {
  initialProduct?: Product | null;
  onSubmit: (values: {
    name: string;
    price: number;
    stock: number | null;
    status: ProductStatus;
    category: string | null;
  }) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel: string;
  formId?: string;
};

const EMPTY_VALUES: FormValues = {
  name: '',
  price: '',
  stock: '',
  status: 'active',
  category: '',
};

function toFormValues(product?: Product | null): FormValues {
  if (!product) return EMPTY_VALUES;
  return {
    name: product.name,
    price: String(product.price),
    stock: product.stock === null ? '' : String(product.stock),
    status: product.status,
    category: product.category ?? '',
  };
}

export function ProductForm({
  initialProduct,
  onSubmit,
  onCancel,
  submitLabel,
  formId,
}: Props) {
  const [values, setValues] = React.useState<FormValues>(() => toFormValues(initialProduct));
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const trimmedName = values.name.trim();
      const trimmedCategory = values.category.trim();
      const stockValue =
        values.stock.trim() === '' ? null : Number.parseInt(values.stock, 10);
      const priceValue = Number.parseFloat(values.price);

      const payload = {
        name: trimmedName,
        price: priceValue,
        stock: stockValue,
        status: values.status,
        category: trimmedCategory === '' ? null : trimmedCategory,
      };

      const parsed = productCreateSchema.safeParse(payload);
      if (!parsed.success) {
        const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
        const flat = parsed.error.flatten().fieldErrors;
        if (flat.name?.[0]) fieldErrors.name = flat.name[0];
        if (flat.price?.[0]) fieldErrors.price = flat.price[0];
        if (flat.stock?.[0]) fieldErrors.stock = flat.stock[0];
        if (flat.status?.[0]) fieldErrors.status = flat.status[0];
        if (flat.category?.[0]) fieldErrors.category = flat.category[0];
        setErrors(fieldErrors);
        return;
      }

      await onSubmit({
        name: parsed.data.name,
        price: parsed.data.price,
        stock: parsed.data.stock ?? null,
        status: (parsed.data.status ?? 'active') as ProductStatus,
        category: parsed.data.category ?? null,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Nombre" htmlFor="product-name" required error={errors.name}>
        <Input
          id="product-name"
          value={values.name}
          onChange={(e) => update('name', e.target.value)}
          placeholder="Ej. Auriculares inalámbricos"
          invalid={Boolean(errors.name)}
          autoComplete="off"
          maxLength={120}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Precio (USD)"
          htmlFor="product-price"
          required
          error={errors.price}
          hint="Usa punto como separador decimal"
        >
          <Input
            id="product-price"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="0.00"
            invalid={Boolean(errors.price)}
          />
        </Field>
        <Field
          label="Stock"
          htmlFor="product-stock"
          error={errors.stock}
          hint="Déjalo vacío para no llevar control"
        >
          <Input
            id="product-stock"
            type="number"
            inputMode="numeric"
            step="1"
            min="0"
            value={values.stock}
            onChange={(e) => update('stock', e.target.value)}
            placeholder="Sin stock"
            invalid={Boolean(errors.stock)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Categoría" htmlFor="product-category" error={errors.category}>
          <Input
            id="product-category"
            value={values.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="Ej. Electrónica"
            invalid={Boolean(errors.category)}
            maxLength={60}
          />
        </Field>
        <Field label="Estado" htmlFor="product-status" required error={errors.status}>
          <Select
            id="product-status"
            value={values.status}
            onChange={(e) => update('status', e.target.value as ProductStatus)}
            invalid={Boolean(errors.status)}
          >
            <option value="active">Activo</option>
            <option value="inactive">Inactivo</option>
          </Select>
        </Field>
      </div>

      {onCancel ? (
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Cancelar
          </button>
          <span className="sr-only">{submitLabel}</span>
        </div>
      ) : null}
    </form>
  );
}
