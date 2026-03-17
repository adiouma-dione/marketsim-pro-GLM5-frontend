// ============================================================
// MarketSim Pro - Last Round Summary Component
// ============================================================

'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface LastRoundSummaryProps {
  results: RoundResultData | null;
  roundNumber?: number;
}

interface MetricRowProps {
  label: string;
  value: string;
  icon: typeof DollarSign;
  iconColor?: string;
  valueColor?: string;
}

// ------------------------------------------------------------
// Metric Row Component
// ------------------------------------------------------------

function MetricRow({ label, value, icon: Icon, iconColor = 'text-gray-500', valueColor }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className={`text-sm font-medium ${valueColor || 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Last Round Summary Component
// ------------------------------------------------------------

export function LastRoundSummary({ results, roundNumber }: LastRoundSummaryProps) {
  if (!results) {
    return (
      <Card className="bg-white border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium">
            Dernier tour
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun résultat disponible
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Les résultats apparaîtront après la première simulation
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isProfitable = results.net_income >= 0;

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">
            Tour {roundNumber || results.round_number}
          </CardTitle>
          {isProfitable ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="h-3 w-3" />
              Bénéfice
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <TrendingDown className="h-3 w-3" />
              Perte
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 divide-y">
          <MetricRow
            label="Chiffre d'affaires"
            value={formatCurrency(results.revenue)}
            icon={DollarSign}
            iconColor="text-blue-500"
          />
          <MetricRow
            label="Résultat net"
            value={formatCurrency(results.net_income)}
            icon={isProfitable ? TrendingUp : TrendingDown}
            iconColor={isProfitable ? 'text-green-500' : 'text-red-500'}
            valueColor={isProfitable ? 'text-green-600' : 'text-red-600'}
          />
          <MetricRow
            label="Unités vendues"
            value={formatNumber(results.units_sold)}
            icon={Package}
            iconColor="text-amber-500"
          />
          <MetricRow
            label="Part de marché"
            value={formatPercent(results.market_share_pct)}
            icon={BarChart3}
            iconColor="text-purple-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Qualité</p>
            <p className="text-lg font-semibold text-gray-900">
              {results.quality_score.toFixed(0)}
            </p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Satisfaction</p>
            <p className="text-lg font-semibold text-gray-900">
              {results.customer_satisfaction.toFixed(0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Skeleton Version
// ------------------------------------------------------------

export function LastRoundSummarySkeleton() {
  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="h-4 w-28 bg-gray-100 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t grid grid-cols-2 gap-2">
          <div className="p-2 bg-gray-50 rounded-lg h-16 animate-pulse" />
          <div className="p-2 bg-gray-50 rounded-lg h-16 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
