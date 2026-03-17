// ============================================================
// MarketSim Pro - Personal Radar Chart Component
// ============================================================

'use client';

import * as React from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface DimensionScores {
  roi: number;
  pdm: number;
  financial_stability: number;
  satisfaction: number;
  rse: number;
}

interface PersonalRadarChartProps {
  teamScores: DimensionScores;
  groupAverages: DimensionScores;
  teamName?: string;
  teamColor?: string;
  className?: string;
}

const dimensionConfig = [
  { key: 'roi', label: 'ROI' },
  { key: 'pdm', label: 'PdM' },
  { key: 'financial_stability', label: 'Solidité' },
  { key: 'satisfaction', label: 'Satisfaction' },
  { key: 'rse', label: 'RSE' },
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------
export function PersonalRadarChart({
  teamScores,
  groupAverages,
  teamName,
  teamColor,
  className,
}: PersonalRadarChartProps) {
  // Prepare chart data
  const chartData = dimensionConfig.map((dim) => ({
    dimension: dim.label,
    team: (teamScores[dim.key as keyof DimensionScores] ?? 0) * 100,
    group: (groupAverages[dim.key as keyof DimensionScores] ?? 0) * 100,
  }));

  const chartColor = teamColor || '#2563EB';

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Performance comparative</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsRadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={chartData}
            >
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
              />
              <Radar
                name="Moyenne groupe"
                dataKey="group"
                stroke="#D1D5DB"
                strokeWidth={2}
                fill="#D1D5DB"
                fillOpacity={0.3}
              />
              <Radar
                name={teamName || 'Votre équipe'}
                dataKey="team"
                stroke={chartColor}
                strokeWidth={2}
                fill={chartColor}
                fillOpacity={0.5}
              />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded"
              style={{ backgroundColor: chartColor, opacity: 0.5 }}
            />
            <span className="text-sm text-gray-600">{teamName || 'Votre équipe'}</span>
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
