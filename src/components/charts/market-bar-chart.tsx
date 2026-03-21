// ============================================================
// MarketSim Pro - Market Bar Chart Component
// ============================================================

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { SessionResults } from '@/lib/types';

interface MarketBarChartProps {
  sessionResults: SessionResults;
  title?: string;
  showMarketing?: boolean;
  showRevenue?: boolean;
}

export function MarketBarChart({
  sessionResults,
  title = 'Marketing vs Part de marché',
  showMarketing = true,
  showRevenue = false,
}: MarketBarChartProps) {
  const colors = {
    marketing: '#2563EB',
    revenue: '#059669',
    marketShare: '#D97706',
  };
  const data = sessionResults.results.map((teamResult) => ({
    name: teamResult.team_name,
    color: teamResult.team_color,
    marketing: teamResult.result.marketing_expense,
    marketShare: teamResult.result.market_share_pct,
    revenue: teamResult.result.revenue,
  }));

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) =>
                value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
              }
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Part de marché (%)') {
                  return [`${value.toFixed(2)}%`, name];
                }
                return [formatCurrency(value), name];
              }}
            />
            <Legend />
            {showMarketing && (
              <Bar
                yAxisId="left"
                dataKey="marketing"
                name="Marketing"
                fill={colors.marketing}
                radius={[4, 4, 0, 0]}
              />
            )}
            {showRevenue && (
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Chiffre d'affaires"
                fill={colors.revenue}
                radius={[4, 4, 0, 0]}
              />
            )}
            <Bar
              yAxisId="right"
              dataKey="marketShare"
              name="Part de marché (%)"
              fill={colors.marketShare}
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Grouped Bar Chart (Marketing vs PDM side by side)
// ------------------------------------------------------------

interface GroupedBarChartProps {
  sessionResults: SessionResults;
  title?: string;
}

export function GroupedMarketingBarChart({
  sessionResults,
  title = 'Marketing vs Part de marché',
}: GroupedBarChartProps) {
  const data = sessionResults.results.map((teamResult) => ({
    name: teamResult.team_name,
    color: teamResult.team_color,
    marketing: teamResult.result.marketing_expense,
    marketShare: teamResult.result.market_share_pct,
  }));

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  // Normalize marketing spend for comparison (percentage of max)
  const maxMarketing = Math.max(...data.map((d) => d.marketing));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Part de marché') {
                  return [`${value.toFixed(2)}%`, name];
                }
                return [formatCurrency(value * maxMarketing / 100), 'Marketing'];
              }}
            />
            <Legend />
            <Bar
              dataKey={(d) => (d.marketing / maxMarketing) * 100}
              name="Marketing (normalisé)"
              fill={data[0]?.color || 'hsl(var(--primary))'}
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar
              dataKey="marketShare"
              name="Part de marché"
              fill="hsl(var(--chart-2))"
              radius={[4, 4, 0, 0]}
              opacity={0.7}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
