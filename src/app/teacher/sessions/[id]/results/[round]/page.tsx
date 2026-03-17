// ============================================================
// MarketSim Pro - Round Results Page
// ============================================================

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Users,
  DollarSign,
  Activity,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPIGrid, KPICard } from '@/components/ui/kpi-card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { EventList, type GameEvent } from '@/components/ui/event-card';
import { PnLTable } from '@/components/charts/pnl-table';
import { PedagogicalNotes } from '@/components/analytics/pedagogical-notes';
import { useSession } from '@/lib/hooks/use-sessions';
import { useRoundResults, useRoundNotes } from '@/lib/hooks/use-round-results';
import { useMarketReport } from '@/lib/hooks/use-market-report';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function RoundResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const round = parseInt(params.round as string, 10);

  // Fetch data
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: results, isLoading: resultsLoading } = useRoundResults(sessionId, round);
  const { data: marketReport, isLoading: reportLoading } = useMarketReport(sessionId, round);

  const isLoading = sessionLoading || resultsLoading || reportLoading;

  // Navigation helpers
  const canGoBack = round > 1;
  const canGoForward = session && round < session.current_round;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No results state
  if (!results || !session) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Aucun résultat disponible pour ce tour.
        </p>
        <Button
          variant="link"
          onClick={() => router.push(ROUTES.TEACHER_SESSION(sessionId))}
        >
          Retour à la session
        </Button>
      </div>
    );
  }

  // Find leader team
  const leaderTeam = results.results.reduce(
    (max, current) => {
      const currentRank = getTeamRank(current.result, results.results);
      const maxRank = getTeamRank(max.result, results.results);
      return currentRank < maxRank ? current : max;
    },
    results.results[0]
  );

  // Count active events
  const activeEvents: GameEvent[] = (marketReport?.active_events || []).map(
    (e: Record<string, unknown>, i: number) => ({
      id: (e.id as string) || `event-${i}`,
      event_type: (e.event_type as string) || 'unknown',
      severity: e.severity as number | undefined,
      description: (e.description as string) || '',
      round_number: round,
    })
  );

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Résultats - Tour {round}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {session.name} • {results.results.length} équipes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={canGoBack ? ROUTES.TEACHER_RESULTS(sessionId, round - 1) : '#'}
          >
            <Button variant="outline" disabled={!canGoBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Tour {round - 1}
            </Button>
          </Link>
          <Link
            href={canGoForward ? ROUTES.TEACHER_RESULTS(sessionId, round + 1) : '#'}
          >
            <Button variant="outline" disabled={!canGoForward}>
              Tour {round + 1}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KPIGrid columns={4}>
        <KPICard
          title="Demande totale"
          value={formatNumber(results.total_market_demand)}
          icon={Users}
          variant="info"
        />
        <KPICard
          title="Prix moyen marché"
          value={formatCurrency(results.average_price)}
          icon={DollarSign}
          variant="default"
        />
        <KPICard
          title="Équipe leader"
          value={leaderTeam?.team_name || '-'}
          icon={Trophy}
          variant="success"
        />
        <KPICard
          title="Événements actifs"
          value={activeEvents.length.toString()}
          icon={Activity}
          variant={activeEvents.length > 0 ? 'warning' : 'default'}
        />
      </KPIGrid>

      {/* Comparative Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classement des équipes</CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsTable results={results.results} />
        </CardContent>
      </Card>

      {/* Events Section */}
      {activeEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Événements du tour</CardTitle>
          </CardHeader>
          <CardContent>
            <EventList events={activeEvents} showRound={false} />
          </CardContent>
        </Card>
      )}

      {/* P&L and Notes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PnLTable sessionResults={results} />
        <PedagogicalNotes sessionId={sessionId} round={round} />
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Results Table Component
// ------------------------------------------------------------

interface ResultsTableProps {
  results: Array<{
    result: RoundResultData;
    team_name: string;
    team_color: string;
  }>;
}

function ResultsTable({ results }: ResultsTableProps) {
  // Sort by market share (or could use rank from market report)
  const sortedResults = [...results].sort(
    (a, b) => b.result.market_share_pct - a.result.market_share_pct
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Équipe</TableHead>
            <TableHead className="text-center">Rang</TableHead>
            <TableHead className="text-right">Unités vendues</TableHead>
            <TableHead className="text-right">CA</TableHead>
            <TableHead className="text-right">Résultat net</TableHead>
            <TableHead className="text-right">PDM</TableHead>
            <TableHead className="text-right">Qualité</TableHead>
            <TableHead className="text-right">QHSE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedResults.map((teamResult, index) => {
            const { result, team_name, team_color } = teamResult;
            const rank = index + 1;

            return (
              <TableRow key={result.team_id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team_color }}
                    />
                    <span className="font-medium">{team_name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {rank === 1 ? (
                    <Trophy className="h-5 w-5 text-yellow-500 mx-auto" />
                  ) : (
                    <Badge variant="outline">{rank}</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {formatNumber(result.units_sold)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(result.revenue)}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    result.net_income >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(result.net_income)}
                </TableCell>
                <TableCell className="text-right">
                  {formatPercent(result.market_share_pct)}
                </TableCell>
                <TableCell className="text-right">
                  {result.quality_score.toFixed(1)}
                </TableCell>
                <TableCell className="text-right">
                  {result.qhse_score.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function getTeamRank(
  result: RoundResultData,
  allResults: Array<{ result: RoundResultData }>
): number {
  const sorted = [...allResults].sort(
    (a, b) => b.result.market_share_pct - a.result.market_share_pct
  );
  return sorted.findIndex((r) => r.result.team_id === result.team_id) + 1;
}
