// ============================================================
// MarketSim Pro - Radar Chart Component
// ============================================================

'use client';

import { useState } from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Layers } from 'lucide-react';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface TeamRadarData {
  teamId: string;
  teamName: string;
  teamColor: string;
  metrics: {
    ROI: number;
    PDM: number;
    Finance: number;
    Satisfaction: number;
    RSE: number;
  };
}

function lightenHex(color: string, amount = 0.25) {
  if (!color) return color;
  const normalized = color.startsWith('#') ? color.slice(1) : color;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return color;
  const num = parseInt(normalized, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  const mix = (channel: number) =>
    Math.round(channel + (255 - channel) * amount);
  const toHex = (channel: number) => channel.toString(16).padStart(2, '0');
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
// ------------------------------------------------------------
// Team Radar Chart Component
// ------------------------------------------------------------

interface TeamRadarChartProps {
  teamsData: TeamRadarData[];
  title?: string;
  height?: number;
  showToggle?: boolean;
}

export function TeamRadarChart({
  teamsData,
  title = 'Profil des équipes',
  height = 400,
  showToggle = false,
}: TeamRadarChartProps) {
  const [viewMode, setViewMode] = useState<'overlay' | 'grid'>('overlay');

  if (!teamsData.length) {
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

  // Transform data for radar chart
  const radarData = [
    { subject: 'ROI', fullMark: 100 },
    { subject: 'PDM', fullMark: 100 },
    { subject: 'Finance', fullMark: 100 },
    { subject: 'Satisfaction', fullMark: 100 },
    { subject: 'RSE', fullMark: 100 },
  ].map((item) => {
    const dataPoint: Record<string, string | number> = {
      subject: item.subject,
      fullMark: item.fullMark,
    };

    teamsData.forEach((team) => {
      dataPoint[team.teamId] = team.metrics[item.subject as keyof typeof team.metrics] || 0;
    });

    return dataPoint;
  });

  const isGridMode = viewMode === 'grid';
  const isOverlayMode = viewMode === 'overlay';

  if (isGridMode && teamsData.length > 1) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showToggle && (
            <div className="flex gap-2">
              <Button
                variant={isOverlayMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('overlay')}
              >
                <Layers className="h-4 w-4 mr-1" />
                Superposé
              </Button>
              <Button
                variant={isGridMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4 mr-1" />
                Individuel
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {teamsData.map((team) => (
              <div key={team.teamId} className="text-center">
                <p className="font-medium text-sm mb-2" style={{ color: team.teamColor }}>
                  {team.teamName}
                </p>
                <ResponsiveContainer width="100%" height={180}>
                  <RechartsRadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 8, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Radar
                      name={team.teamName}
                      dataKey={team.teamId}
                      stroke={lightenHex(team.teamColor, 0.2)}
                      fill={lightenHex(team.teamColor, 0.5)}
                      fillOpacity={0.35}
                    />
                  </RechartsRadarChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        {showToggle && teamsData.length > 1 && (
          <div className="flex gap-2">
            <Button
              variant={isOverlayMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overlay')}
            >
              <Layers className="h-4 w-4 mr-1" />
              Superposé
            </Button>
            <Button
              variant={isGridMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Individuel
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsRadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const team = teamsData.find((t) => t.teamId === name);
                return [`${value.toFixed(1)}`, team?.teamName || name];
              }}
            />
            <Legend
              formatter={(value) => {
                const team = teamsData.find((t) => t.teamId === value);
                return team?.teamName || value;
              }}
            />
            {teamsData.map((team) => (
              <Radar
                key={team.teamId}
                name={team.teamId}
                dataKey={team.teamId}
                stroke={lightenHex(team.teamColor, 0.2)}
                fill={lightenHex(team.teamColor, 0.5)}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ))}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Alias export for backward compatibility
export const RadarChart = TeamRadarChart;

// ------------------------------------------------------------
// Helper function to create TeamRadarData from RoundResultData
// ------------------------------------------------------------

export function createTeamRadarData(
  result: RoundResultData,
  teamName: string,
  teamColor: string,
  previousCash?: number
): TeamRadarData {
  // Calculate ROI (return on investment)
  const roi = previousCash && previousCash > 0
    ? Math.min(100, Math.max(0, ((result.ending_cash - previousCash) / previousCash) * 100))
    : result.net_income > 0 ? 50 : 25;

  // Calculate Finance score (based on cash and debt management)
  const totalAssets = result.ending_cash + result.inventory_value + result.accounts_receivable;
  const debtRatio = result.ending_debt / (totalAssets || 1);
  const financeScore = Math.min(100, Math.max(0, 100 - debtRatio * 100 + (result.net_income > 0 ? 20 : 0)));

  return {
    teamId: result.team_id,
    teamName,
    teamColor,
    metrics: {
      ROI: Math.min(100, Math.max(0, roi)),
      PDM: Math.min(100, Math.max(0, result.market_share_pct)),
      Finance: Math.min(100, Math.max(0, financeScore)),
      Satisfaction: Math.min(100, Math.max(0, result.customer_satisfaction)),
      RSE: Math.min(100, Math.max(0, result.rse_score)),
    },
  };
}

// ------------------------------------------------------------
// Single Team Radar Component
// ------------------------------------------------------------

interface SingleRadarProps {
  teamData: TeamRadarData;
  title?: string;
  height?: number;
}

export function SingleTeamRadar({ teamData, title, height = 300 }: SingleRadarProps) {
  const radarData = [
    { subject: 'ROI', value: teamData.metrics.ROI, fullMark: 100 },
    { subject: 'PDM', value: teamData.metrics.PDM, fullMark: 100 },
    { subject: 'Finance', value: teamData.metrics.Finance, fullMark: 100 },
    { subject: 'Satisfaction', value: teamData.metrics.Satisfaction, fullMark: 100 },
    { subject: 'RSE', value: teamData.metrics.RSE, fullMark: 100 },
  ];

  return (
    <Card>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsRadarChart data={radarData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            />
            <Radar
              name={teamData.teamName}
              dataKey="value"
              stroke={lightenHex(teamData.teamColor, 0.2)}
              fill={lightenHex(teamData.teamColor, 0.5)}
              fillOpacity={0.35}
              strokeWidth={2}
            />
          </RechartsRadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Export types
export type { TeamRadarData };
