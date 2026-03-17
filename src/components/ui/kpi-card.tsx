// ============================================================
// MarketSim Pro - KPI Card Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

// ------------------------------------------------------------
// Variant Styles
// ------------------------------------------------------------

const variantStyles = {
  default: {
    icon: 'text-gray-400',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  success: {
    icon: 'text-green-500',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  warning: {
    icon: 'text-amber-500',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  error: {
    icon: 'text-red-500',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
  info: {
    icon: 'text-blue-500',
    trend: {
      positive: 'text-green-600',
      negative: 'text-red-600',
      neutral: 'text-gray-500',
    },
  },
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  loading = false,
  onClick,
}: KPICardProps) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className={cn('shadow-sm', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  const getTrendColor = () => {
    if (!trend) return styles.trend.neutral;
    if (trend.value > 0) return styles.trend.positive;
    if (trend.value < 0) return styles.trend.negative;
    return styles.trend.neutral;
  };

  const renderTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <Card
      className={cn(
        'shadow-sm transition-shadow duration-200',
        onClick && 'cursor-pointer hover:shadow-md',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        {Icon && <Icon className={cn('h-5 w-5', styles.icon)} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 tabular-nums">
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span className={cn('flex items-center gap-0.5 text-xs', getTrendColor())}>
                {renderTrendIcon()}
                {trend.value > 0 ? '+' : ''}
                {(trend.value * 100).toFixed(1)}%
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-gray-500">{subtitle}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// KPICard Skeleton Export
// ------------------------------------------------------------

export function KPICardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-32 mb-1" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// KPI Grid Component
// ------------------------------------------------------------

export interface KPIGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KPIGrid({ children, columns = 4, className }: KPIGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  );
}
