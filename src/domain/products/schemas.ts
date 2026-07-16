import { z } from 'zod';

export const productStatusSchema = z.enum(['active', 'inactive']);

const nullableTrimmedString = z
  .string()
  .trim()
  .min(1)
  .nullable()
  .optional();

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(120),
  price: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  stock: z
    .union([z.coerce.number().int().min(0), z.null()])
    .optional()
    .transform((value) => (typeof value === 'undefined' ? null : value)),
  status: productStatusSchema.default('active'),
  category: nullableTrimmedString.transform((value) => (value ? value : null)),
});

export const productUpdateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(120)
      .optional(),
    price: z.coerce.number().min(0, 'El precio no puede ser negativo').optional(),
    stock: z.union([z.coerce.number().int().min(0), z.null()]).optional(),
    status: productStatusSchema.optional(),
    category: z
      .union([z.string().trim().min(1), z.null()])
      .optional()
      .transform((value) => (typeof value === 'undefined' ? undefined : value)),
  })
  .refine(
    (payload) => Object.keys(payload).length > 0,
    'Debes enviar al menos un campo para actualizar',
  );

export const productListQuerySchema = z.object({
  search: z.string().trim().optional().default(''),
  status: z
    .union([productStatusSchema, z.literal('all')])
    .optional()
    .default('all'),
  category: z.string().trim().optional().default('all'),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(50).optional().default(8),
  sortBy: z
    .enum(['name', 'price', 'stock', 'status', 'category', 'createdAt'])
    .optional()
    .default('createdAt'),
  sortDir: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type ProductCreateSchemaInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateSchemaInput = z.infer<typeof productUpdateSchema>;
export type ProductStatus = z.infer<typeof productStatusSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
