// ============================================================
// MarketSim Pro - Analytics Page
// ============================================================

'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, BarChart3, TrendingUp, Triangle, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  rank_delta?: number;
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
  const lastCompletedRound =
    session?.status === 'finished' ? currentRound : Math.max(0, currentRound - 1);
  const {
    isLoading: roundsLoading,
    isError,
    roundsData,
    allResults,
  } = useAllRoundsResults(sessionId, lastCompletedRound);

  // Fetch leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading } =
    useLeaderboard(sessionId);

  const isLoading = sessionLoading || roundsLoading || leaderboardLoading;

  const availableRounds = React.useMemo(
    () => Array.from(roundsData.keys()).sort((a, b) => a - b),
    [roundsData]
  );
  const lastAvailableRound = availableRounds[availableRounds.length - 1] || 0;
  const [selectedRound, setSelectedRound] = React.useState(0);

  React.useEffect(() => {
    if (!availableRounds.length) return;
    setSelectedRound((prev) =>
      availableRounds.includes(prev) ? prev : lastAvailableRound
    );
  }, [availableRounds, lastAvailableRound]);

  // Leaderboard rankings
  const rankings: LeaderboardRanking[] = React.useMemo(() => {
    const raw = Array.isArray(leaderboard)
      ? leaderboard
      : Array.isArray(leaderboard?.rankings)
        ? leaderboard.rankings
        : [];

    return raw.map((entry: Record<string, unknown>, index: number) => {
      const scoreValue =
        (entry.final_score as number | undefined) ??
        (entry.score as number | undefined) ??
        (entry.total_net_income as number | undefined);

      const marketShare =
        (entry.market_share as number | undefined) ??
        (entry.average_market_share as number | undefined) ??
        (entry.market_share_pct as number | undefined);

      const satisfaction =
        (entry.dimension_scores as Record<string, number> | undefined)?.customer_satisfaction ??
        (entry.average_satisfaction as number | undefined) ??
        (entry.metrics as Record<string, number> | undefined)?.satisfaction;

      const rse =
        (entry.dimension_scores as Record<string, number> | undefined)?.rse_score ??
        (entry.metrics as Record<string, number> | undefined)?.rse;

      const cash =
        (entry.cash as number | undefined) ??
        (entry.metrics as Record<string, number> | undefined)?.cash;

      const rankDelta =
        (entry.rank_delta as number | undefined) ??
        (entry.delta as number | undefined);

      return {
        team_id: (entry.team_id as string) || `${index}`,
        team_name: (entry.team_name as string) || 'Équipe',
        team_color: (entry.team_color as string) || (entry.color_hex as string),
        rank: (entry.rank as number) || index + 1,
        rank_delta: typeof rankDelta === 'number' ? rankDelta : undefined,
        score: typeof scoreValue === 'number' ? scoreValue : undefined,
        metrics: {
          cash: typeof cash === 'number' ? cash : undefined,
          market_share: typeof marketShare === 'number' ? marketShare : undefined,
          satisfaction: typeof satisfaction === 'number' ? satisfaction : undefined,
          rse: typeof rse === 'number' ? rse : undefined,
        },
      };
    });
  }, [leaderboard]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No data state
  if (!session || availableRounds.length === 0) {
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
  const selectedResults =
    roundsData.get(selectedRound) || latestResults;

  // Build radar data for all teams
  const radarData = selectedResults.results.map((teamResult) =>
    createTeamRadarData(
      teamResult.result,
      teamResult.team_name,
      teamResult.team_color
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold text-gray-900">Analyses</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">
            {session.name} • {availableRounds.length} tour
            {availableRounds.length > 1 ? 's' : ''} joué
            {availableRounds.length > 1 ? 's' : ''}
          </p>
          <Select
            value={selectedRound ? String(selectedRound) : ''}
            onValueChange={(value) => setSelectedRound(Number(value))}
          >
            <SelectTrigger className="w-[160px] h-8">
              <SelectValue placeholder="Choisir un tour" />
            </SelectTrigger>
            <SelectContent>
              {availableRounds.map((round) => (
                <SelectItem key={round} value={String(round)}>
                  Tour {round}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              sessionResults={selectedResults}
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
              sessionResults={selectedResults}
              title="Comparaison des revenus"
              showMarketing={false}
              showRevenue={true}
            />
          </div>
        </TabsContent>

        {/* Position Tab */}
        <TabsContent value="position" className="space-y-6">
          <ScatterPlot sessionResults={selectedResults} />
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
        round={selectedRound || lastAvailableRound}
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
            <TableHead className="w-[90px] text-center">Rang</TableHead>
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
              <TableCell className="text-center">
                {(() => {
                  const rank = team.rank ?? index + 1;
                  const delta = team.rank_delta ?? 0;

                  const deltaIndicator =
                    delta > 0 ? (
                      <Triangle className="h-3 w-3 text-emerald-500" />
                    ) : delta < 0 ? (
                      <Triangle className="h-3 w-3 rotate-180 text-red-500" />
                    ) : (
                      <Minus className="h-3 w-3 text-orange-500" />
                    );

                  return (
                    <div className="inline-flex items-center justify-center gap-2">
                      {rank === 1 ? (
                        <span className="text-lg">🏆</span>
                      ) : (
                        <Badge variant="outline">{rank}</Badge>
                      )}
                      <span className="text-xs">{deltaIndicator}</span>
                    </div>
                  );
                })()}
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
                {team.score !== undefined ? team.score.toFixed(1) : '-'}
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
