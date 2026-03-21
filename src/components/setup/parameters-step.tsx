// ============================================================
// MarketSim Pro - Parameters Step Component (Step 2)
// ============================================================

'use client';

import * as React from 'react';
import { useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Info, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  useSessionSetup,
  useUpdateSetup,
} from '@/lib/hooks/use-session-setup';
import { useSession } from '@/lib/hooks/use-sessions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const parametersSchema = z.object({
  starting_cash: z.number().min(0, 'Le montant doit être positif'),
  interest_rate: z.number().min(0).max(1, 'Le taux doit être entre 0 et 1'),
  energy_price: z.number().min(0, 'Le prix doit être positif'),
  base_market_demand: z.number().min(0, 'La demande doit être positive'),
});

type ParametersFormData = z.infer<typeof parametersSchema>;

// ------------------------------------------------------------
// Parameter Field Component
// ------------------------------------------------------------

type ParameterFieldId = keyof ParametersFormData;

interface ParameterFieldProps {
  id: ParameterFieldId;
  label: string;
  unit: string;
  tooltip: string;
  register: UseFormRegister<ParametersFormData>;
  error?: { message?: string };
  disabled?: boolean;
  formatValue?: (value: number) => string;
}

function ParameterField({
  id,
  label,
  unit,
  tooltip,
  register,
  error,
  disabled,
}: ParameterFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-gray-400 hover:text-gray-600">
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="relative">
        <Input
          id={id}
          type="number"
          step="any"
          className={cn('pr-16 text-right tabular-nums', error && 'border-red-500')}
          disabled={disabled}
          {...register(id, { valueAsNumber: true })}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          {unit}
        </span>
      </div>
      {error && <p className="text-xs text-red-600">{error.message}</p>}
    </div>
  );
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface ParametersStepProps {
  sessionId: string;
  onNext: () => void;
  onPrevious: () => void;
}

export function ParametersStep({
  sessionId,
  onNext,
  onPrevious,
}: ParametersStepProps) {
  const { data: setup, isLoading } = useSessionSetup(sessionId);
  const { data: session } = useSession(sessionId);
  const updateSetup = useUpdateSetup(sessionId);
  const isLocked = !!session && session.status !== 'draft';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ParametersFormData>({
    resolver: zodResolver(parametersSchema),
    values: {
      starting_cash: setup?.advanced?.starting_cash ?? 500000,
      interest_rate: setup?.advanced?.interest_rate ?? 0.05,
      energy_price: setup?.advanced?.energy_price ?? 0.1,
      base_market_demand: setup?.advanced?.base_market_demand ?? 1000,
    },
  });

  // Handle form submission
  const onSubmit = async (data: ParametersFormData) => {
    if (isLocked) return;
    await updateSetup.mutateAsync({
      advanced: data,
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-11 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Paramètres avancés
        </h2>
        <p className="text-sm text-gray-500">
          Configurez les paramètres économiques de la simulation
        </p>
      </div>

      {isLocked && (
        <Alert>
          <AlertDescription>
            La session est démarrée. Les paramètres ne peuvent plus être modifiés.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Starting Cash */}
          <ParameterField
            id="starting_cash"
            label="Capital de départ"
            unit="€"
            tooltip="Montant initial disponible pour chaque équipe au début de la simulation. Un capital plus élevé permet des investissements initiaux plus importants."
            register={register}
            error={errors.starting_cash}
            disabled={isSubmitting || isLocked}
          />

          {/* Interest Rate */}
          <ParameterField
            id="interest_rate"
            label="Taux d'intérêt"
            unit="%"
            tooltip="Taux annuel appliqué aux emprunts. Un taux élevé pénalise les équipes endettées mais encourage la gestion prudente de la trésorerie."
            register={register}
            error={errors.interest_rate}
            disabled={isSubmitting || isLocked}
          />

          {/* Energy Price */}
          <ParameterField
            id="energy_price"
            label="Prix de l'énergie"
            unit="€/unité"
            tooltip="Coût unitaire de l'énergie consommée par les machines. Impacte directement les coûts de production et la rentabilité."
            register={register}
            error={errors.energy_price}
            disabled={isSubmitting || isLocked}
          />

          {/* Base Market Demand */}
          <ParameterField
            id="base_market_demand"
            label="Demande de marché de base"
            unit="unités"
            tooltip="Demande initiale du marché pour le produit. Sert de base pour les calculs de ventes et peut évoluer avec les événements économiques."
            register={register}
            error={errors.base_market_demand}
            disabled={isSubmitting || isLocked}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="outline"
            className="gap-2"
            disabled={isSubmitting || !isDirty || isLocked}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder
          </Button>
        </div>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Conseil pédagogique</p>
            <p>
              Ces paramètres influencent directement les décisions stratégiques
              des équipes. Variez-les entre sessions pour explorer différents
              scénarios économiques.
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
        <Button onClick={onNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
          Suivant
          <span>→</span>
        </Button>
      </div>
    </div>
  );
}
