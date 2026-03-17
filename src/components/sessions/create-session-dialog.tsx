// ============================================================
// MarketSim Pro - Create Session Dialog
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCreateSession } from '@/lib/hooks/use-sessions';
import { DEFAULT_SESSION_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const createSessionSchema = z.object({
  name: z
    .string()
    .min(1, 'Le nom est requis')
    .min(3, 'Le nom doit contenir au moins 3 caractères'),
  max_rounds: z
    .number()
    .min(1, 'Minimum 1 tour')
    .max(20, 'Maximum 20 tours'),
  round_duration_minutes: z
    .number()
    .min(15, 'Minimum 15 minutes')
    .max(120, 'Maximum 120 minutes'),
  config: z.object({
    starting_cash: z.number().min(0, 'Le capital doit être positif'),
    interest_rate: z.number().min(0).max(1, 'Le taux doit être entre 0 et 1'),
    tax_rate: z.number().min(0).max(1, 'Le taux doit être entre 0 et 1'),
    depreciation_rate: z.number().min(0).max(1, 'Le taux doit être entre 0 et 1'),
    market_growth_rate: z.number().min(-1).max(1, 'Le taux doit être entre -1 et 1'),
  }),
});

type CreateSessionFormData = z.infer<typeof createSessionSchema>;

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface CreateSessionDialogProps {
  trigger?: React.ReactNode;
  onSuccess?: (sessionId: string) => void;
}

export function CreateSessionDialog({
  trigger,
  onSuccess,
}: CreateSessionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const createSession = useCreateSession();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      name: '',
      max_rounds: 12,
      round_duration_minutes: 30,
      config: {
        starting_cash: DEFAULT_SESSION_CONFIG.starting_cash,
        interest_rate: DEFAULT_SESSION_CONFIG.interest_rate,
        tax_rate: DEFAULT_SESSION_CONFIG.tax_rate,
        depreciation_rate: DEFAULT_SESSION_CONFIG.depreciation_rate,
        market_growth_rate: DEFAULT_SESSION_CONFIG.market_growth_rate,
      },
    },
  });

  // Watch values for display
  const maxRounds = watch('max_rounds');
  const roundDuration = watch('round_duration_minutes');
  const config = watch('config');

  // Reset form when dialog closes
  React.useEffect(() => {
    if (!open) {
      reset();
      setShowAdvanced(false);
    }
  }, [open, reset]);

  const onSubmit = async (data: CreateSessionFormData) => {
    try {
      const session = await createSession.mutateAsync(data);
      setOpen(false);
      onSuccess?.(session.id);
      router.push(`/teacher/session/${session.id}/setup`);
    } catch {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <span>+</span>
            Créer une session
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle session</DialogTitle>
          <DialogDescription>
            Configurez votre simulation. Les paramètres économiques peuvent être
            ajustés ultérieurement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Session Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nom de la session <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Session Marketing 2024"
              className={cn(errors.name && 'border-red-500')}
              {...register('name')}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Number of Rounds */}
          <div className="space-y-2">
            <Label htmlFor="max_rounds" className="text-sm font-medium">
              Nombre de tours
            </Label>
            <Select
              value={maxRounds?.toString()}
              onValueChange={(value) => setValue('max_rounds', parseInt(value))}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {[6, 8, 10, 12, 14, 16].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} tours
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Round Duration */}
          <div className="space-y-2">
            <Label htmlFor="round_duration_minutes" className="text-sm font-medium">
              Durée d'un tour (minutes)
            </Label>
            <Input
              id="round_duration_minutes"
              type="number"
              min={15}
              max={120}
              className={cn(errors.round_duration_minutes && 'border-red-500')}
              {...register('round_duration_minutes', { valueAsNumber: true })}
              disabled={isSubmitting}
            />
            {errors.round_duration_minutes && (
              <p className="text-xs text-red-600">
                {errors.round_duration_minutes.message}
              </p>
            )}
          </div>

          {/* Advanced Settings Collapsible */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="w-full justify-between text-sm text-gray-500 hover:text-gray-700"
              >
                Paramètres économiques
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              {/* Starting Cash */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Capital de départ (€)
                </Label>
                <Input
                  type="number"
                  className="text-right"
                  {...register('config.starting_cash', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Interest Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Taux d'intérêt (décimal, ex: 0.05 = 5%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="text-right"
                  {...register('config.interest_rate', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Tax Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Taux de taxe (décimal)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="text-right"
                  {...register('config.tax_rate', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Depreciation Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Taux d'amortissement (décimal)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  className="text-right"
                  {...register('config.depreciation_rate', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>

              {/* Market Growth Rate */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">
                  Croissance du marché (décimal)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="-1"
                  max="1"
                  className="text-right"
                  {...register('config.market_growth_rate', { valueAsNumber: true })}
                  disabled={isSubmitting}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Footer */}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
