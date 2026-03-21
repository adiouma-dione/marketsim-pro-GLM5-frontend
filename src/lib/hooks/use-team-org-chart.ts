'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiGet, apiPut } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { TeamOrgChartResponse, TeamOrgChartUpdateRequest } from '@/lib/types';

export const teamOrgChartKeys = {
  all: ['team-org-chart'] as const,
  detail: (teamId: string) => [...teamOrgChartKeys.all, teamId] as const,
};

export function useTeamOrgChart(teamId: string) {
  return useQuery({
    queryKey: teamOrgChartKeys.detail(teamId),
    queryFn: () => apiGet<TeamOrgChartResponse>(API_ENDPOINTS.TEAM_ORG_CHART(teamId)),
    enabled: !!teamId,
    staleTime: 15 * 1000,
  });
}

export function useUpdateTeamOrgChart(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TeamOrgChartUpdateRequest) =>
      apiPut<TeamOrgChartResponse>(API_ENDPOINTS.TEAM_ORG_CHART(teamId), payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamOrgChartKeys.detail(teamId) });
      queryClient.invalidateQueries({ queryKey: ['team-dashboard', 'my-team'] });
      queryClient.invalidateQueries({ queryKey: ['team-detail', teamId] });
      toast.success('Organigramme mis à jour');
    },
    onError: (error: Error) => {
      toast.error(error.message || "Impossible de mettre à jour l'organigramme");
    },
  });
}
