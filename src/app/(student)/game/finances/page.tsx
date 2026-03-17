// ============================================================
// MarketSim Pro - Student Financials Page
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { FinancialTabs } from '@/components/financials/financial-tabs';
import { useTeamFinancials } from '@/lib/hooks/use-student-results';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { ROUTES } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function StudentFinancialsPage() {
  const router = useRouter();
  
  // Fetch team data
  const { data: myTeamData, isLoading: teamLoading } = useMyTeam();
  const teamId = myTeamData?.id;
  const teamName = myTeamData?.name || 'Mon équipe';

  // Fetch financials
  const { data: financials, isLoading, isError, error } = useTeamFinancials(teamId || '');

  // Redirect if no team
  React.useEffect(() => {
    if (!teamLoading && !myTeamData) {
      router.push(ROUTES.JOIN);
    }
  }, [teamLoading, myTeamData, router]);

  // Loading state
  if (teamLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !financials) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">États financiers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analysez vos états financiers
          </p>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Impossible de charger les données financières.{' '}
            {error?.message || 'Vérifiez que des résultats ont été générés.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if there's data
  const hasData =
    financials.income_statements.length > 0 ||
    financials.balance_sheets.length > 0 ||
    financials.cash_flows.length > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">États financiers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analysez vos états financiers
          </p>
        </div>

        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Aucune donnée financière disponible.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Les états financiers seront disponibles après le premier tour de simulation.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">États financiers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Analysez vos états financiers — {teamName}
        </p>
      </div>

      {/* Summary Cards */}
      {financials.income_statements.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Dernier CA</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(
                  financials.income_statements[financials.income_statements.length - 1]
                    ?.revenue || 0
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-gray-500">Dernier résultat net</p>
              <p className="text-lg font-semibold">
                {formatCurrency(
                  financials.income_statements[financials.income_statements.length - 1]
                    ?.net_income || 0
                )}
              </p>
            </CardContent>
          </Card>
          {financials.balance_sheets.length > 0 && (
            <>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Trésorerie</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(
                      financials.balance_sheets[financials.balance_sheets.length - 1]?.assets
                        ?.cash || 0
                    )}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs text-gray-500">Dette totale</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(
                      financials.balance_sheets[financials.balance_sheets.length - 1]
                        ?.liabilities?.debt || 0
                    )}
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Financial Tabs */}
      <FinancialTabs financials={financials} teamName={teamName} />
    </div>
  );
}
