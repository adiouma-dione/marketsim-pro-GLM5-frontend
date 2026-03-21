// ============================================================
// MarketSim Pro - Student Decisions Page
// ============================================================

'use client';

import * as React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Save, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DecisionsTabs } from '@/components/decisions/decisions-tabs';
import { ProductionTab } from '@/components/decisions/production-tab';
import { FinanceTab } from '@/components/decisions/finance-tab';
import { MarketingTab } from '@/components/decisions/marketing-tab';
import { QualityTab } from '@/components/decisions/quality-tab';
import { DecisionSummary } from '@/components/decisions/decision-summary';
import {
  useDecisionsPage,
  useAutosaveForm,
  useSubmitDecision,
  useBuyMachine,
  buildDecisionBreakdownsFromTotals,
  extractDecisionPayload,
  decisionSchema,
  defaultDecisionValues,
  type DecisionFormData,
} from '@/lib/hooks/use-decisions';
import { useMyTeam, useSessionStatus } from '@/lib/hooks/use-team-dashboard';
import { formatTime } from '@/lib/utils';
import type { MachineType } from '@/lib/types';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function StudentDecisionsPage() {
  // Fetch team data first
  const { data: teamData, isLoading: isTeamLoading } = useMyTeam();
  const team = teamData;
  const teamId = team?.id;
  const sessionId = team?.session_id;
  const { data: sessionData } = useSessionStatus(sessionId || '');
  const currentRound = sessionData?.current_round ?? 1;

  // Fetch decisions page data
  const {
    decision,
    teamDetail,
    marketReport,
    isLocked,
    totalCapacity,
    interestExpense,
    interestRate,
    isLoading,
    isError,
    refetch,
  } = useDecisionsPage(teamId || '', sessionId || '', currentRound);

  // Mutations
  const submitDecision = useSubmitDecision(teamId || '');
  const buyMachine = useBuyMachine(teamId || '');

  // Form setup
  const formMethods = useForm<DecisionFormData>({
    resolver: zodResolver(decisionSchema),
    defaultValues: defaultDecisionValues,
    mode: 'onChange',
  });

  const { watch, reset } = formMethods;
  const formValues = watch();
  const hydratedRoundRef = React.useRef<string | null>(null);
  const currentUserRoles = teamDetail?.current_user_roles ?? team?.current_user_roles ?? [];
  const orgChartRequired = teamDetail?.org_chart_required ?? team?.org_chart_required ?? false;
  const orgChartComplete = teamDetail?.org_chart_complete ?? team?.org_chart_complete ?? false;
  const hasDirector = Boolean(teamDetail?.director_user_id ?? team?.director_user_id);
  const orgChartEnabled = orgChartRequired || hasDirector || currentUserRoles.length > 0;
  const isDirector = currentUserRoles.includes('dg');

  const canEditAll = !orgChartEnabled || isDirector;
  const canEditProduction = canEditAll || currentUserRoles.includes('production');
  const canEditFinance = canEditAll || currentUserRoles.includes('finance');
  const canEditMarketing = canEditAll || currentUserRoles.includes('marketing');
  const canEditQuality = canEditAll || currentUserRoles.includes('quality_hr');
  const canEditAnyDecision =
    canEditProduction || canEditFinance || canEditMarketing || canEditQuality;
  const canBuyMachine = !orgChartEnabled || isDirector;
  const canSubmitDecision = !orgChartEnabled || isDirector;

  const submitBlockedReason = React.useMemo(() => {
    if (!orgChartEnabled) return null;
    if (!isDirector) {
      return "Seul le DG peut soumettre la décision finale.";
    }
    if (orgChartRequired && !orgChartComplete) {
      return "Complétez d'abord l'organigramme avant la soumission finale.";
    }
    return null;
  }, [isDirector, orgChartComplete, orgChartEnabled, orgChartRequired]);

  // Initialize form once per team/round. The backend only stores aggregated totals,
  // so re-running reset after local edits would collapse detailed budget fields back
  // into the "adjustment" line.
  React.useEffect(() => {
    if (!teamId || isLoading) {
      return;
    }

    const hydrationKey = `${teamId}:${currentRound}`;
    if (hydratedRoundRef.current === hydrationKey) {
      return;
    }

    const hydratedValues = decision
      ? {
          ...defaultDecisionValues,
          price_per_unit: decision.price_per_unit ?? defaultDecisionValues.price_per_unit,
          production_volume: decision.production_volume ?? defaultDecisionValues.production_volume,
          marketing_budget: decision.marketing_budget ?? defaultDecisionValues.marketing_budget,
          maintenance_budget: decision.maintenance_budget ?? defaultDecisionValues.maintenance_budget,
          loan_amount: decision.loan_amount ?? defaultDecisionValues.loan_amount,
          rd_investment: decision.rd_investment ?? defaultDecisionValues.rd_investment,
          qhse_investment: decision.qhse_investment ?? defaultDecisionValues.qhse_investment,
          hr_investment: decision.hr_investment ?? defaultDecisionValues.hr_investment,
          avg_salary: decision.avg_salary ?? defaultDecisionValues.avg_salary,
          ...buildDecisionBreakdownsFromTotals(decision),
        }
      : defaultDecisionValues;

    reset(hydratedValues);
    hydratedRoundRef.current = hydrationKey;
  }, [currentRound, decision, isLoading, reset, teamId]);

  // Autosave
  const { lastSaved, isSaving } = useAutosaveForm(
    teamId || '',
    currentRound,
    formValues,
    isLocked,
    canEditAnyDecision
  );

  // Format saved time for badge
  const savedTimeDisplay = lastSaved ? formatTime(lastSaved) : null;

  // Handle machine purchase
  const [purchasingType, setPurchasingType] = React.useState<MachineType | null>(null);

  const handlePurchaseMachine = async (type: MachineType) => {
    setPurchasingType(type);
    try {
      await buyMachine.mutateAsync({ machine_type: type, quantity: 1 });
    } finally {
      setPurchasingType(null);
    }
  };

  // Handle decision submission
  const handleSubmit = () => {
    if (!canSubmitDecision || (orgChartRequired && !orgChartComplete)) {
      return;
    }
    submitDecision.mutate(
      extractDecisionPayload({
        ...formValues,
        round_number: currentRound,
      }) as never
    );
  };

  // Calculate estimated cost per unit for marketing tab
  const estimatedCostPerUnit = totalCapacity > 0 
    ? ((formValues.maintenance_budget || 0) + (teamDetail?.debt || 0) * interestRate) / totalCapacity
    : undefined;

  // Prepare machine data for production tab
  const teamMachines = teamDetail?.machines?.map((m) => ({
    machine_type: m.machine_type,
    quantity: m.quantity,
    is_active: m.is_active,
    purchase_round: m.purchase_round,
  })) || [];

  // Loading state
  if (isTeamLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-96" />
          </div>
          <div>
            <Skeleton className="h-64" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertDescription>
            Une erreur est survenue lors du chargement des données.
            Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No team assigned
  if (!team) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            Vous n'êtes pas encore assigné à une équipe. Veuillez contacter votre enseignant.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Décisions — Tour {currentRound}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configurez vos décisions stratégiques pour ce tour
          </p>
        </div>

        {/* Status Badge */}
        {isLocked ? (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <Lock className="h-3 w-3 mr-1" />
            Décisions verrouillées 🔒
          </Badge>
        ) : savedTimeDisplay ? (
          <Badge variant="outline" className="text-gray-500">
            <Save className="h-3 w-3 mr-1" />
            Brouillon sauvegardé à {savedTimeDisplay}
          </Badge>
        ) : isSaving ? (
          <Badge variant="outline" className="text-blue-500">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Sauvegarde...
          </Badge>
        ) : null}
      </div>

      {/* Locked Banner */}
      {isLocked && (
        <Alert className="bg-red-50 border-red-200">
          <Lock className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Vos décisions pour le tour {currentRound} ont été verrouillées.
            Vous ne pouvez plus les modifier. Les résultats seront disponibles
            une fois la simulation terminée.
          </AlertDescription>
        </Alert>
      )}

      {orgChartEnabled && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-900">
            {isDirector
              ? "Vous êtes DG. Vous pouvez coordonner les décisions, acheter des machines et faire la soumission finale."
              : `Vos droits de modification sont limités à : ${
                  [
                    canEditProduction ? 'production' : null,
                    canEditFinance ? 'finance' : null,
                    canEditMarketing ? 'marketing' : null,
                    canEditQuality ? 'qualité & RH' : null,
                  ]
                    .filter(Boolean)
                    .join(', ') || 'aucun périmètre'
                }.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${
          isLocked ? 'pointer-events-none opacity-70' : ''
        }`}
      >
        {/* Tabs Area */}
        <div className="lg:col-span-2">
          <FormProvider {...formMethods}>
            <DecisionsTabs disabled={isLocked}>
              <ProductionTab
                teamCash={teamDetail?.cash ?? 0}
                teamMachines={teamMachines}
                onPurchaseMachine={handlePurchaseMachine}
                purchasingType={purchasingType}
                editingDisabled={isLocked || !canEditProduction}
                purchaseDisabled={isLocked || !canBuyMachine}
              />
              <FinanceTab
                teamDebt={teamDetail?.debt ?? 0}
                interestRate={interestRate}
                disabled={isLocked || !canEditFinance}
              />
              <MarketingTab
                averageMarketPrice={marketReport?.average_price}
                estimatedCostPerUnit={estimatedCostPerUnit}
                disabled={isLocked || !canEditMarketing}
              />
              <QualityTab
                currentQhseScore={teamDetail?.machines?.[0]?.id ? 50 : undefined}
                cumulativeRdInvestment={0}
                disabled={isLocked || !canEditQuality}
              />
            </DecisionsTabs>
          </FormProvider>
        </div>

        {/* Summary Panel */}
        <div className="lg:col-span-1">
          <FormProvider {...formMethods}>
            <DecisionSummary
              teamCash={teamDetail?.cash ?? 0}
              currentRound={currentRound}
              isLocked={isLocked}
              canSubmit={canSubmitDecision && !(orgChartRequired && !orgChartComplete)}
              submitBlockedReason={submitBlockedReason}
              isSubmitting={submitDecision.isPending}
              lastSaved={lastSaved}
              onSubmit={handleSubmit}
            />
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
