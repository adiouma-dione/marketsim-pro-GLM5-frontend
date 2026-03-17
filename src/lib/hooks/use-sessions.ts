// ============================================================
// MarketSim Pro - Sessions Hook
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import type {
  GameSessionResponse,
  GameSessionCreate,
  MessageResponse,
} from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/constants';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...sessionKeys.lists(), filters] as const,
  details: () => [...sessionKeys.all, 'detail'] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as const,
};

// ------------------------------------------------------------
// Fetch Sessions
// ------------------------------------------------------------

export function useSessions() {
  return useQuery({
    queryKey: sessionKeys.lists(),
    queryFn: () => apiGet<GameSessionResponse[]>(API_ENDPOINTS.SESSIONS),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ------------------------------------------------------------
// Fetch Single Session
// ------------------------------------------------------------

export function useSession(sessionId: string | null) {
  return useQuery({
    queryKey: sessionKeys.detail(sessionId || ''),
    queryFn: () => apiGet<GameSessionResponse>(API_ENDPOINTS.SESSION_BY_ID(sessionId!)),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}

// ------------------------------------------------------------
// Create Session Mutation Hook
// ------------------------------------------------------------

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GameSessionCreate) =>
      apiPost<GameSessionResponse>(API_ENDPOINTS.SESSIONS, data),
    onSuccess: (newSession) => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Session créée avec succès !');
      return newSession;
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la création de la session');
    },
  });
}

// ------------------------------------------------------------
// Delete Session Mutation Hook
// ------------------------------------------------------------

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiDelete<MessageResponse>(API_ENDPOINTS.SESSION_BY_ID(sessionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Session supprimée');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });
}

// ------------------------------------------------------------
// Update Session Mutation Hook
// ------------------------------------------------------------

export function useUpdateSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<GameSessionCreate>) =>
      apiPost<GameSessionResponse>(API_ENDPOINTS.SESSION_BY_ID(sessionId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
      toast.success('Session mise à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la mise à jour');
    },
  });
}
