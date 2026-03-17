// ============================================================
// MarketSim Pro - KPI Row Component
// ============================================================

'use client';

import * as React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Trophy,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface KPIRowProps {
  cash: number;
  previousCash?: number;
  marketShare: number;
  marketShareHistory?: number[];
  satisfaction: number;
  rank: number;
  totalTeams?: number;
  previousRank?: number;
}

// ------------------------------------------------------------
// Mini Sparkline Component
// ------------------------------------------------------------

function MiniSparkline({ data, color = '#3B82F6' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;

  const width = 60;
  const height = 24;
  const padding = 2;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((value - min) / range) * (height - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ------------------------------------------------------------
// Circular Gauge Component
// ------------------------------------------------------------

function CircularProgress({ value, max = 100, size = 48 }: { value: number; max?: number; size?: number }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  const color = value >= 70 ? '#10B981' : value >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#E5E7EB"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

// ------------------------------------------------------------
// Delta Badge Component
// ------------------------------------------------------------

function DeltaBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return null;

  const isPositive = value > 0;
  const color = isPositive ? 'text-green-600' : 'text-red-600';
  const Icon = isPositive ? ArrowUp : ArrowDown;

  return (
    <span className={`flex items-center gap-0.5 text-xs ${color}`}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
}

// ------------------------------------------------------------
// KPI Card Component
// ------------------------------------------------------------

interface KPICardProps {
  title: string;
  value: string;
  icon: typeof DollarSign;
  iconColor?: string;
  delta?: number;
  deltaSuffix?: string;
  extra?: React.ReactNode;
}

function KPICard({ title, value, icon: Icon, iconColor = 'text-blue-600', delta, deltaSuffix, extra }: KPICardProps) {
  return (
    <Card className="bg-white border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {delta !== undefined && delta !== 0 && (
              <DeltaBadge value={delta} suffix={deltaSuffix} />
            )}
          </div>
          <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        {extra && <div className="mt-2">{extra}</div>}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// KPI Row Component
// ------------------------------------------------------------

export function KPIRow({
  cash,
  previousCash,
  marketShare,
  marketShareHistory,
  satisfaction,
  rank,
  totalTeams = 1,
  previousRank,
}: KPIRowProps) {
  // Calculate deltas
  const cashDelta = previousCash ? ((cash - previousCash) / previousCash) * 100 : 0;
  const rankDelta = previousRank ? previousRank - rank : 0;

  // Trend icons based on market share
  const TrendIcon = marketShare >= 50 ? TrendingUp : TrendingDown;
  const trendColor = marketShare >= 50 ? 'text-green-600' : 'text-gray-400';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Trésorerie */}
      <KPICard
        title="Trésorerie"
        value={formatCurrency(cash)}
        icon={DollarSign}
        iconColor="text-blue-600"
        delta={cashDelta}
        deltaSuffix="%"
      />

      {/* Part de marché */}
      <KPICard
        title="Part de marché"
        value={formatPercent(marketShare)}
        icon={TrendIcon}
        iconColor={trendColor}
        extra={
          marketShareHistory && marketShareHistory.length > 1 ? (
            <MiniSparkline data={marketShareHistory} />
          ) : null
        }
      />

      {/* Satisfaction */}
      <Card className="bg-white border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Satisfaction</p>
              <p className="text-2xl font-semibold text-gray-900">
                {satisfaction.toFixed(0)}<span className="text-sm text-muted-foreground">/100</span>
              </p>
            </div>
            <div className="relative">
              <CircularProgress value={satisfaction} />
              <Star className="absolute inset-0 m-auto h-4 w-4 text-amber-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classement */}
      <KPICard
        title="Classement"
        value={`${rank}/${totalTeams}`}
        icon={Trophy}
        iconColor="text-amber-500"
        delta={rankDelta}
        extra={
          rank === 1 ? (
            <span className="text-xs text-amber-600 font-medium">1ère place !</span>
          ) : null
        }
      />
    </div>
  );
}

// ------------------------------------------------------------
// Skeleton Version
// ------------------------------------------------------------

export function KPIRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="bg-white border shadow-sm">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
