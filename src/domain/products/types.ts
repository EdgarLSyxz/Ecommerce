export type ProductStatus = 'active' | 'inactive';

export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  status: ProductStatus;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductMetrics = {
  activeProducts: number;
  inventoryValue: number;
};

export type ProductListPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductListResponse = {
  items: Product[];
  categories: string[];
  pagination: ProductListPagination;
  globalTotal: number;
  hasLowStock: boolean;
  metrics: ProductMetrics;
};

export type ProductSortBy = 'name' | 'price' | 'stock' | 'status' | 'category' | 'createdAt';
export type SortDirection = 'asc' | 'desc';

export type ProductListQuery = {
  page: number;
  pageSize: number;
  search: string;
  status: ProductStatus | 'all';
  category: string | 'all';
  sortBy: ProductSortBy;
  sortDir: SortDirection;
};

export type ProductCreateInput = {
  name: string;
  price: number;
  stock?: number | null;
  status?: ProductStatus;
  category?: string | null;
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

export type ApiError = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiErrorResponse = { error: ApiError };
