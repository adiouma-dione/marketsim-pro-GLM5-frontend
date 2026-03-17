// ============================================================
// MarketSim Pro - Group Comparison Chart Component
// ============================================================

'use client';

import * as React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface FinalStats {
  cash: number;
  debt: number;
  market_share_pct: number;
  customer_satisfaction: number;
  rse_score: number;
}

interface GroupComparisonChartProps {
  teamStats: FinalStats;
  groupAverages: FinalStats;
  teamName?: string;
  teamColor?: string;
  className?: string;
}

const metricConfig = [
  { key: 'cash', label: 'Trésorerie', format: (v: number) => formatCurrency(v) },
  { key: 'debt', label: 'Dette', format: (v: number) => formatCurrency(v) },
  { key: 'market_share_pct', label: 'Part de marché', format: (v: number) => formatPercentage(v) },
  { key: 'customer_satisfaction', label: 'Satisfaction', format: (v: number) => `${Math.round(v * 100)}%` },
  { key: 'rse_score', label: 'Score RSE', format: (v: number) => `${Math.round(v * 100)}` },
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function GroupComparisonChart(props: GroupComparisonChartProps) {
  const {
    teamStats,
    groupAverages,
    teamName = 'Votre équipe',
    teamColor = '#2563EB',
    className,
  } = props;

  const data = React.useMemo(() => {
    return metricConfig.map((metric) => ({
      name: metric.label,
      team: teamStats[metric.key as keyof FinalStats] || 0,
      group: groupAverages[metric.key as keyof FinalStats] || 0,
    }));
  }, [teamStats, groupAverages]);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Comparaison avec le groupe</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
              barCategoryGap="10%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => {
                  const metric = metricConfig.find((m) => m.label === value);
                  return metric?.format?.(value) || value;
                }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={90}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  return [formatCurrency(value), name];
                }}
              />
              <Bar dataKey="team" name={teamName} fill={teamColor} radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-team-${index}`}
                    fill={teamColor}
                  />
                ))}
              </Bar>
              <Bar dataKey="group" name="Moyenne groupe" fill="#D1D5DB" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-group-${index}`}
                    fill="#D1D5DB"
                  />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: teamColor }} />
            <span className="text-sm text-gray-600">{teamName}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-gray-300" />
            <span className="text-sm text-gray-600">Moyenne groupe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
