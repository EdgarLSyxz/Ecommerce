import type { Prisma } from '../../../prisma/generated/prisma/client';
import { productListQuerySchema, type ProductListQuery } from './schemas';

export function parseProductListQuery(request: Request): ProductListQuery {
  const url = new URL(request.url);
  return productListQuerySchema.parse(Object.fromEntries(url.searchParams.entries()));
}

export function buildProductWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  return {
    ...(query.search ? { name: { contains: query.search } } : {}),
    ...(query.status !== 'all' ? { status: query.status } : {}),
    ...(query.category !== 'all' ? { category: query.category } : {}),
  };
}

export function buildProductOrderBy(
  query: ProductListQuery,
): Prisma.ProductOrderByWithRelationInput {
  return { [query.sortBy]: query.sortDir } as Prisma.ProductOrderByWithRelationInput;
}

export function extractCategories(items: Array<{ category: string | null }>): string[] {
  return items
    .map((item) => item.category)
    .filter((category): category is string => Boolean(category));
}

export function parsePositiveIntId(rawId: string): number | null {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}
