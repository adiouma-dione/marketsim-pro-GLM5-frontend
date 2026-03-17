// ============================================================
// MarketSim Pro - Launch Step Component (Step 3)
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Play, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useSessionSetup,
  useStartSession,
} from '@/lib/hooks/use-session-setup';
import { useSession } from '@/lib/hooks/use-sessions';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';

// ------------------------------------------------------------
// Summary Item Component
// ------------------------------------------------------------

interface SummaryItemProps {
  label: string;
  value: string | number;
  className?: string;
}

function SummaryItem({ label, value, className }: SummaryItemProps) {
  return (
    <div className={className}>
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface LaunchStepProps {
  sessionId: string;
  onPrevious: () => void;
}

export function LaunchStep({ sessionId, onPrevious }: LaunchStepProps) {
  const router = useRouter();
  const { data: setup, isLoading: setupLoading } = useSessionSetup(sessionId);
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const startSession = useStartSession(sessionId);

  const isLoading = setupLoading || sessionLoading;
  const isLocked = !!session && session.status !== 'draft';

  // Check if can start
  const teamCount = setup?.teams?.length || 0;
  const canStart = teamCount >= 1;

  // Handle session start
  const handleStart = async () => {
    if (isLocked) return;
    try {
      await startSession.mutateAsync();
      router.push(ROUTES.TEACHER_MONITOR(sessionId));
    } catch {
      // Error handled by mutation
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Récapitulatif et lancement
        </h2>
      <p className="text-sm text-gray-500">
        Vérifiez les paramètres avant de démarrer la session
      </p>
    </div>

      {isLocked && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Session déjà démarrée</AlertTitle>
          <AlertDescription>
            La configuration est verrouillée. Vous pouvez piloter la session depuis la
            console.
          </AlertDescription>
        </Alert>
      )}

      {/* Warning if not enough teams */}
      {!canStart && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Attention</AlertTitle>
          <AlertDescription>
            Créez au moins 1 équipe pour démarrer la session.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Récapitulatif de la session</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Session Name */}
            <SummaryItem
              label="Nom de la session"
              value={session?.name || '—'}
              className="col-span-2"
            />

            {/* Team Count */}
            <SummaryItem
              label="Nombre d'équipes"
              value={teamCount}
            />

            {/* Round Count */}
            <SummaryItem
              label="Nombre de tours"
              value={session?.max_rounds || '—'}
            />

            {/* Starting Cash */}
            <SummaryItem
              label="Capital de départ"
              value={
                setup?.advanced?.starting_cash
                  ? formatCurrency(setup.advanced.starting_cash)
                  : '—'
              }
            />

            {/* Interest Rate */}
            <SummaryItem
              label="Taux d'intérêt"
              value={
                setup?.advanced?.interest_rate
                  ? formatPercentage(setup.advanced.interest_rate)
                  : '—'
              }
            />

            {/* Energy Price */}
            <SummaryItem
              label="Prix de l'énergie"
              value={
                setup?.advanced?.energy_price
                  ? `${setup.advanced.energy_price} €/unité`
                  : '—'
              }
            />

            {/* Base Market Demand */}
            <SummaryItem
              label="Demande de marché"
              value={
                setup?.advanced?.base_market_demand
                  ? `${setup.advanced.base_market_demand} unités`
                  : '—'
              }
            />
          </dl>
        </CardContent>
      </Card>

      {/* Teams Summary */}
      {setup?.teams && setup.teams.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Équipes configurées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {setup.teams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: team.color_hex }}
                  />
                  <span className="text-sm text-gray-700 truncate">
                    {team.name}
                  </span>
                  <CheckCircle className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Important</p>
            <p className="italic">
              Une fois démarrée, les paramètres économiques ne pourront plus être
              modifiés. Assurez-vous que la configuration est correcte.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onPrevious} className="gap-2">
          <span>←</span>
          Précédent
        </Button>
        <Button
          onClick={handleStart}
          disabled={!canStart || startSession.isPending || isLocked}
          className="gap-2 bg-green-600 hover:bg-green-700"
        >
          {startSession.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Démarrer la session
        </Button>
      </div>
    </div>
  );
}
