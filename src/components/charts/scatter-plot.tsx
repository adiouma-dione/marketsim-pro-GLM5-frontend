// ============================================================
// MarketSim Pro - Scatter Plot Component
// ============================================================

'use client';

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { SessionResults } from '@/lib/types';

interface ScatterPlotProps {
  sessionResults: SessionResults;
  title?: string;
  height?: number;
}

interface ScatterDataPoint {
  x: number; // Price realized
  y: number; // Quality score
  z: number; // Units sold (for bubble size)
  name: string;
  color: string;
  revenue: number;
  unitsSold: number;
}

export function ScatterPlot({
  sessionResults,
  title = 'Positionnement Prix vs Qualité',
  height = 400,
}: ScatterPlotProps) {
  // Build data points
  const data: ScatterDataPoint[] = sessionResults.results.map((teamResult) => {
    const avgPrice = teamResult.result.units_sold > 0
      ? teamResult.result.revenue / teamResult.result.units_sold
      : teamResult.result.revenue;

    return {
      x: avgPrice,
      y: teamResult.result.quality_score,
      z: teamResult.result.units_sold,
      name: teamResult.team_name,
      color: teamResult.team_color,
      revenue: teamResult.result.revenue,
      unitsSold: teamResult.result.units_sold,
    };
  });

  if (!data.length) {
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

  // Calculate averages for quadrant lines
  const avgX = data.reduce((sum, d) => sum + d.x, 0) / data.length;
  const avgY = data.reduce((sum, d) => sum + d.y, 0) / data.length;

  // Calculate max values for scaling
  const maxX = Math.max(...data.map((d) => d.x));
  const maxZ = Math.max(...data.map((d) => d.z));

  // Scale bubble size
  const scaleBubble = (z: number) => {
    const minRadius = 100;
    const maxRadius = 1000;
    return minRadius + (z / maxZ) * (maxRadius - minRadius);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              dataKey="x"
              name="Prix moyen"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              tickFormatter={(value) => formatCurrency(value, true)}
              label={{
                value: 'Prix réalisé (€)',
                position: 'bottom',
                offset: 0,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Qualité"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
              domain={[0, 100]}
              label={{
                value: 'Score de qualité',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'Prix moyen') {
                  return [formatCurrency(value), name];
                }
                return [value.toFixed(1), name];
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ScatterDataPoint;
                  return (
                    <div className="bg-card border rounded-lg p-3 shadow-lg">
                      <p className="font-semibold mb-2" style={{ color: data.color }}>
                        {data.name}
                      </p>
                      <p className="text-sm">
                        Prix moyen: <strong>{formatCurrency(data.x)}</strong>
                      </p>
                      <p className="text-sm">
                        Qualité: <strong>{data.y.toFixed(1)}</strong>
                      </p>
                      <p className="text-sm">
                        Unités vendues: <strong>{formatNumber(data.unitsSold)}</strong>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />

            {/* Quadrant reference lines */}
            <ReferenceLine
              x={avgX}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              label={{
                value: 'Prix moyen',
                position: 'top',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
              }}
            />
            <ReferenceLine
              y={avgY}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              label={{
                value: 'Qualité moyenne',
                position: 'right',
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 10,
              }}
            />

            {/* Quadrant labels */}
            {avgX > 0 && (
              <>
                <ReferenceLine
                  y={95}
                  stroke="transparent"
                  label={{
                    value: 'Premium',
                    position: 'right',
                    fill: 'hsl(var(--chart-1))',
                    fontSize: 11,
                  }}
                />
                <ReferenceLine
                  y={5}
                  stroke="transparent"
                  label={{
                    value: 'Économique',
                    position: 'right',
                    fill: 'hsl(var(--chart-2))',
                    fontSize: 11,
                  }}
                />
              </>
            )}

            <Scatter
              name="Équipes"
              data={data}
              fill="hsl(var(--primary))"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  fillOpacity={0.7}
                  stroke={entry.color}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* Quadrant legend */}
        <div className="mt-4 flex justify-center gap-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border border-dashed border-muted-foreground" />
            <span>Haut gauche: Premium qualité, prix bas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border border-dashed border-muted-foreground" />
            <span>Haut droite: Premium qualité, prix élevé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border border-dashed border-muted-foreground" />
            <span>Bas gauche: Entrée de gamme</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 border border-dashed border-muted-foreground" />
            <span>Bas droite: Mauvais rapport qualité-prix</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
