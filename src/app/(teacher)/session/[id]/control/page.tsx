// ============================================================
// MarketSim Pro - Control Page (Professor Console)
// ============================================================

'use client';

import * as React from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Play, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MonitorTable, IncidentLog } from '@/components/control/monitor-table';
import {
  SimulationProgressBanner,
  ConnectionStatus,
} from '@/components/control/simulation-progress';
import { InjectEventPanel } from '@/components/control/inject-event-panel';
import { useControlMonitor, useDecisionStatus, useSimulateRound, useForceSubmit } from '@/lib/hooks/use-control-monitor';
import { useSimulationSSE } from '@/lib/hooks/use-simulation-sse';
import { useSession } from '@/lib/hooks/use-sessions';
import { ROUTES } from '@/lib/constants';
import { toast } from 'sonner';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

interface ControlPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ControlPage({ params }: ControlPageProps) {
  const { id: sessionId } = use(params);
  const router = useRouter();

  // State
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [simulationComplete, setSimulationComplete] = React.useState(false);
  const [taskId, setTaskId] = React.useState<string | null>(null);

  // Queries
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: monitor, isLoading: monitorLoading } = useControlMonitor(sessionId);
  const { data: decisionStatus } = useDecisionStatus(sessionId);

  // Mutations
  const simulateRound = useSimulateRound(sessionId);
  const forceSubmit = useForceSubmit(sessionId);

  // SSE Hook
  const {
    progress: sseProgress,
    isRunning: sseRunning,
    connectionStatus,
  } = useSimulationSSE({
    sessionId,
    enabled: isSimulating,
    onComplete: () => {
      setIsSimulating(false);
      setSimulationComplete(true);
    },
    onError: (message) => {
      setIsSimulating(false);
      toast.error(message);
    },
  });

  // Derived state
  const currentRound = session?.current_round ?? 1;
  const maxRounds = session?.max_rounds ?? 12;
  const allSubmitted = monitor?.all_submitted ?? false;
  const teams = monitor?.rows ?? [];
  const incidents = monitor?.incident_log ?? [];

  // Determine banner state
  const bannerState: 'waiting' | 'running' | 'results' =
    isSimulating || sseRunning ? 'running' : simulationComplete ? 'results' : 'waiting';

  // Handlers
  const handleStartSimulation = async () => {
    try {
      setIsSimulating(true);
      setSimulationComplete(false);
      const result = await simulateRound.mutateAsync();
      setTaskId(result.task_id);
    } catch {
      setIsSimulating(false);
    }
  };

  const handleForceSubmit = async () => {
    await forceSubmit.mutateAsync();
    // After force submit, start simulation
    handleStartSimulation();
  };

  const handleViewResults = () => {
    router.push(`${ROUTES.TEACHER_SESSION(sessionId)}/results`);
  };

  // Loading state
  if (sessionLoading || monitorLoading) {
    return (
      <div className="space-y-6">
        <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-80 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Console de pilotage
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {session?.name} — Tour {currentRound}/{maxRounds}
          </p>
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Status Banner */}
      <SimulationProgressBanner
        state={bannerState}
        progress={sseProgress}
        currentRound={currentRound}
        onComplete={handleViewResults}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Monitor Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warning if not all submitted */}
          {!allSubmitted && !isSimulating && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>En attente des décisions</AlertTitle>
              <AlertDescription>
                {decisionStatus?.submitted_teams ?? 0}/{decisionStatus?.total_teams ?? 0} équipes
                ont soumis leurs décisions pour ce tour.
              </AlertDescription>
            </Alert>
          )}

          {/* Monitor Table */}
          <MonitorTable
            rows={teams}
            currentRound={currentRound}
          />

          {/* Incident Log */}
          {incidents.length > 0 && (
            <IncidentLog incidents={incidents} />
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Start Simulation Button */}
            <Button
              size="lg"
              className={cn(
                'w-full gap-2',
                allSubmitted
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
              )}
              onClick={handleStartSimulation}
              disabled={!allSubmitted || isSimulating}
            >
              {isSimulating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Simulation en cours...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Lancer la simulation
                </>
              )}
            </Button>

            {/* Force Submit Link */}
            {!allSubmitted && !isSimulating && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    Forcer le lancement →
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Forcer la soumission</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cela va soumettre automatiquement les décisions par défaut
                      pour les équipes qui n'ont pas encore répondu, puis lancer
                      la simulation. Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={handleForceSubmit}
                    >
                      Forcer et lancer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* View Results Button */}
            {simulationComplete && (
              <Button
                size="lg"
                variant="outline"
                className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50"
                onClick={handleViewResults}
              >
                Voir les résultats
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Right Column - Actions Panel */}
        <div className="lg:col-span-1">
          <InjectEventPanel
            sessionId={sessionId}
            currentRound={currentRound}
            maxRounds={maxRounds}
          />
        </div>
      </div>
    </div>
  );
}
