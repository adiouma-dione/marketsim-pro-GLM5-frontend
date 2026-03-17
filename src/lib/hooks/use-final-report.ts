// ============================================================
// MarketSim Pro - Final Report Hook
// ============================================================

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { TeamResultsHistory, LeaderboardResponse, BadgesResponse } from '@/lib/types';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const finalReportKeys = {
  all: ['final-report'] as const,
  report: (sessionId: string) => ['final-report', sessionId] as const,
  badges: (sessionId: string) => ['final-report', 'badges', sessionId] as const,
  history: (teamId: string) => ['final-report', 'history', teamId] as const,
};

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface DimensionScores {
  roi: number;
  market_share: number;
  financial_solidity: number;
  satisfaction: number;
  rse: number;
}

interface FinalReportTeam {
  team_id: string;
  team_name: string;
  team_color: string;
  final_score: number;
  rank: number;
  dimension_scores: DimensionScores;
  final_stats: {
    cash: number;
    debt: number;
    market_share_pct: number;
    customer_satisfaction: number;
    rse_score: number;
  };
  badges: string[];
}

interface FinalReportData {
  session_id: string;
  session_name: string;
  champion: {
    team_id: string;
    team_name: string;
  };
  teams: FinalReportTeam[];
  averages: {
    cash: number;
    debt: number;
    market_share_pct: number;
    customer_satisfaction: number;
    rse_score: number;
  };
  scoring_weights: {
    roi: number;
    market_share: number;
    financial_solidity: number;
    satisfaction: number;
    rse: number;
  };
}

// ------------------------------------------------------------
// Fetch Final Report
// ------------------------------------------------------------

export function useFinalReport(sessionId: string) {
  return useQuery({
    queryKey: finalReportKeys.report(sessionId),
    queryFn: async () => {
      const response = await apiGet<Record<string, unknown>>(
        API_ENDPOINTS.FINAL_REPORT(sessionId)
      );
      return response as unknown as FinalReportData;
    },
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Badges
// ------------------------------------------------------------

export interface BadgeDefinition {
  badge_id: string;
  label: string;
  description: string;
  icon: string;
  condition: string;
  rarity: 'common' | 'rare' | 'epic';
}

export function useBadges(sessionId: string) {
  return useQuery({
    queryKey: finalReportKeys.badges(sessionId),
    queryFn: async () => {
      const response = await apiGet<BadgesResponse[]>(
        API_ENDPOINTS.BADGES(sessionId)
      );
      return response as unknown as BadgeDefinition[];
    },
    enabled: !!sessionId,
    staleTime: 30 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Team History for Timeline
// ------------------------------------------------------------

export function useTeamHistoryForFinal(teamId: string) {
  return useQuery({
    queryKey: finalReportKeys.history(teamId),
    queryFn: () =>
      apiGet<TeamResultsHistory>(API_ENDPOINTS.RESULTS_TEAM_HISTORY(teamId)),
    enabled: !!teamId,
    staleTime: 10 * 60 * 1000,
  });
}

// ------------------------------------------------------------
// Combined Hook for Final Report Page
// ------------------------------------------------------------

export function useFinalReportPage(sessionId: string, teamId: string) {
  const reportQuery = useFinalReport(sessionId);
  const badgesQuery = useBadges(sessionId);
  const historyQuery = useTeamHistoryForFinal(teamId);

  const isLoading =
    reportQuery.isLoading || badgesQuery.isLoading || historyQuery.isLoading;

  const isError = reportQuery.isError || historyQuery.isError;

  // Find current team in report
  const teamReport = reportQuery.data?.teams.find(
    (t) => t.team_id === teamId
  );

  // Check if champion
  const isChampion =
    reportQuery.data?.champion?.team_id === teamId ||
    teamReport?.rank === 1;

  return {
    // Data
    report: reportQuery.data,
    teamReport,
    badges: badgesQuery.data,
    history: historyQuery.data?.results ?? [],
    isChampion,

    // Loading states
    isLoading,
    isError,

    // Refetch
    refetch: () => {
      reportQuery.refetch();
      badgesQuery.refetch();
      historyQuery.refetch();
    },
  };
}
