// ============================================================
// MarketSim Pro - Round Result Metrics Banner
// ============================================================

'use client';

import * as React from 'react';
import { TrendingUp, DollarSign, PieChart, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatNumber, formatPercentage } from '@/lib/utils';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface RoundResultMetricsProps {
  result: RoundResultData;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function RoundResultMetrics({ result }: RoundResultMetricsProps) {
  const metrics = [
    {
      label: 'Unités vendues',
      value: formatNumber(result.units_sold),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Chiffre d\'affaires',
      value: formatCurrency(result.revenue),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Résultat net',
      value: formatCurrency(result.net_income),
      icon: DollarSign,
      color: result.net_income >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: result.net_income >= 0 ? 'bg-green-100' : 'bg-red-100',
    },
    {
      label: 'Part de marché',
      value: formatPercentage(result.market_share_pct),
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="rounded-xl bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg ${metric.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{metric.label}</p>
                  <p className={`text-lg font-semibold ${metric.color}`}>
                    {metric.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
