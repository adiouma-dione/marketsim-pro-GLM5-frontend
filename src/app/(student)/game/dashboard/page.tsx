// ============================================================
// MarketSim Pro - Student Dashboard Page
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  LineChart,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIRow, KPIRowSkeleton } from '@/components/dashboard/kpi-row';
import { ContextBanner, ContextBannerSkeleton } from '@/components/dashboard/context-banner';
import { MachinesCard, MachinesCardSkeleton } from '@/components/dashboard/machines-card';
import { LastRoundSummary, LastRoundSummarySkeleton } from '@/components/dashboard/last-round-summary';
import { useStudentDashboardData, useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { ROUTES } from '@/lib/constants';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function StudentDashboardPage() {
  const router = useRouter();
  const { data: myTeamData, isLoading: teamLoading } = useMyTeam();

  const teamId = myTeamData?.id;
  const sessionId = myTeamData?.session_id;

  const {
    team,
    currentRound,
    decisionsSubmitted,
    marketEvents,
    lastResults,
    history,
    session,
    sessionStatus,
    maxRounds,
    myRank,
    totalTeams,
    isLoading,
    isError,
  } = useStudentDashboardData(sessionId || '', teamId || '');

  // Redirect if no team
  React.useEffect(() => {
    if (!teamLoading && !myTeamData) {
      router.push(ROUTES.JOIN);
    }
  }, [teamLoading, myTeamData, router]);

  // Loading state
  if (teamLoading || isLoading || !team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <ContextBannerSkeleton />
        <KPIRowSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-white border shadow-sm">
              <CardContent className="h-[300px] animate-pulse bg-gray-100" />
            </Card>
            <MachinesCardSkeleton />
            <LastRoundSummarySkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Get previous round results for delta calculations
  const previousResults = history.length > 1 ? history[history.length - 2] : null;
  const previousCash = previousResults?.ending_cash;
  const previousRank = myRank; // Would need actual previous rank from history

  // Get market share history for sparkline
  const marketShareHistory = history.map((r) => r.market_share_pct);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tour {currentRound} sur {maxRounds}
        </p>
      </div>

      {/* Context Banner */}
      <ContextBanner
        decisionsSubmitted={decisionsSubmitted}
        sessionStatus={sessionStatus}
        currentRound={currentRound}
        maxRounds={maxRounds}
      />

      {/* KPI Row */}
      <KPIRow
        cash={team.cash ?? 0}
        previousCash={previousCash}
        marketShare={lastResults?.market_share_pct ?? 0}
        marketShareHistory={marketShareHistory}
        satisfaction={lastResults?.customer_satisfaction ?? 0}
        rank={myRank ?? totalTeams}
        totalTeams={totalTeams}
        previousRank={previousRank}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Share Evolution */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <LineChart className="h-4 w-4 text-muted-foreground" />
              Évolution de votre part de marché
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsLineChart
                  data={history.map((r, i) => ({
                    round: i + 1,
                    marketShare: r.market_share_pct,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `T${v}`}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Part de marché']}
                    labelFormatter={(label) => `Tour ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="marketShare"
                    stroke={team.color_hex || '#3B82F6'}
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue vs Costs */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              Revenus vs Coûts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart
                  data={history.map((r, i) => ({
                    round: i + 1,
                    revenue: r.revenue,
                    costs: r.cogs + r.marketing_expense + r.admin_expense + r.maintenance_expense,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="round"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `T${v}`}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Tour ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Revenus" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costs" name="Coûts" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Machines Card */}
        <MachinesCard
          machines={team.machines || []}
          sessionId={sessionId}
          teamId={teamId}
        />

        {/* Last Round Summary */}
        <LastRoundSummary
          results={lastResults || null}
          roundNumber={currentRound > 1 ? currentRound - 1 : undefined}
        />
      </div>
    </div>
  );
}
