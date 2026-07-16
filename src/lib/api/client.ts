import type {
  ApiErrorResponse,
  Product,
  ProductCreateInput,
  ProductListQuery,
  ProductListResponse,
  ProductUpdateInput,
} from '@/domain/products';

const BASE_URL = '/api/products';

function buildQueryString(query: Partial<ProductListQuery>): string {
  const params = new URLSearchParams();
  if (query.page) params.set('page', String(query.page));
  if (query.pageSize) params.set('pageSize', String(query.pageSize));
  if (query.search) params.set('search', query.search);
  if (query.status && query.status !== 'all') params.set('status', query.status);
  if (query.category && query.category !== 'all') params.set('category', query.category);
  if (query.sortBy) params.set('sortBy', query.sortBy);
  if (query.sortDir) params.set('sortDir', query.sortDir);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export class ApiError extends Error {
  status: number;
  body: ApiErrorResponse['error'];

  constructor(status: number, body: ApiErrorResponse['error']) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

async function parseError(response: Response): Promise<ApiError> {
  let body: ApiErrorResponse['error'];
  try {
    const json = (await response.json()) as ApiErrorResponse;
    body = json.error;
  } catch {
    body = {
      code: 'NETWORK_ERROR',
      message: 'No se pudo comunicar con el servidor. Intenta de nuevo.',
    };
  }
  return new ApiError(response.status, body);
}

export async function fetchProducts(
  query: Partial<ProductListQuery> = {},
): Promise<ProductListResponse> {
  const response = await fetch(`${BASE_URL}${buildQueryString(query)}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as ProductListResponse;
}

export async function createProduct(payload: ProductCreateInput): Promise<Product> {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Product;
}

export async function updateProduct(id: number, payload: ProductUpdateInput): Promise<Product> {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await parseError(response);
  return (await response.json()) as Product;
}

export async function deleteProduct(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!response.ok && response.status !== 204) throw await parseError(response);
}
