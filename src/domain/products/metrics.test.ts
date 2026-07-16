import { describe, expect, it } from 'vitest';
import { calculateProductMetrics } from './metrics';

describe('calculateProductMetrics', () => {
  it('calcula activos e inventario tratando stock null como 0', () => {
    const metrics = calculateProductMetrics([
      { status: 'active', price: 100, stock: 2 },
      { status: 'inactive', price: 50, stock: 5 },
      { status: 'active', price: 200, stock: null },
    ]);

    expect(metrics.activeProducts).toBe(2);
    expect(metrics.inventoryValue).toBe(450);
  });

  it('maneja arrays vacíos', () => {
    const metrics = calculateProductMetrics([]);
    expect(metrics.activeProducts).toBe(0);
    expect(metrics.inventoryValue).toBe(0);
  });
});
