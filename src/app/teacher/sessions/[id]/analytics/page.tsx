// ============================================================
// MarketSim Pro - Analytics Page
// ============================================================

'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from '@/lib/hooks/use-sessions';
import { useAllRoundsResults, useLeaderboard } from '@/lib/hooks/use-analytics';
import { PdmLineChart, MultiMetricLineChart } from '@/components/charts/pdm-line-chart';
import { MarketBarChart } from '@/components/charts/market-bar-chart';
import { ScatterPlot } from '@/components/charts/scatter-plot';
import { RadarChart, createTeamRadarData } from '@/components/charts/radar-chart';
import { PedagogicalNotes } from '@/components/analytics/pedagogical-notes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface LeaderboardRanking {
  team_id: string;
  team_name: string;
  team_color?: string;
  rank: number;
  score?: number;
  metrics?: {
    cash?: number;
    market_share?: number;
    satisfaction?: number;
    rse?: number;
  };
}

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function AnalyticsPage() {
  const params = useParams();
  const sessionId = params.id as string;

  // Fetch session data
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);

  // Fetch all rounds results
  const currentRound = session?.current_round || 0;
  const {
    isLoading: roundsLoading,
    isError,
    roundsData,
    allResults,
  } = useAllRoundsResults(sessionId, currentRound);

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } =
    useLeaderboard(sessionId);

  const isLoading = sessionLoading || roundsLoading || leaderboardLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No data state
  if (!session || allResults.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Pas encore de données
        </h2>
        <p className="text-muted-foreground">
          Les analyses seront disponibles après le premier tour de simulation.
        </p>
      </div>
    );
  }

  // Get latest round results
  const latestResults = allResults[allResults.length - 1];

  // Build radar data for all teams
  const radarData = latestResults.results.map((teamResult) =>
    createTeamRadarData(
      teamResult.result,
      teamResult.team_name,
      teamResult.team_color
    )
  );

  // Leaderboard rankings
  const rankings: LeaderboardRanking[] = Array.isArray(leaderboard?.rankings)
    ? (leaderboard.rankings as LeaderboardRanking[])
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Analyses</h1>
        <p className="text-sm text-gray-500 mt-1">
          {session.name} • {currentRound} tour{currentRound > 1 ? 's' : ''}{' '}
          joué{currentRound > 1 ? 's' : ''}
        </p>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="market" className="space-y-6">
        <TabsList>
          <TabsTrigger value="market">Marché</TabsTrigger>
          <TabsTrigger value="financial">Finance</TabsTrigger>
          <TabsTrigger value="position">Positionnement</TabsTrigger>
          <TabsTrigger value="profiles">Profils</TabsTrigger>
        </TabsList>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <PdmLineChart roundsData={roundsData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketBarChart
              sessionResults={latestResults}
              title="Marketing vs Part de marché"
            />
            <MultiMetricLineChart
              roundsData={roundsData}
              metric="revenue"
              title="Évolution du chiffre d'affaires"
              yAxisFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M€` :
                v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`
              }
            />
          </div>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <MultiMetricLineChart
            roundsData={roundsData}
            metric="net_income"
            title="Évolution du résultat net"
            yAxisFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MultiMetricLineChart
              roundsData={roundsData}
              metric="cash"
              title="Évolution de la trésorerie"
              yAxisFormatter={(v) =>
                v >= 1000000 ? `${(v / 1000000).toFixed(1)}M€` :
                v >= 1000 ? `${(v / 1000).toFixed(0)}k€` : `${v}€`
              }
            />
            <MarketBarChart
              sessionResults={latestResults}
              title="Comparaison des revenus"
              showMarketing={false}
              showRevenue={true}
            />
          </div>
        </TabsContent>

        {/* Position Tab */}
        <TabsContent value="position" className="space-y-6">
          <ScatterPlot sessionResults={latestResults} />
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-6">
          <RadarChart
            teamsData={radarData}
            title="Profils des équipes"
            showToggle
          />
        </TabsContent>
      </Tabs>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Classement général
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length > 0 ? (
            <LeaderboardTable rankings={rankings} />
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Classement non disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* Pedagogical Notes */}
      <PedagogicalNotes
        sessionId={sessionId}
        round={currentRound}
        title="Observations pédagogiques globales"
      />
    </div>
  );
}

// ------------------------------------------------------------
// Leaderboard Table Component
// ------------------------------------------------------------

function LeaderboardTable({ rankings }: { rankings: LeaderboardRanking[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rang</TableHead>
            <TableHead>Équipe</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Trésorerie</TableHead>
            <TableHead className="text-right">PDM</TableHead>
            <TableHead className="text-right">Satisfaction</TableHead>
            <TableHead className="text-right">RSE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.map((team, index) => (
            <TableRow key={team.team_id}>
              <TableCell>
                {team.rank || index + 1 === 1 ? (
                  <span className="text-yellow-500 font-bold">1</span>
                ) : (
                  <Badge variant="outline">{team.rank || index + 1}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {team.team_color && (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: team.team_color }}
                    />
                  )}
                  <span className="font-medium">{team.team_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {team.score?.toFixed(1) || '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.cash !== undefined
                  ? formatCurrency(team.metrics.cash)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.market_share !== undefined
                  ? formatPercent(team.metrics.market_share)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.satisfaction !== undefined
                  ? team.metrics.satisfaction.toFixed(1)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.rse !== undefined
                  ? team.metrics.rse.toFixed(1)
                  : '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
