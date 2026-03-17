// ============================================================
// MarketSim Pro - Context Banner Component
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { GameSessionStatus } from '@/lib/types';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface ContextBannerProps {
  decisionsSubmitted: boolean;
  sessionStatus: GameSessionStatus;
  currentRound: number;
  maxRounds: number;
  isSimulating?: boolean;
  simulationProgress?: number;
  countdownSeconds?: number;
}

// ------------------------------------------------------------
// Simulation Progress Component
// ------------------------------------------------------------

function MiniSimulationProgress({ progress }: { progress: number }) {
  return (
    <div className="mt-2 space-y-1">
      <Progress value={progress} className="h-1.5" />
      <p className="text-xs text-amber-600">{progress}% complété</p>
    </div>
  );
}

// ------------------------------------------------------------
// Countdown Timer
// ------------------------------------------------------------

function CountdownTimer({ seconds }: { seconds: number }) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-1 text-amber-700">
      <Clock className="h-4 w-4" />
      <span className="font-medium tabular-nums">
        {mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Context Banner Component
// ------------------------------------------------------------

export function ContextBanner({
  decisionsSubmitted,
  sessionStatus,
  currentRound,
  maxRounds,
  isSimulating = false,
  simulationProgress = 0,
  countdownSeconds,
}: ContextBannerProps) {
  const router = useRouter();

  // Don't show banner if session is not active
  if (sessionStatus !== 'active') {
    return null;
  }

  // State: Simulation in progress
  if (isSimulating) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Loader2 className="h-5 w-5 text-amber-600 animate-spin" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-amber-900">Simulation en cours...</h3>
            <p className="text-sm text-amber-700">
              Tour {currentRound} sur {maxRounds}
            </p>
            {simulationProgress > 0 && (
              <MiniSimulationProgress progress={simulationProgress} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // State: Results available
  if (decisionsSubmitted && currentRound > 1) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-green-900">
                Résultats du tour {currentRound - 1} disponibles !
              </h3>
              <p className="text-sm text-green-700">
                Consultez vos performances et préparez vos prochaines décisions.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-white border-green-300 text-green-700 hover:bg-green-50"
            onClick={() => router.push(`${ROUTES.STUDENT_RESULTS}/${currentRound - 1}`)}
          >
            Voir les résultats
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // State: Decisions not submitted (Round open)
  if (!decisionsSubmitted) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">
                Tour {currentRound} ouvert
              </h3>
              <p className="text-sm text-blue-700">
                Soumettez vos décisions avant la simulation.
              </p>
            </div>
            {countdownSeconds !== undefined && countdownSeconds > 0 && (
              <CountdownTimer seconds={countdownSeconds} />
            )}
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push(ROUTES.STUDENT_DECISIONS)}
          >
            Soumettre mes décisions
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // State: Decisions submitted, waiting for simulation
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-gray-500" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            Décisions soumises pour le tour {currentRound}
          </h3>
          <p className="text-sm text-gray-600">
            En attente de la simulation...
          </p>
        </div>
        {countdownSeconds !== undefined && countdownSeconds > 0 && (
          <CountdownTimer seconds={countdownSeconds} />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Skeleton Version
// ------------------------------------------------------------

export function ContextBannerSkeleton() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gray-200 rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-56 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
