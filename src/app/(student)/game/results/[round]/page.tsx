// ============================================================
// MarketSim Pro - Student Round Results Page
// ============================================================

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProgressRound } from '@/components/ui/progress-round';
import { RoundResultMetrics } from '@/components/results/round-result-metrics';
import { PnlTableStudent } from '@/components/results/pnl-table-student';
import { QhseSection } from '@/components/results/qhse-section';
import { HrRdSection } from '@/components/results/hr-rd-section';
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
import { useRoundResultsPage } from '@/lib/hooks/use-student-results';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { formatCurrency } from '@/lib/utils';
import type { RoundResultResponse } from '@/lib/types';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function StudentRoundResultsPage() {
  const params = useParams();
  const router = useRouter();
  const round = parseInt(params.round as string, 10) || 1;

  // Fetch team data
  const { data: myTeamData, isLoading: teamLoading } = useMyTeam();
  const teamId = myTeamData?.id;
  const sessionId = myTeamData?.session_id;

  // Fetch results
  const {
    teamResult,
    sessionResults,
    marketReport,
    previousResult,
    history,
    isLoading,
    isError,
    refetch,
  } = useRoundResultsPage(teamId || '', sessionId || '', round);

  // Calculate max round from history
  const maxRound = Math.max(round, ...history.map((h) => h.round_number), 1);

  // Navigation handlers
  const goToPreviousRound = () => {
    if (round > 1) {
      router.push(`/game/results/${round - 1}`);
    }
  };

  const goToNextRound = () => {
    if (round < maxRound) {
      router.push(`/game/results/${round + 1}`);
    }
  };

  // Loading state
  if (teamLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (isError || !teamResult) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Aucun résultat disponible pour le tour {round}. Vérifiez que la simulation a été exécutée.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    );
  }

  // Prepare price comparison data
  const priceComparisonData = sessionResults?.results?.map((r: RoundResultResponse, index: number) => {
    const pricePerUnit = r.result.units_sold > 0 
      ? r.result.revenue / r.result.units_sold 
      : 0;
    const isMyTeam = r.result.team_id === teamId;
    
    return {
      name: isMyTeam ? r.team_name : `Équipe ${String.fromCharCode(65 + index)}`,
      price: Math.round(pricePerUnit),
      isMyTeam,
      color: isMyTeam ? '#2563EB' : '#D1D5DB',
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Résultats — Tour {round}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Performance de votre équipe
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousRound}
            disabled={round <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <ProgressRound currentRound={round} maxRounds={maxRound} />

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextRound}
            disabled={round >= maxRound}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <RoundResultMetrics result={teamResult} />

      {/* P&L Table */}
      <PnlTableStudent
        currentResult={teamResult}
        previousResult={previousResult}
        currentRound={round}
      />

      {/* Price Comparison Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Prix pratiqué par équipe</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={priceComparisonData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${v}€`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  width={70}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}€`, 'Prix unitaire']}
                />
                <Bar dataKey="price" radius={[0, 4, 4, 0]}>
                  {priceComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Market Events */}
      {marketReport?.active_events && marketReport.active_events.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Événements du marché</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {marketReport.active_events.map((event: Record<string, unknown>, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg"
                >
                  <span className="text-sm">
                    {(event as { description?: string }).description || JSON.stringify(event)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center text-gray-400">
            Aucun événement ce tour
          </CardContent>
        </Card>
      )}

      {/* QHSE Section - Conditional */}
      <QhseSection result={teamResult} />

      {/* HR & R&D Section - Conditional */}
      <HrRdSection result={teamResult} />
    </div>
  );
}
