// ============================================================
// MarketSim Pro - Team Dashboard Hook
// ============================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  TeamDashboard,
  TeamResultsHistory,
  GameSessionResponse,
  LeaderboardResponse,
  TeamResponse,
} from '@/lib/types';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const teamDashboardKeys = {
  all: ['team-dashboard'] as const,
  myTeam: () => ['team-dashboard', 'my-team'] as const,
  dashboard: (teamId: string) => ['team-dashboard', teamId] as const,
  history: (teamId: string) => ['team-dashboard', teamId, 'history'] as const,
};

export const sessionKeys = {
  detail: (id: string) => ['session', id] as const,
  leaderboard: (id: string) => ['session', id, 'leaderboard'] as const,
};

// ------------------------------------------------------------
// Fetch My Team
// ------------------------------------------------------------

export function useMyTeam() {
  return useQuery({
    queryKey: teamDashboardKeys.myTeam(),
    queryFn: () => apiGet<TeamResponse>(API_ENDPOINTS.MY_TEAM),
    staleTime: 30 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Team Dashboard
// ------------------------------------------------------------

export function useTeamDashboard(sessionId: string, teamId: string) {
  const previousRoundRef = useRef<number | null>(null);

  const query = useQuery({
    queryKey: teamDashboardKeys.dashboard(teamId),
    queryFn: () =>
      apiGet<TeamDashboard>(API_ENDPOINTS.TEAM_DASHBOARD(sessionId, teamId)),
    refetchInterval: 20 * 1000, // Poll every 20 seconds
    staleTime: 10 * 1000,
    enabled: !!sessionId && !!teamId,
  });

  // Show toast when new results are available
  useEffect(() => {
    if (query.data?.last_results) {
      const currentRound = query.data.last_results.round_number;
      
      if (
        previousRoundRef.current !== null &&
        currentRound > previousRoundRef.current
      ) {
        toast.info(`Résultats du tour ${currentRound} disponibles !`);
      }
      
      previousRoundRef.current = currentRound;
    }
  }, [query.data?.last_results]);

  return query;
}

// ------------------------------------------------------------
// Fetch Team Results History
// ------------------------------------------------------------

export function useTeamHistory(teamId: string) {
  return useQuery({
    queryKey: teamDashboardKeys.history(teamId),
    queryFn: () =>
      apiGet<TeamResultsHistory>(API_ENDPOINTS.TEAM_DASHBOARD_HISTORY(teamId)),
    staleTime: 60 * 1000,
    enabled: !!teamId,
  });
}

// ------------------------------------------------------------
// Fetch Session Status (for student view)
// ------------------------------------------------------------

export function useSessionStatus(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: () =>
      apiGet<GameSessionResponse>(API_ENDPOINTS.SESSION_BY_ID(sessionId)),
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000, // Poll every 15 seconds for status updates
    enabled: !!sessionId,
  });
}

// ------------------------------------------------------------
// Fetch Leaderboard for Student Ranking
// ------------------------------------------------------------

interface LeaderboardRanking {
  team_id: string;
  team_name: string;
  rank: number;
  score?: number;
}

interface TypedLeaderboardResponse {
  rankings: LeaderboardRanking[];
  total_teams: number;
}

export function useSessionLeaderboard(sessionId: string) {
  return useQuery({
    queryKey: sessionKeys.leaderboard(sessionId),
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
        rank: typeof entry.rank === 'number' ? entry.rank : index + 1,
        score:
          typeof entry.final_score === 'number'
            ? entry.final_score
            : typeof entry.score === 'number'
              ? entry.score
              : typeof entry.total_net_income === 'number'
                ? entry.total_net_income
                : undefined,
      }));

      return {
        rankings,
        total_teams:
          typeof (response as { total_teams?: unknown }).total_teams === 'number'
            ? (response as { total_teams: number }).total_teams
            : rankings.length,
      } satisfies TypedLeaderboardResponse;
    },
    staleTime: 30 * 1000,
    enabled: !!sessionId,
  });
}

// ------------------------------------------------------------
// Combined Hook for Dashboard Data
// ------------------------------------------------------------

export function useStudentDashboardData(sessionId: string, teamId: string) {
  const dashboardQuery = useTeamDashboard(sessionId, teamId);
  const historyQuery = useTeamHistory(teamId);
  const sessionQuery = useSessionStatus(sessionId);
  const leaderboardQuery = useSessionLeaderboard(sessionId);

  const isLoading =
    dashboardQuery.isLoading ||
    historyQuery.isLoading ||
    sessionQuery.isLoading;

  const isError =
    dashboardQuery.isError ||
    sessionQuery.isError;

  return {
    // Dashboard data
    team: dashboardQuery.data?.team,
    currentRound: dashboardQuery.data?.current_round ?? 1,
    decisionsSubmitted: dashboardQuery.data?.decisions_submitted ?? false,
    marketEvents: dashboardQuery.data?.market_events,
    lastResults: dashboardQuery.data?.last_results,
    
    // History data
    history: historyQuery.data?.results ?? [],
    
    // Session data
    session: sessionQuery.data,
    sessionStatus: sessionQuery.data?.status ?? 'draft',
    maxRounds: sessionQuery.data?.max_rounds ?? 12,
    
    // Leaderboard data
    leaderboard: leaderboardQuery.data,
    myRank: leaderboardQuery.data?.rankings?.find((r) => r.team_id === teamId)?.rank,
    totalTeams: leaderboardQuery.data?.total_teams ?? 0,
    
    // Loading states
    isLoading,
    isError,
    
    // Refetch functions
    refetchDashboard: dashboardQuery.refetch,
    refetchAll: () => {
      dashboardQuery.refetch();
      historyQuery.refetch();
      sessionQuery.refetch();
      leaderboardQuery.refetch();
    },
  };
}
