// ============================================================
// MarketSim Pro - Round Results Hook
// ============================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGet, apiPut } from '../api';
import { API_ENDPOINTS } from '../constants';
import type {
  SessionResults,
  RoundNotesResponse,
} from '../types';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const roundResultsKeys = {
  all: (sessionId: string) => ['round-results', sessionId] as const,
  round: (sessionId: string, round: number) =>
    ['round-results', sessionId, round] as const,
  notes: (sessionId: string, round: number) =>
    ['round-notes', sessionId, round] as const,
};

// ------------------------------------------------------------
// Fetch Round Results
// ------------------------------------------------------------

export function useRoundResults(sessionId: string, round: number) {
  return useQuery({
    queryKey: roundResultsKeys.round(sessionId, round),
    queryFn: () =>
      apiGet<SessionResults>(API_ENDPOINTS.RESULTS_ROUND(sessionId, round)),
    enabled: !!sessionId && round > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ------------------------------------------------------------
// Fetch Round Notes
// ------------------------------------------------------------

export function useRoundNotes(sessionId: string, round: number) {
  return useQuery({
    queryKey: roundResultsKeys.notes(sessionId, round),
    queryFn: () =>
      apiGet<RoundNotesResponse>(API_ENDPOINTS.ROUND_NOTES(sessionId, round)),
    enabled: !!sessionId && round > 0,
  });
}

// ------------------------------------------------------------
// Save Round Notes
// ------------------------------------------------------------

export function useSaveRoundNotes(sessionId: string, round: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notes: string) =>
      apiPut<RoundNotesResponse>(API_ENDPOINTS.ROUND_NOTES(sessionId, round), {
        notes,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(
        roundResultsKeys.notes(sessionId, round),
        data
      );
    },
  });
}
