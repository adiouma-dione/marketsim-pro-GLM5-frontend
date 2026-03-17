// ============================================================
// MarketSim Pro - Student Financials Page
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
  const { data: financials, isLoading: financialLoading, isError } = useTeamFinancials(teamId || '');

  // Redirect if no team
  React.useEffect(() => {
    if (!teamLoading && !myTeamData) {
      router.push(ROUTES.JOIN);
    }
  }, [teamLoading, myTeamData, router]);

  // Loading state
  if (teamLoading || financialLoading || !teamId) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-blue-600" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Une erreur est survenue lors du chargement des données financières.
          Vérifiez votre connexion et réessayez.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if we have financial data
  const hasFinancials =
    financials &&
    (financials.income_statements.length > 0 ||
      financials.balance_sheets.length > 0 ||
      financials.cash_flows.length > 0);

  // Get latest data
  const latestIncome = financials?.income_statements[financials.income_statements.length - 1];
  const latestBalance = financials?.balance_sheets[financials.balance_sheets.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            États financiers
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Analysez la performance financière de {teamName}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dernier revenu</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(latestIncome?.revenue || 0)}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Trésorerie</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(latestBalance?.assets?.cash || 0)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Dette totale</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(latestBalance?.liabilities?.debt || 0)}
                </p>
              </div>
              <DollarSign className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Tabs */}
      {hasFinancials ? (
        <FinancialTabs financials={financials} teamName={teamName} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-muted-foreground mt-2">
              Aucune donnée financière disponible
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
