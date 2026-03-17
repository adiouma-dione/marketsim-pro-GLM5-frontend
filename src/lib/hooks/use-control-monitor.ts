// ============================================================
// MarketSim Pro - Control Monitor Hook
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost } from '@/lib/api';
import type {
  ControlMonitorResponse,
  DecisionStatus,
  SimulationStartResponse,
  MessageResponse,
  ManualEventResponse,
  ForceSubmitResponse,
  ReplayRoundResponse,
  GameSessionResponse,
  SurpriseAuditResponse,
} from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/constants';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const controlKeys = {
  monitor: (sessionId: string) => ['control-monitor', sessionId] as const,
  decisionStatus: (sessionId: string) => ['decision-status', sessionId] as const,
};

// ------------------------------------------------------------
// Fetch Control Monitor
// ------------------------------------------------------------

export function useControlMonitor(sessionId: string | null) {
  return useQuery({
    queryKey: controlKeys.monitor(sessionId || ''),
    queryFn: () =>
      apiGet<ControlMonitorResponse>(API_ENDPOINTS.SESSION_MONITOR(sessionId!)),
    enabled: !!sessionId,
    refetchInterval: 8000, // Poll every 8 seconds
  });
}

// ------------------------------------------------------------
// Fetch Decision Status
// ------------------------------------------------------------

export function useDecisionStatus(sessionId: string | null) {
  return useQuery({
    queryKey: controlKeys.decisionStatus(sessionId || ''),
    queryFn: () =>
      apiGet<DecisionStatus>(`/api/v1/sessions/${sessionId}/decisions-status`),
    enabled: !!sessionId,
    refetchInterval: 6000, // Poll every 6 seconds
  });
}

// ------------------------------------------------------------
// Simulate Round
// ------------------------------------------------------------

export function useSimulateRound(sessionId: string) {
  return useMutation({
    mutationFn: () =>
      apiPost<SimulationStartResponse>(API_ENDPOINTS.SESSION_SIMULATE_ROUND(sessionId)),
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du lancement de la simulation');
    },
  });
}

// ------------------------------------------------------------
// Force Submit
// ------------------------------------------------------------

export function useForceSubmit(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<ForceSubmitResponse>(API_ENDPOINTS.SESSION_FORCE_SUBMIT(sessionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlKeys.monitor(sessionId) });
      queryClient.invalidateQueries({ queryKey: controlKeys.decisionStatus(sessionId) });
      toast.success('Soumissions forcées effectuées');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la soumission forcée');
    },
  });
}

// ------------------------------------------------------------
// Inject Manual Event
// ------------------------------------------------------------

export function useInjectEvent(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      event_type: string;
      severity: number;
      description?: string;
      round_number?: number;
    }) => apiPost<ManualEventResponse>(API_ENDPOINTS.SESSION_MANUAL_EVENT(sessionId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlKeys.monitor(sessionId) });
      toast.success('Événement injecté');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'injection");
    },
  });
}

// ------------------------------------------------------------
// Replay Round
// ------------------------------------------------------------

export function useReplayRound(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<ReplayRoundResponse>(API_ENDPOINTS.SESSION_REPLAY_ROUND(sessionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlKeys.monitor(sessionId) });
      queryClient.invalidateQueries({ queryKey: controlKeys.decisionStatus(sessionId) });
      toast.success('Tour rejoué');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du replay');
    },
  });
}

// ------------------------------------------------------------
// Pause Session
// ------------------------------------------------------------

export function usePauseSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<GameSessionResponse>(API_ENDPOINTS.SESSION_PAUSE(sessionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: controlKeys.monitor(sessionId) });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session mise en pause');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise en pause');
    },
  });
}

// ------------------------------------------------------------
// Surprise Audit
// ------------------------------------------------------------

export function useSurpriseAudit(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<SurpriseAuditResponse>(API_ENDPOINTS.SESSION_SURPRISE_AUDIT(sessionId)),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: controlKeys.monitor(sessionId) });
      toast.success(`Audit surprise planifié pour ${data.scheduled_targets.length} équipe(s)`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'audit");
    },
  });
}
