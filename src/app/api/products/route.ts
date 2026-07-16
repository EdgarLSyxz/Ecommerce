import { prisma } from '@/lib/db';
import { handleApiError } from '@/lib/api/response';
import {
  buildProductOrderBy,
  buildProductWhere,
  calculateProductMetrics,
  extractCategories,
  parseProductListQuery,
  toProductDTO,
} from '@/domain/products';
import { productCreateSchema } from '@/domain/products/schemas';

export async function GET(request: Request) {
  try {
    const query = parseProductListQuery(request);
    const where = buildProductWhere(query);
    const orderBy = buildProductOrderBy(query);

    const [total, products, categoriesRaw, metricsSource, globalTotal, lowStockCount] =
      await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          orderBy,
          skip: (query.page - 1) * query.pageSize,
          take: query.pageSize,
        }),
        prisma.product.findMany({
          where: { category: { not: null } },
          select: { category: true },
          distinct: ['category'],
        }),
        prisma.product.findMany({ select: { status: true, price: true, stock: true } }),
        prisma.product.count(),
        prisma.product.count({ where: { stock: { lte: 5, not: null } } }),
      ]);

    return Response.json({
      items: products.map(toProductDTO),
      categories: extractCategories(categoriesRaw),
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
      },
      globalTotal,
      hasLowStock: lowStockCount > 0,
      metrics: calculateProductMetrics(metricsSource),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = productCreateSchema.parse(await request.json());
    const created = await prisma.product.create({ data: payload });
    return Response.json(toProductDTO(created), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
