// ============================================================
// MarketSim Pro - Session Setup Page
// ============================================================

'use client';

import * as React from 'react';
import { use } from 'react';
import { SetupStepper, type Step } from '@/components/setup/setup-stepper';
import { TeamsStep } from '@/components/setup/teams-step';
import { ParametersStep } from '@/components/setup/parameters-step';
import { LaunchStep } from '@/components/setup/launch-step';
import { Skeleton } from '@/components/ui/skeleton';

// ------------------------------------------------------------
// Step Definitions
// ------------------------------------------------------------

const STEPS: Step[] = [
  {
    id: 1,
    label: 'Équipes',
    description: 'Créer et configurer',
  },
  {
    id: 2,
    label: 'Paramètres',
    description: 'Avancés',
  },
  {
    id: 3,
    label: 'Lancement',
    description: 'Démarrer',
  },
];

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

interface SetupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function SetupPage({ params }: SetupPageProps) {
  const { id: sessionId } = use(params);
  const [currentStep, setCurrentStep] = React.useState(1);

  const goToNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Configuration de session
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configurez les équipes et les paramètres avant de lancer la simulation
        </p>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <SetupStepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        {currentStep === 1 && (
          <TeamsStep sessionId={sessionId} onNext={goToNextStep} />
        )}

        {currentStep === 2 && (
          <ParametersStep
            sessionId={sessionId}
            onNext={goToNextStep}
            onPrevious={goToPreviousStep}
          />
        )}

        {currentStep === 3 && (
          <LaunchStep sessionId={sessionId} onPrevious={goToPreviousStep} />
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Loading Skeleton
// ------------------------------------------------------------

function SetupPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
