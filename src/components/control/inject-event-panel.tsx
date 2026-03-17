// ============================================================
// MarketSim Pro - Inject Event Panel Component
// ============================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Shield,
  Pause,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { Separator } from '@/components/ui/separator';
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
import { EVENT_LABELS } from '@/lib/constants';
import {
  useInjectEvent,
  useSurpriseAudit,
  usePauseSession,
  useReplayRound,
} from '@/lib/hooks/use-control-monitor';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const injectEventSchema = z.object({
  event_type: z.string().min(1, 'Sélectionnez un événement'),
  severity: z.number().min(1).max(3),
  description: z.string().optional(),
  round_number: z.number().optional(),
});

type InjectEventFormData = z.infer<typeof injectEventSchema>;

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface InjectEventPanelProps {
  sessionId: string;
  currentRound: number;
  maxRounds: number;
  className?: string;
}

export function InjectEventPanel({
  sessionId,
  currentRound,
  maxRounds,
  className,
}: InjectEventPanelProps) {
  const injectEvent = useInjectEvent(sessionId);
  const surpriseAudit = useSurpriseAudit(sessionId);
  const pauseSession = usePauseSession(sessionId);
  const replayRound = useReplayRound(sessionId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InjectEventFormData>({
    resolver: zodResolver(injectEventSchema),
    defaultValues: {
      event_type: '',
      severity: 1,
      description: '',
    },
  });

  const selectedEventType = watch('event_type');
  const selectedSeverity = watch('severity');

  const onSubmit = async (data: InjectEventFormData) => {
    await injectEvent.mutateAsync({
      event_type: data.event_type,
      severity: data.severity,
      description: data.description || undefined,
      round_number: data.round_number || undefined,
    });
    reset();
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm p-4', className)}>
      <h3 className="text-base font-semibold text-gray-900 mb-4">Actions</h3>

      {/* Inject Event Section */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Injecter un événement
          </h4>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Event Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Type d'événement</Label>
              <Select
                value={selectedEventType}
                onValueChange={(value) => setValue('event_type', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Sélectionner..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_LABELS).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.event_type && (
                <p className="text-xs text-red-600">{errors.event_type.message}</p>
              )}
            </div>

            {/* Severity */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">Sévérité</Label>
              <Select
                value={selectedSeverity?.toString()}
                onValueChange={(value) => setValue('severity', parseInt(value))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Mineur</SelectItem>
                  <SelectItem value="2">2 - Modéré</SelectItem>
                  <SelectItem value="3">3 - Majeur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description (optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Description <span className="text-gray-400">(optionnel)</span>
              </Label>
              <Input
                placeholder="Description de l'événement..."
                className="h-9"
                {...register('description')}
                disabled={isSubmitting}
              />
            </div>

            {/* Round Number (optional) */}
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600">
                Tour concerné <span className="text-gray-400">(optionnel)</span>
              </Label>
              <Input
                type="number"
                min={1}
                max={maxRounds}
                placeholder={`Tour actuel: ${currentRound}`}
                className="h-9"
                {...register('round_number', { valueAsNumber: true })}
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 h-9"
              disabled={isSubmitting || !selectedEventType}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Injecter'
              )}
            </Button>
          </form>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Actions rapides</h4>

          {/* Surprise Audit */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 h-9"
            onClick={() => surpriseAudit.mutate()}
            disabled={surpriseAudit.isPending}
          >
            <Shield className="h-4 w-4" />
            {surpriseAudit.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Audit QHSE surprise'
            )}
          </Button>

          {/* Pause Session */}
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start gap-2 h-9"
            onClick={() => pauseSession.mutate()}
            disabled={pauseSession.isPending}
          >
            <Pause className="h-4 w-4" />
            {pauseSession.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Mettre en pause'
            )}
          </Button>

          {/* Replay Round */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={replayRound.isPending}
              >
                <RefreshCw className="h-4 w-4" />
                Rejouer ce tour
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirmer le replay
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action va annuler les résultats du tour {currentRound} et
                  permettre aux équipes de soumettre à nouveau leurs décisions.
                  Cette action est irréversible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => replayRound.mutate()}
                >
                  Confirmer le replay
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Info */}
        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
          <Info className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500">
            Les événements injectés affectent le marché et peuvent modifier les
            résultats de simulation.
          </p>
        </div>
      </div>
    </div>
  );
}
