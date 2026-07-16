import { prisma } from '@/lib/db';
import { handleApiError, jsonError } from '@/lib/api/response';
import { parsePositiveIntId, toProductDTO } from '@/domain/products';
import { productUpdateSchema } from '@/domain/products/schemas';

type ParamsContext = {
  params: Promise<{ id: string }>;
};

async function resolveValidProductId(context: ParamsContext) {
  const { id: rawId } = await context.params;
  const id = parsePositiveIntId(rawId);
  if (!id) {
    return { error: jsonError(400, 'INVALID_ID', 'El ID debe ser un entero positivo') };
  }

  return { id };
}

async function ensureProductExists(id: number) {
  const exists = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  return Boolean(exists);
}

export async function PATCH(request: Request, context: ParamsContext) {
  try {
    const resolved = await resolveValidProductId(context);
    if ('error' in resolved) {
      return resolved.error;
    }
    const { id } = resolved;

    const payload = productUpdateSchema.parse(await request.json());

    const exists = await ensureProductExists(id);
    if (!exists) {
      return jsonError(404, 'NOT_FOUND', 'Producto no encontrado');
    }

    const updated = await prisma.product.update({ where: { id }, data: payload });
    return Response.json(toProductDTO(updated));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, context: ParamsContext) {
  try {
    const resolved = await resolveValidProductId(context);
    if ('error' in resolved) {
      return resolved.error;
    }
    const { id } = resolved;

    const exists = await ensureProductExists(id);
    if (!exists) {
      return jsonError(404, 'NOT_FOUND', 'Producto no encontrado');
    }

    await prisma.product.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
