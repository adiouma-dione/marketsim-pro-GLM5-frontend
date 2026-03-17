// ============================================================
// MarketSim Pro - Progress Round Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface ProgressRoundProps {
  currentRound: number;
  maxRounds: number;
  label?: string;
  showProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ------------------------------------------------------------
// Size Configuration
// ------------------------------------------------------------

const sizeConfig = {
  sm: {
    container: 'gap-2',
    text: 'text-sm',
    badge: 'px-2 py-0.5 text-xs',
  },
  md: {
    container: 'gap-3',
    text: 'text-base',
    badge: 'px-2.5 py-1 text-sm',
  },
  lg: {
    container: 'gap-4',
    text: 'text-lg',
    badge: 'px-3 py-1.5 text-base',
  },
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function ProgressRound({
  currentRound,
  maxRounds,
  label,
  showProgress = true,
  size = 'md',
  className,
}: ProgressRoundProps) {
  const sizes = sizeConfig[size];
  const progress = (currentRound / maxRounds) * 100;

  return (
    <div className={cn('flex items-center', sizes.container, className)}>
      {label && (
        <span className={cn('text-gray-500', sizes.text)}>{label}</span>
      )}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'font-semibold tabular-nums bg-blue-100 text-blue-700 rounded-full',
            sizes.badge
          )}
        >
          Tour {currentRound}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-gray-500 tabular-nums">{maxRounds}</span>
      </div>
      {showProgress && (
        <div className="flex-1 min-w-[100px]">
          <Progress
            value={progress}
            className="h-2 bg-gray-100"
          />
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Circular Progress Component
// ------------------------------------------------------------

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 64,
  strokeWidth = 4,
  label,
  showValue = true,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (value / max) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-gray-900 tabular-nums">
            {value}
          </span>
        </div>
      )}
      {label && (
        <span className="absolute -bottom-6 text-xs text-gray-500">{label}</span>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Round Indicator Component (for game UI)
// ------------------------------------------------------------

export interface RoundIndicatorProps {
  currentRound: number;
  maxRounds: number;
  className?: string;
}

export function RoundIndicator({
  currentRound,
  maxRounds,
  className,
}: RoundIndicatorProps) {
  const rounds = Array.from({ length: maxRounds }, (_, i) => i + 1);

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {rounds.map((round) => (
        <div
          key={round}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
            round < currentRound && 'bg-green-100 text-green-700',
            round === currentRound && 'bg-blue-600 text-white',
            round > currentRound && 'bg-gray-100 text-gray-400'
          )}
        >
          {round}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Simulation Progress Component
// ------------------------------------------------------------

export interface SimulationProgressProps {
  state: 'running' | 'waiting' | 'results';
  progressPercent?: number;
  countdownSeconds?: number;
  currentRound: number;
  className?: string;
}

export function SimulationProgress({
  state,
  progressPercent = 0,
  countdownSeconds,
  currentRound,
  className,
}: SimulationProgressProps) {
  const stateConfig = {
    running: {
      label: 'Simulation en cours',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    waiting: {
      label: 'En attente des décisions',
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    results: {
      label: 'Résultats disponibles',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  };

  const config = stateConfig[state];

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-sm font-medium', config.color)}>
          {config.label}
        </span>
        <span className="text-sm text-gray-500">Tour {currentRound}</span>
      </div>

      {state === 'running' && (
        <>
          <Progress value={progressPercent} className="h-2 mb-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Progression</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </>
      )}

      {state === 'waiting' && countdownSeconds !== undefined && (
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-gray-900">
            {formatCountdown(countdownSeconds)}
          </div>
          <p className="text-xs text-gray-500 mt-1">Temps restant</p>
        </div>
      )}

      {state === 'results' && (
        <div className="flex items-center justify-center gap-2 text-green-600">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm font-medium">Consultez les résultats</span>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function formatCountdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
