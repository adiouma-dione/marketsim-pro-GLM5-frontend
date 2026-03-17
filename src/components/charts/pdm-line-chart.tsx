// ============================================================
// MarketSim Pro - Market Share Line Chart Component
// ============================================================

'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SessionResults } from '@/lib/types';

interface PdmLineChartProps {
  roundsData: Map<number, SessionResults>;
  title?: string;
  height?: number;
}

interface ChartDataPoint {
  round: number;
  [teamId: string]: number | string;
}

export function PdmLineChart({
  roundsData,
  title = 'Évolution de la part de marché',
  height = 350,
}: PdmLineChartProps) {
  // Build team lookup from the latest round
  const latestRound = Math.max(...Array.from(roundsData.keys()));
  const latestResults = roundsData.get(latestRound);

  if (!latestResults || !roundsData.size) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent
          className="flex items-center justify-center"
          style={{ height }}
        >
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  // Build team info map
  const teamInfoMap = new Map<
    string,
    { name: string; color: string }
  >();
  latestResults.results.forEach((teamResult) => {
    teamInfoMap.set(teamResult.result.team_id, {
      name: teamResult.team_name,
      color: teamResult.team_color,
    });
  });

  // Build chart data: one entry per round
  const chartData: ChartDataPoint[] = [];
  const sortedRounds = Array.from(roundsData.keys()).sort((a, b) => a - b);

  sortedRounds.forEach((round) => {
    const roundData = roundsData.get(round);
    if (!roundData) return;

    const dataPoint: ChartDataPoint = { round };

    roundData.results.forEach((teamResult) => {
      dataPoint[teamResult.result.team_id] = teamResult.result.market_share_pct;
    });

    chartData.push(dataPoint);
  });

  // Generate line components for each team
  const teamIds = Array.from(teamInfoMap.keys());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="round"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              label={{
                value: 'Tour',
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              label={{
                value: 'Part de marché (%)',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const teamInfo = teamInfoMap.get(name);
                return [`${value.toFixed(2)}%`, teamInfo?.name || name];
              }}
              labelFormatter={(label) => `Tour ${label}`}
            />
            <Legend
              formatter={(value) => {
                const teamInfo = teamInfoMap.get(value);
                return teamInfo?.name || value;
              }}
            />
            {teamIds.map((teamId) => {
              const teamInfo = teamInfoMap.get(teamId)!;
              return (
                <Line
                  key={teamId}
                  type="monotone"
                  dataKey={teamId}
                  stroke={teamInfo.color}
                  strokeWidth={2}
                  dot={<CustomDot color={teamInfo.color} />}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Custom dot component
function CustomDot({ cx, cy, color }: { cx?: number; cy?: number; color: string }) {
  if (cx === undefined || cy === undefined) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke="white"
      strokeWidth={2}
    />
  );
}

// ------------------------------------------------------------
// Multi-metric Line Chart
// ------------------------------------------------------------

interface MultiMetricLineChartProps {
  roundsData: Map<number, SessionResults>;
  metric: 'revenue' | 'net_income' | 'cash' | 'quality_score' | 'customer_satisfaction';
  title: string;
  yAxisFormatter?: (value: number) => string;
  height?: number;
}

export function MultiMetricLineChart({
  roundsData,
  metric,
  title,
  yAxisFormatter,
  height = 350,
}: MultiMetricLineChartProps) {
  // Build team lookup from the latest round
  const latestRound = Math.max(...Array.from(roundsData.keys()));
  const latestResults = roundsData.get(latestRound);

  if (!latestResults || !roundsData.size) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent
          className="flex items-center justify-center"
          style={{ height }}
        >
          <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
        </CardContent>
      </Card>
    );
  }

  // Build team info map
  const teamInfoMap = new Map<string, { name: string; color: string }>();
  latestResults.results.forEach((teamResult) => {
    teamInfoMap.set(teamResult.result.team_id, {
      name: teamResult.team_name,
      color: teamResult.team_color,
    });
  });

  // Get metric value from result
  const getMetricValue = (result: SessionResults['results'][number]['result']): number => {
    switch (metric) {
      case 'revenue':
        return result.revenue;
      case 'net_income':
        return result.net_income;
      case 'cash':
        return result.ending_cash;
      case 'quality_score':
        return result.quality_score;
      case 'customer_satisfaction':
        return result.customer_satisfaction;
      default:
        return 0;
    }
  };

  // Build chart data
  const chartData: ChartDataPoint[] = [];
  const sortedRounds = Array.from(roundsData.keys()).sort((a, b) => a - b);

  sortedRounds.forEach((round) => {
    const roundData = roundsData.get(round);
    if (!roundData) return;

    const dataPoint: ChartDataPoint = { round };

    roundData.results.forEach((teamResult) => {
      dataPoint[teamResult.result.team_id] = getMetricValue(teamResult.result);
    });

    chartData.push(dataPoint);
  });

  const teamIds = Array.from(teamInfoMap.keys());
  const defaultFormatter = (value: number) =>
    value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` :
    value >= 1000 ? `${(value / 1000).toFixed(0)}k` :
    value.toFixed(0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="round"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={yAxisFormatter || defaultFormatter}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const teamInfo = teamInfoMap.get(name);
                return [yAxisFormatter?.(value) || defaultFormatter(value), teamInfo?.name || name];
              }}
              labelFormatter={(label) => `Tour ${label}`}
            />
            <Legend
              formatter={(value) => {
                const teamInfo = teamInfoMap.get(value);
                return teamInfo?.name || value;
              }}
            />
            {teamIds.map((teamId) => {
              const teamInfo = teamInfoMap.get(teamId)!;
              return (
                <Line
                  key={teamId}
                  type="monotone"
                  dataKey={teamId}
                  stroke={teamInfo.color}
                  strokeWidth={2}
                  dot={<CustomDot color={teamInfo.color} />}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
