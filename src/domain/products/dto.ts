type ProductLike = {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  status: string;
  category: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

export type ProductDTO = {
  id: number;
  name: string;
  price: number;
  stock: number | null;
  status: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function toProductDTO(product: ProductLike): ProductDTO {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    status: product.status,
    category: product.category,
    createdAt: toIsoString(product.createdAt),
    updatedAt: toIsoString(product.updatedAt),
  };
}
