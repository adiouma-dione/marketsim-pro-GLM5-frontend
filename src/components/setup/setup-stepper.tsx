// ============================================================
// MarketSim Pro - Setup Stepper Component
// ============================================================

'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface Step {
  id: number;
  label: string;
  description: string;
}

interface SetupStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function SetupStepper({
  steps,
  currentStep,
  onStepClick,
  className,
}: SetupStepperProps) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isUpcoming = step.id > currentStep;

          return (
            <li
              key={step.id}
              className={cn(
                'relative',
                index !== steps.length - 1 && 'flex-1'
              )}
            >
              <div className="flex items-center">
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  disabled={step.id > currentStep}
                  className={cn(
                    'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                    isCompleted && 'border-green-500 bg-green-500',
                    isCurrent && 'border-blue-600 bg-blue-600',
                    isUpcoming && 'border-gray-300 bg-white cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5 text-white" />
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        isCurrent && 'text-white',
                        isUpcoming && 'text-gray-400'
                      )}
                    >
                      {step.id}
                    </span>
                  )}
                </button>

                {/* Step Label (Desktop) */}
                <div className="ml-4 hidden md:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isCompleted && 'text-green-600',
                      isCurrent && 'text-blue-600',
                      isUpcoming && 'text-gray-400'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>

                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div
                    className={cn(
                      'ml-4 mr-4 h-0.5 flex-1 transition-colors',
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ------------------------------------------------------------
// Compact Stepper for Mobile
// ------------------------------------------------------------

interface CompactStepperProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function CompactStepper({
  currentStep,
  totalSteps,
  className,
}: CompactStepperProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <div
            key={step}
            className={cn(
              'flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors',
              isCompleted && 'bg-green-500 text-white',
              isCurrent && 'bg-blue-600 text-white',
              !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
            )}
          >
            {isCompleted ? <Check className="h-4 w-4" /> : step}
          </div>
        );
      })}
    </div>
  );
}
