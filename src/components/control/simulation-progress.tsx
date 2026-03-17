// ============================================================
// MarketSim Pro - Simulation Progress Component
// ============================================================

'use client';

import * as React from 'react';
import { Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { SimulationProgress } from '@/lib/types';
import { formatCountdown } from '@/lib/utils';

// ------------------------------------------------------------
// Simulation Progress Banner
// ------------------------------------------------------------

interface SimulationProgressBannerProps {
  state: 'waiting' | 'running' | 'results';
  progress?: SimulationProgress | null;
  currentRound: number;
  onComplete?: () => void;
  className?: string;
}

export function SimulationProgressBanner({
  state,
  progress,
  currentRound,
  onComplete,
  className,
}: SimulationProgressBannerProps) {
  if (state === 'waiting') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border',
          'bg-amber-50 border-amber-200',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              En attente des décisions
            </p>
            <p className="text-xs text-amber-600">
              Tour {currentRound}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'running') {
    const progressPercent = progress?.progress_percent ?? 0;
    const message = progress?.state === 'running' ? 'Simulation en cours...' : 'Traitement...';

    return (
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border',
          'bg-blue-50 border-blue-200',
          className
        )}
      >
        <div className="flex items-center gap-3 flex-1">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800">{message}</p>
            <div className="flex items-center gap-3 mt-2">
              <Progress value={progressPercent} className="h-2 flex-1" />
              <span className="text-sm font-medium text-blue-700 tabular-nums">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'results') {
    return (
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border',
          'bg-green-50 border-green-200',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-800">
              Tour {currentRound} simulé ✓
            </p>
            <p className="text-xs text-green-600">
              Les résultats sont disponibles
            </p>
          </div>
        </div>
        {onComplete && (
          <button
            onClick={onComplete}
            className="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
          >
            Voir les résultats →
          </button>
        )}
      </div>
    );
  }

  return null;
}

// ------------------------------------------------------------
// Progress Indicator Component
// ------------------------------------------------------------

interface ProgressIndicatorProps {
  progress: SimulationProgress | null;
  className?: string;
}

export function ProgressIndicator({ progress, className }: ProgressIndicatorProps) {
  if (!progress) return null;

  const { progress_percent, countdown_seconds, current_round } = progress;

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-700">
          Tour {current_round}
        </span>
        {countdown_seconds !== undefined && countdown_seconds > 0 && (
          <span className="text-lg font-bold tabular-nums text-blue-600">
            {formatCountdown(countdown_seconds)}
          </span>
        )}
      </div>

      <Progress value={progress_percent ?? 0} className="h-2 mb-2" />

      <div className="flex justify-between text-xs text-gray-500">
        <span>Progression</span>
        <span className="tabular-nums">{Math.round(progress_percent ?? 0)}%</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Connection Status Indicator
// ------------------------------------------------------------

interface ConnectionStatusProps {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  className?: string;
}

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const statusConfig = {
    connecting: { color: 'text-amber-500', label: 'Connexion...' },
    connected: { color: 'text-green-500', label: 'Connecté' },
    disconnected: { color: 'text-gray-400', label: 'Déconnecté' },
    error: { color: 'text-red-500', label: 'Erreur' },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2 text-xs', className)}>
      <div
        className={cn(
          'w-2 h-2 rounded-full',
          status === 'connecting' && 'bg-amber-500 animate-pulse',
          status === 'connected' && 'bg-green-500',
          status === 'disconnected' && 'bg-gray-400',
          status === 'error' && 'bg-red-500'
        )}
      />
      <span className={config.color}>{config.label}</span>
    </div>
  );
}
