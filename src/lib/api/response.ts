import { ZodError } from 'zod';

export function jsonError(status: number, code: string, message: string, details?: unknown) {
  return Response.json({ error: { code, message, details } }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(422, 'VALIDATION_ERROR', 'Payload inválido', error.flatten());
  }

  if (error instanceof Error) {
    return jsonError(500, 'INTERNAL_ERROR', error.message);
  }

  return jsonError(500, 'INTERNAL_ERROR', 'Error interno inesperado');
}
