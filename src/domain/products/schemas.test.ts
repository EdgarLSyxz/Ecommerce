import { describe, expect, it } from 'vitest';
import { productCreateSchema, productListQuerySchema, productUpdateSchema } from './schemas';

describe('product schemas', () => {
  it('rechaza payload inválido en create', () => {
    const result = productCreateSchema.safeParse({
      name: 'A',
      price: -1,
      stock: -3,
      status: 'active',
      category: '',
    });

    expect(result.success).toBe(false);
  });

  it('rechaza update vacío', () => {
    const result = productUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('aplica defaults en query list', () => {
    const result = productListQuerySchema.parse({});

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(8);
    expect(result.status).toBe('all');
    expect(result.search).toBe('');
  });
});
