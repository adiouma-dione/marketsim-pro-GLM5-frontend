// ============================================================
// MarketSim Pro - Market Report Hook
// ============================================================

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '../api';
import { API_ENDPOINTS } from '../constants';
import type { MarketReport } from '../types';

// ------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------

export const marketReportKeys = {
  all: (sessionId: string) => ['market-report', sessionId] as const,
  round: (sessionId: string, round: number) =>
    ['market-report', sessionId, round] as const,
};

// ------------------------------------------------------------
// Fetch Market Report
// ------------------------------------------------------------

export function useMarketReport(sessionId: string, round: number) {
  return useQuery({
    queryKey: marketReportKeys.round(sessionId, round),
    queryFn: () =>
      apiGet<MarketReport>(
        API_ENDPOINTS.RESULTS_MARKET_REPORT(sessionId, round)
      ),
    enabled: !!sessionId && round > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
