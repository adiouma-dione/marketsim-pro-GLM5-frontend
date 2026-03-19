// ============================================================
// MarketSim Pro - Student Results Hook
// ============================================================

'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  RoundResultData,
  SessionResults,
  MarketReport,
  TeamResultsHistory,
  TeamFinancials,
  LeaderboardResponse,
} from '@/lib/types';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const studentResultsKeys = {
  all: ['student-results'] as const,
  teamRound: (teamId: string, round: number) =>
    ['student-results', 'team', teamId, 'round', round] as const,
  sessionRound: (sessionId: string, round: number) =>
    ['student-results', 'session', sessionId, 'round', round] as const,
  marketReport: (sessionId: string, round: number) =>
    ['student-results', 'market', sessionId, round] as const,
  history: (teamId: string) => ['student-results', 'history', teamId] as const,
  financials: (teamId: string) =>
    ['student-results', 'financials', teamId] as const,
  leaderboard: (sessionId: string) =>
    ['student-results', 'leaderboard', sessionId] as const,
};

// ------------------------------------------------------------
// Fetch Team Result for Round
// ------------------------------------------------------------

export function useTeamRoundResult(teamId: string, round: number) {
  return useQuery({
    queryKey: studentResultsKeys.teamRound(teamId, round),
    queryFn: () =>
      apiGet<RoundResultData>(API_ENDPOINTS.RESULTS_TEAM_ROUND(teamId, round)),
    enabled: !!teamId && round > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Session Results for Round (all teams)
// ------------------------------------------------------------

export function useSessionRoundResults(sessionId: string, round: number) {
  return useQuery({
    queryKey: studentResultsKeys.sessionRound(sessionId, round),
    queryFn: () =>
      apiGet<SessionResults>(API_ENDPOINTS.RESULTS_ROUND(sessionId, round)),
    enabled: !!sessionId && round > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Market Report
// ------------------------------------------------------------

export function useMarketReport(sessionId: string, round: number) {
  return useQuery({
    queryKey: studentResultsKeys.marketReport(sessionId, round),
    queryFn: () =>
      apiGet<MarketReport>(
        API_ENDPOINTS.RESULTS_MARKET_REPORT(sessionId, round)
      ),
    enabled: !!sessionId && round > 0,
    staleTime: 10 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Team History
// ------------------------------------------------------------

export function useTeamHistoryResults(teamId: string) {
  return useQuery({
    queryKey: studentResultsKeys.history(teamId),
    queryFn: () =>
      apiGet<TeamResultsHistory>(
        API_ENDPOINTS.RESULTS_TEAM_HISTORY(teamId)
      ),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Team Financials
// ------------------------------------------------------------

export function useTeamFinancials(teamId: string) {
  return useQuery({
    queryKey: studentResultsKeys.financials(teamId),
    queryFn: () =>
      apiGet<TeamFinancials>(API_ENDPOINTS.RESULTS_TEAM_FINANCIALS(teamId)),
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Leaderboard
// ------------------------------------------------------------

interface LeaderboardRanking {
  team_id: string;
  team_name: string;
  team_color?: string;
  rank: number;
  rank_delta?: number;
  score?: number;
  market_share_pct?: number;
  cash?: number;
  debt?: number;
}

interface TypedLeaderboardData {
  rankings: LeaderboardRanking[];
  total_teams: number;
  updated_at?: string;
}

export function useLeaderboard(sessionId: string) {
  return useQuery({
    queryKey: studentResultsKeys.leaderboard(sessionId),
    queryFn: async () => {
      const response = await apiGet<LeaderboardResponse>(
        API_ENDPOINTS.LEADERBOARD(sessionId)
      );
      const rawRankings = Array.isArray((response as { rankings?: unknown[] }).rankings)
        ? ((response as { rankings?: Record<string, unknown>[] }).rankings ?? [])
        : [];

      const rankings: LeaderboardRanking[] = rawRankings.map((entry, index) => ({
        team_id: String(entry.team_id ?? index),
        team_name: String(entry.team_name ?? 'Équipe'),
        team_color:
          typeof entry.team_color === 'string'
            ? entry.team_color
            : typeof entry.color_hex === 'string'
              ? entry.color_hex
              : undefined,
        rank: typeof entry.rank === 'number' ? entry.rank : index + 1,
        rank_delta:
          typeof entry.rank_delta === 'number'
            ? entry.rank_delta
            : typeof entry.delta === 'number'
              ? entry.delta
              : undefined,
        score:
          typeof entry.final_score === 'number'
            ? entry.final_score
            : typeof entry.score === 'number'
              ? entry.score
              : typeof entry.total_net_income === 'number'
                ? entry.total_net_income
                : undefined,
        market_share_pct:
          typeof entry.market_share === 'number'
            ? entry.market_share
            : typeof entry.average_market_share === 'number'
              ? entry.average_market_share
              : typeof entry.market_share_pct === 'number'
                ? entry.market_share_pct
                : undefined,
        cash: typeof entry.cash === 'number' ? entry.cash : undefined,
        debt: typeof entry.debt === 'number' ? entry.debt : undefined,
      }));

      return {
        rankings,
        total_teams:
          typeof (response as { total_teams?: unknown }).total_teams === 'number'
            ? ((response as { total_teams: number }).total_teams)
            : rankings.length,
        updated_at:
          typeof (response as { updated_at?: unknown }).updated_at === 'string'
            ? ((response as { updated_at: string }).updated_at)
            : undefined,
      } satisfies TypedLeaderboardData;
    },
    enabled: !!sessionId,
    staleTime: 15 * 1000,
    refetchInterval: 15 * 1000, // Poll every 15 seconds
  });
}

// ------------------------------------------------------------
// Combined Hook for Round Results Page
// ------------------------------------------------------------

export function useRoundResultsPage(
  teamId: string,
  sessionId: string,
  round: number
) {
  const teamResultQuery = useTeamRoundResult(teamId, round);
  const sessionResultsQuery = useSessionRoundResults(sessionId, round);
  const marketReportQuery = useMarketReport(sessionId, round);
  const historyQuery = useTeamHistoryResults(teamId);

  const isLoading =
    teamResultQuery.isLoading ||
    sessionResultsQuery.isLoading ||
    historyQuery.isLoading;

  const isError = teamResultQuery.isError || sessionResultsQuery.isError;

  // Get previous round result for comparison
  const previousResult = historyQuery.data?.results?.find(
    (r) => r.round_number === round - 1
  );

  return {
    // Data
    teamResult: teamResultQuery.data,
    sessionResults: sessionResultsQuery.data,
    marketReport: marketReportQuery.data,
    previousResult,
    history: historyQuery.data?.results ?? [],

    // Loading states
    isLoading,
    isError,

    // Refetch
    refetch: () => {
      teamResultQuery.refetch();
      sessionResultsQuery.refetch();
      marketReportQuery.refetch();
      historyQuery.refetch();
    },
  };
}

// ------------------------------------------------------------
// Fetch Multiple Rounds for Comparison
// ------------------------------------------------------------

export function useAllRoundsComparison(
  sessionId: string,
  teamId: string,
  currentRound: number
) {
  const queries = Array.from({ length: currentRound }, (_, i) => i + 1).map(
    (round) => ({
      queryKey: studentResultsKeys.teamRound(teamId, round),
      queryFn: () =>
        apiGet<RoundResultData>(
          API_ENDPOINTS.RESULTS_TEAM_ROUND(teamId, round)
        ),
      enabled: !!teamId && round > 0,
      staleTime: 10 * 60 * 1000,
    })
  );

  return useQueries({
    queries,
    combine: (results) => {
      const data = results
        .map((r) => r.data)
        .filter(Boolean)
        .sort((a, b) => a!.round_number - b!.round_number);
      const isLoading = results.some((r) => r.isLoading);
      const isError = results.some((r) => r.isError);

      return { data, isLoading, isError };
    },
  });
}
