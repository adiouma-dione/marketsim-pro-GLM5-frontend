// ============================================================
// MarketSim Pro - Decisions Hook
// ============================================================

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { z } from 'zod';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type {
  DecisionResponse,
  TeamDetailResponse,
  MarketReport,
  DecisionCreate,
  DecisionUpdate,
} from '@/lib/types';

const breakdownQuantity = z.number().int().min(0);

const marketingBreakdownSchema = z.object({
  small_billboards: breakdownQuantity,
  large_billboards: breakdownQuantity,
  radio_spots: breakdownQuantity,
  tv_spots: breakdownQuantity,
  flyer_batches: breakdownQuantity,
  digital_campaigns: breakdownQuantity,
  adjustment: breakdownQuantity,
});

const maintenanceBreakdownSchema = z.object({
  preventive_visits: breakdownQuantity,
  spare_parts_kits: breakdownQuantity,
  external_technician_days: breakdownQuantity,
  predictive_maintenance_packs: breakdownQuantity,
  safety_inspections: breakdownQuantity,
  adjustment: breakdownQuantity,
});

const qhseBreakdownSchema = z.object({
  safety_audits: breakdownQuantity,
  protective_equipment_kits: breakdownQuantity,
  evacuation_drills: breakdownQuantity,
  waste_treatment_batches: breakdownQuantity,
  iso_preparation_blocks: breakdownQuantity,
  adjustment: breakdownQuantity,
});

const hrBreakdownSchema = z.object({
  training_sessions: breakdownQuantity,
  team_building_days: breakdownQuantity,
  recruitment_campaigns: breakdownQuantity,
  wellness_programs: breakdownQuantity,
  bonus_packages: breakdownQuantity,
  adjustment: breakdownQuantity,
});

const rdBreakdownSchema = z.object({
  prototypes: breakdownQuantity,
  lab_tests: breakdownQuantity,
  user_studies: breakdownQuantity,
  material_research_blocks: breakdownQuantity,
  patent_watch_cycles: breakdownQuantity,
  adjustment: breakdownQuantity,
});

// ------------------------------------------------------------
// Zod Schema for Form Validation
// ------------------------------------------------------------

export const decisionSchema = z.object({
  price_per_unit: z.number().int().min(50).max(500),
  production_volume: z.number().int().min(100).max(10000),
  marketing_budget: z.number().int().min(0).max(100000),
  maintenance_budget: z.number().int().min(0).max(50000),
  loan_amount: z.number().int().min(0).max(500000),
  rd_investment: z.number().int().min(0).max(100000),
  qhse_investment: z.number().int().min(0).max(100000),
  hr_investment: z.number().int().min(0).max(100000),
  avg_salary: z.number().int().min(1500).max(5000),
  marketing_breakdown: marketingBreakdownSchema,
  maintenance_breakdown: maintenanceBreakdownSchema,
  qhse_breakdown: qhseBreakdownSchema,
  hr_breakdown: hrBreakdownSchema,
  rd_breakdown: rdBreakdownSchema,
});

export type DecisionFormData = z.infer<typeof decisionSchema>;

export const defaultDecisionValues: DecisionFormData = {
  price_per_unit: 150,
  production_volume: 500,
  marketing_budget: 10000,
  maintenance_budget: 5000,
  loan_amount: 0,
  rd_investment: 0,
  qhse_investment: 0,
  hr_investment: 0,
  avg_salary: 2000,
  marketing_breakdown: {
    small_billboards: 0,
    large_billboards: 0,
    radio_spots: 0,
    tv_spots: 0,
    flyer_batches: 0,
    digital_campaigns: 0,
    adjustment: 10000,
  },
  maintenance_breakdown: {
    preventive_visits: 0,
    spare_parts_kits: 0,
    external_technician_days: 0,
    predictive_maintenance_packs: 0,
    safety_inspections: 0,
    adjustment: 5000,
  },
  qhse_breakdown: {
    safety_audits: 0,
    protective_equipment_kits: 0,
    evacuation_drills: 0,
    waste_treatment_batches: 0,
    iso_preparation_blocks: 0,
    adjustment: 0,
  },
  hr_breakdown: {
    training_sessions: 0,
    team_building_days: 0,
    recruitment_campaigns: 0,
    wellness_programs: 0,
    bonus_packages: 0,
    adjustment: 0,
  },
  rd_breakdown: {
    prototypes: 0,
    lab_tests: 0,
    user_studies: 0,
    material_research_blocks: 0,
    patent_watch_cycles: 0,
    adjustment: 0,
  },
};

export function extractDecisionPayload(
  data: DecisionFormData & { round_number?: number }
): DecisionUpdate | DecisionCreate {
  const payload = {
    price_per_unit: data.price_per_unit,
    production_volume: data.production_volume,
    marketing_budget: data.marketing_budget,
    maintenance_budget: data.maintenance_budget,
    loan_amount: data.loan_amount,
    rd_investment: data.rd_investment,
    qhse_investment: data.qhse_investment,
    hr_investment: data.hr_investment,
    avg_salary: data.avg_salary,
  };

  if (typeof data.round_number === 'number') {
    return {
      ...payload,
      round_number: data.round_number,
    };
  }

  return payload;
}

export function buildDecisionBreakdownsFromTotals(
  decision?: Partial<
    Pick<
      DecisionResponse,
      | 'marketing_budget'
      | 'maintenance_budget'
      | 'qhse_investment'
      | 'hr_investment'
      | 'rd_investment'
    >
  >
) {
  return {
    marketing_breakdown: {
      ...defaultDecisionValues.marketing_breakdown,
      adjustment: decision?.marketing_budget ?? defaultDecisionValues.marketing_budget,
    },
    maintenance_breakdown: {
      ...defaultDecisionValues.maintenance_breakdown,
      adjustment: decision?.maintenance_budget ?? defaultDecisionValues.maintenance_budget,
    },
    qhse_breakdown: {
      ...defaultDecisionValues.qhse_breakdown,
      adjustment: decision?.qhse_investment ?? defaultDecisionValues.qhse_investment,
    },
    hr_breakdown: {
      ...defaultDecisionValues.hr_breakdown,
      adjustment: decision?.hr_investment ?? defaultDecisionValues.hr_investment,
    },
    rd_breakdown: {
      ...defaultDecisionValues.rd_breakdown,
      adjustment: decision?.rd_investment ?? defaultDecisionValues.rd_investment,
    },
  };
}

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const decisionsKeys = {
  all: ['decisions'] as const,
  teamRound: (teamId: string, round: number) =>
    ['decisions', teamId, round] as const,
  teamDetail: (teamId: string) => ['team-detail', teamId] as const,
  marketReport: (sessionId: string, round: number) =>
    ['market-report', sessionId, round] as const,
};

// ------------------------------------------------------------
// Fetch Decision for Current Round
// ------------------------------------------------------------

export function useDecision(teamId: string, round: number) {
  return useQuery({
    queryKey: decisionsKeys.teamRound(teamId, round),
    queryFn: async () => {
      try {
        return await apiGet<DecisionResponse>(
          API_ENDPOINTS.DECISIONS_TEAM_ROUND(teamId, round)
        );
      } catch (error) {
        // A missing decision for the current round is a valid empty state.
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!teamId && round > 0,
    staleTime: 30 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Team Detail (for machines, cash, debt)
// ------------------------------------------------------------

export function useTeamDetail(teamId: string) {
  return useQuery({
    queryKey: decisionsKeys.teamDetail(teamId),
    queryFn: () => apiGet<TeamDetailResponse>(API_ENDPOINTS.TEAM_DETAIL(teamId)),
    enabled: !!teamId,
    staleTime: 15 * 1000,
  });
}

// ------------------------------------------------------------
// Fetch Market Report for Last Round
// ------------------------------------------------------------

export function useLastMarketReport(sessionId: string, lastRound: number) {
  return useQuery({
    queryKey: decisionsKeys.marketReport(sessionId, lastRound),
    queryFn: () =>
      apiGet<MarketReport>(
        API_ENDPOINTS.RESULTS_MARKET_REPORT(sessionId, lastRound)
      ),
    enabled: !!sessionId && lastRound > 0,
    staleTime: 60 * 1000,
  });
}

// ------------------------------------------------------------
// Autosave Mutation
// ------------------------------------------------------------

export function useAutosaveDecision(
  teamId: string,
  round: number,
  onSuccess?: (timestamp: string) => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DecisionUpdate) =>
      apiPut<DecisionResponse>(
        API_ENDPOINTS.DECISIONS_AUTOSAVE(teamId, round),
        extractDecisionPayload(data as DecisionFormData)
      ),
    onSuccess: (response) => {
      // Update the cached decision
      queryClient.setQueryData(
        decisionsKeys.teamRound(teamId, round),
        response
      );
      onSuccess?.(response.submitted_at);
    },
    onError: () => {
      // Silent error for autosave - don't show toast
      console.error('Autosave failed');
    },
  });
}

// ------------------------------------------------------------
// Submit Decision Mutation
// ------------------------------------------------------------

export function useSubmitDecision(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DecisionCreate) =>
      apiPost<DecisionResponse>(
        API_ENDPOINTS.DECISIONS_SUBMIT(teamId),
        extractDecisionPayload(data as DecisionFormData & { round_number: number })
      ),
    onSuccess: (response) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({
        queryKey: decisionsKeys.teamRound(teamId, response.round_number),
      });
      queryClient.invalidateQueries({
        queryKey: decisionsKeys.teamDetail(teamId),
      });
      toast.success('Décisions soumises avec succès !');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la soumission: ${error.message}`);
    },
  });
}

// ------------------------------------------------------------
// Buy Machine Mutation
// ------------------------------------------------------------

export function useBuyMachine(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { machine_type: string; quantity: number }) =>
      apiPost<TeamDetailResponse>(
        API_ENDPOINTS.TEAM_BUY_MACHINE(teamId),
        data
      ),
    onSuccess: () => {
      // Invalidate team detail to refetch machines and cash
      queryClient.invalidateQueries({
        queryKey: decisionsKeys.teamDetail(teamId),
      });
      toast.success('Machine achetée avec succès !');
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'achat: ${error.message}`);
    },
  });
}

// ------------------------------------------------------------
// Autosave Hook with Debounce
// ------------------------------------------------------------

export function useAutosaveForm(
  teamId: string,
  round: number,
  formValues: DecisionFormData,
  isLocked: boolean
) {
  const autosaveMutation = useAutosaveDecision(teamId, round);
  const [lastSaved, setLastSaved] = useState('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastValuesRef = useRef<string>('');

  // Debounced autosave function
  const performAutosave = useCallback(
    (values: DecisionFormData) => {
      if (isLocked) return;

      // Check if values actually changed
      const valuesJson = JSON.stringify(values);
      if (valuesJson === lastValuesRef.current) return;
      lastValuesRef.current = valuesJson;

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for 30 seconds
      timeoutRef.current = setTimeout(() => {
        autosaveMutation.mutate(values, {
          onSuccess: (response) => {
            setLastSaved(response.submitted_at);
          },
        });
      }, 30000);
    },
    [autosaveMutation, isLocked]
  );

  // Watch form values and trigger autosave
  useEffect(() => {
    performAutosave(formValues);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formValues, performAutosave]);

  // Save on visibility change (tab loses focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'hidden' &&
        !isLocked &&
        lastValuesRef.current
      ) {
        // Clear the debounce timeout and save immediately
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        const values = JSON.parse(lastValuesRef.current) as DecisionFormData;
        autosaveMutation.mutate(values);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [autosaveMutation, isLocked]);

  return {
    lastSaved,
    isSaving: autosaveMutation.isPending,
  };
}

// ------------------------------------------------------------
// Combined Hook for Decisions Page
// ------------------------------------------------------------

export function useDecisionsPage(
  teamId: string,
  sessionId: string,
  currentRound: number
) {
  const decisionQuery = useDecision(teamId, currentRound);
  const teamDetailQuery = useTeamDetail(teamId);
  const marketReportQuery = useLastMarketReport(sessionId, currentRound - 1);

  const isLoading =
    decisionQuery.isLoading || teamDetailQuery.isLoading;
  const isError = decisionQuery.isError || teamDetailQuery.isError;

  const decision = decisionQuery.data;
  const teamDetail = teamDetailQuery.data;
  const marketReport = marketReportQuery.data;

  const isLocked = decision?.is_locked ?? false;

  // Calculate total machine capacity
  const totalCapacity =
    teamDetail?.machines?.reduce((sum, machine) => {
      if (!machine.is_active) return sum;
      // Get capacity from machine type - we'd need MACHINE_CONFIG here
      // For now, return a placeholder calculation
      return sum + (machine.quantity || 0) * 500; // Default capacity
    }, 0) ?? 0;

  // Calculate interest expense
  const interestRate = 0.05; // Default, should come from session config
  const interestExpense = (teamDetail?.debt ?? 0) * interestRate;

  return {
    // Data
    decision,
    teamDetail,
    marketReport,
    currentRound,
    isLocked,

    // Computed
    totalCapacity,
    interestExpense,
    interestRate,

    // Loading states
    isLoading,
    isError,

    // Refetch
    refetch: () => {
      decisionQuery.refetch();
      teamDetailQuery.refetch();
      marketReportQuery.refetch();
    },
  };
}
