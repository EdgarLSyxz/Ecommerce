'use client';

import * as React from 'react';
import { TrendingUp, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrencyMXN } from '@/lib/utils';
import type { ProductMetrics } from '@/domain/products';

type Props = {
  metrics?: ProductMetrics;
  loading?: boolean;
  hasLowStock?: boolean;
};

type Tone = 'primary' | 'positive' | 'warning';

type MetricTileProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: string;
  tone: Tone;
  loading?: boolean;
};

const toneStyles: Record<Tone, { ring: string; gradient: string; icon: string }> = {
  primary: {
    ring: 'ring-primary/15',
    gradient: 'from-primary/8 to-primary/0',
    icon: 'bg-primary-soft text-primary',
  },
  positive: {
    ring: 'ring-success/15',
    gradient: 'from-success/8 to-success/0',
    icon: 'bg-success-soft text-success',
  },
  warning: {
    ring: 'ring-warning/20',
    gradient: 'from-warning/10 to-warning/0',
    icon: 'bg-warning-soft text-warning',
  },
};

function MetricTile({ icon, label, value, trend, tone, loading }: MetricTileProps) {
  const styles = toneStyles[tone];
  return (
    <Card
      className={cn(
        'group relative overflow-hidden ring-1 ring-inset transition-all duration-300 hover:shadow-lg hover:ring-2',
        styles.ring,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity duration-300 group-hover:opacity-100',
          styles.gradient,
        )}
      />
      <CardContent className="relative flex h-full flex-col gap-4 p-5">
        <div className="flex items-start">
          <div
            className={cn(
              'flex size-11 items-center justify-center rounded-xl ring-1 ring-inset ring-black/[0.04] transition-transform duration-300 group-hover:scale-110',
              styles.icon,
              'dark:ring-white/[0.04]',
            )}
          >
            {icon}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <p className="text-[28px] font-bold leading-none tracking-tight text-foreground tabular-nums">
              {value}
            </p>
          )}
          {trend && !loading ? (
            <p className="pt-0.5 text-xs text-muted-foreground/80">{trend}</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

const formatCurrency = formatCurrencyMXN;

export function ProductMetricsGrid({ metrics, loading, hasLowStock }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetricTile
        icon={<TrendingUp className="size-5" />}
        label="Productos activos"
        value={metrics ? metrics.activeProducts.toString() : '—'}
        trend="Disponibles en el catálogo"
        tone="positive"
        loading={loading}
      />
      <MetricTile
        icon={<DollarSign className="size-5" />}
        label="Valor del inventario"
        value={metrics ? formatCurrency(metrics.inventoryValue) : '—'}
        trend="Suma de precio × stock"
        tone="primary"
        loading={loading}
      />
      <MetricTile
        icon={hasLowStock ? <AlertTriangle className="size-5" /> : <CheckCircle2 className="size-5" />}
        label="Estado del inventario"
        value={hasLowStock ? 'Atención requerida' : 'Todo en orden'}
        trend={
          hasLowStock
            ? 'Hay productos con stock bajo'
            : 'Sin incidencias registradas'
        }
        tone={hasLowStock ? 'warning' : 'positive'}
        loading={loading}
      />
    </div>
  );
}
