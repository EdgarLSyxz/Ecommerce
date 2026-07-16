import type { ProductMetrics } from './types';

type MetricsSource = {
  status: string;
  price: number;
  stock: number | null;
};

export function calculateProductMetrics(products: MetricsSource[]): ProductMetrics {
  const activeProducts = products.filter((product) => product.status === 'active').length;
  const inventoryValue = products.reduce((sum, product) => {
    const stock = product.stock ?? 0;
    return sum + product.price * stock;
  }, 0);

  return {
    activeProducts,
    inventoryValue,
  };
}
