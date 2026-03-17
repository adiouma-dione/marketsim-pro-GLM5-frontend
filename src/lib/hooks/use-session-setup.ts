// ============================================================
// MarketSim Pro - Session Setup Hook
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import type {
  TeacherSetupResponse,
  TeacherSetupUpdateResponse,
  TeamResponse,
  TeamCreate,
  MessageResponse,
  GameSessionResponse,
} from '@/lib/types';
import { API_ENDPOINTS } from '@/lib/constants';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const setupKeys = {
  all: ['setup'] as const,
  detail: (sessionId: string) => [...setupKeys.all, sessionId] as const,
};

// ------------------------------------------------------------
// Fetch Setup Data
// ------------------------------------------------------------

export function useSessionSetup(sessionId: string | null) {
  return useQuery({
    queryKey: setupKeys.detail(sessionId || ''),
    queryFn: () =>
      apiGet<TeacherSetupResponse>(API_ENDPOINTS.SESSION_SETUP(sessionId!)),
    enabled: !!sessionId,
    staleTime: 30 * 1000,
  });
}

// ------------------------------------------------------------
// Update Setup (Save Parameters)
// ------------------------------------------------------------

export function useUpdateSetup(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TeacherSetupResponse>) =>
      apiPut<TeacherSetupUpdateResponse>(
        API_ENDPOINTS.SESSION_SETUP(sessionId),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setupKeys.detail(sessionId) });
      toast.success('Paramètres sauvegardés');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    },
  });
}

// ------------------------------------------------------------
// Create Team
// ------------------------------------------------------------

export function useCreateTeam(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamCreate) =>
      apiPost<TeamResponse>(`/api/v1/teams/sessions/${sessionId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setupKeys.detail(sessionId) });
      toast.success('Équipe créée');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'équipe");
    },
  });
}

// ------------------------------------------------------------
// Delete Team
// ------------------------------------------------------------

export function useDeleteTeam(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) =>
      apiDelete<MessageResponse>(`/api/v1/teams/${teamId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setupKeys.detail(sessionId) });
      toast.success('Équipe supprimée');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de l'équipe");
    },
  });
}

// ------------------------------------------------------------
// Assign Student to Team
// ------------------------------------------------------------

export function useAssignStudent(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ teamId, studentId }: { teamId: string; studentId: string }) =>
      apiPost<TeamResponse>(`/api/v1/teams/${teamId}/assign-student`, {
        student_id: studentId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setupKeys.detail(sessionId) });
      toast.success('Étudiant assigné');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'assignation");
    },
  });
}

// ------------------------------------------------------------
// Start Session
// ------------------------------------------------------------

export function useStartSession(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiPost<GameSessionResponse>(API_ENDPOINTS.SESSION_START(sessionId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setupKeys.detail(sessionId) });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session démarrée !');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors du démarrage');
    },
  });
}
