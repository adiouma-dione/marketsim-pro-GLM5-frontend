// ============================================================
// MarketSim Pro - Analytics Hook
// ============================================================

import { useQuery, useQueries, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPost } from '../api';
import { API_ENDPOINTS } from '../constants';
import type { SessionResults, LeaderboardResponse, FinalReportResponse, BadgesResponse } from '../types';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const analyticsKeys = {
  all: (sessionId: string) => ['analytics', sessionId] as const,
  allRounds: (sessionId: string) => ['analytics', sessionId, 'rounds'] as const,
  round: (sessionId: string, round: number) =>
    ['analytics', sessionId, 'rounds', round] as const,
  leaderboard: (sessionId: string) =>
    ['analytics', sessionId, 'leaderboard'] as const,
  finalReport: (sessionId: string) =>
    ['analytics', sessionId, 'final-report'] as const,
  badges: (sessionId: string) =>
    ['analytics', sessionId, 'badges'] as const,
};

// ------------------------------------------------------------
// Fetch All Rounds Results (for multi-round analytics)
// ------------------------------------------------------------

export function useAllRoundsResults(sessionId: string, currentRound: number) {
  // Create queries for all rounds from 1 to currentRound
  const queries = Array.from({ length: currentRound }, (_, i) => i + 1).map(
    (round) => ({
      queryKey: analyticsKeys.round(sessionId, round),
      queryFn: () =>
        apiGet<SessionResults>(API_ENDPOINTS.RESULTS_ROUND(sessionId, round)),
      enabled: !!sessionId && round > 0,
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  );

  return useQueries({
    queries,
    combine: (results) => {
      const isLoading = results.some((r) => r.isLoading);
      const isError = results.some((r) => r.isError);
      const errors = results.filter((r) => r.error).map((r) => r.error);

      // Map round number to results
      const roundsData = new Map<number, SessionResults>();
      results.forEach((result, index) => {
        if (result.data) {
          roundsData.set(index + 1, result.data);
        }
      });

      return {
        isLoading,
        isError,
        errors,
        roundsData,
        // Convenience arrays
        allResults: Array.from(roundsData.entries())
          .sort(([a], [b]) => a - b)
          .map(([, data]) => data),
      };
    },
  });
}

// ------------------------------------------------------------
// Fetch Leaderboard
// ------------------------------------------------------------

export function useLeaderboard(sessionId: string) {
  return useQuery({
    queryKey: analyticsKeys.leaderboard(sessionId),
    queryFn: () =>
      apiGet<LeaderboardResponse>(API_ENDPOINTS.LEADERBOARD(sessionId)),
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ------------------------------------------------------------
// Fetch Final Report
// ------------------------------------------------------------

export function useFinalReport(sessionId: string) {
  return useQuery({
    queryKey: analyticsKeys.finalReport(sessionId),
    queryFn: () =>
      apiGet<FinalReportResponse>(API_ENDPOINTS.FINAL_REPORT(sessionId)),
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ------------------------------------------------------------
// Fetch Badges
// ------------------------------------------------------------

export function useBadges(sessionId: string) {
  return useQuery({
    queryKey: analyticsKeys.badges(sessionId),
    queryFn: () =>
      apiGet<BadgesResponse>(API_ENDPOINTS.BADGES(sessionId)),
    enabled: !!sessionId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ------------------------------------------------------------
// Scoring Weights Types
// ------------------------------------------------------------

export interface ScoringWeights {
  roi: number;
  market_share: number;
  financial_health: number;
  customer_satisfaction: number;
  rse_score: number;
}

// ------------------------------------------------------------
// Update Scoring Weights
// ------------------------------------------------------------

export function useUpdateScoringWeights(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (weights: ScoringWeights) =>
      apiPost<{ success: boolean }>(
        API_ENDPOINTS.SCORING_WEIGHTS(sessionId),
        weights
      ),
    onSuccess: () => {
      // Invalidate final report to recalculate with new weights
      queryClient.invalidateQueries({
        queryKey: analyticsKeys.finalReport(sessionId),
      });
    },
  });
}
