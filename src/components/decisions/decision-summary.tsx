// ============================================================
// MarketSim Pro - Decision Summary Panel Component
// ============================================================

'use client';

import * as React from 'react';
import { Check, AlertTriangle, Calculator, Clock } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { decisionSchema, type DecisionFormData } from '@/lib/hooks/use-decisions';
import type { DecisionResponse } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface DecisionSummaryProps {
  teamCash: number;
  currentRound: number;
  isLocked: boolean;
  isSubmitting: boolean;
  lastSaved?: string;
  onSubmit: () => void;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function DecisionSummary({
  teamCash,
  currentRound,
  isLocked,
  isSubmitting,
  lastSaved,
  onSubmit,
}: DecisionSummaryProps) {
  const {
    watch,
    formState: { isValid },
  } = useFormContext<DecisionFormData>();

  const formValues = watch();

  // Calculate estimated end-of-round cash
  const estimatedEndCash = React.useMemo(() => {
    const expenses =
      (formValues.marketing_budget || 0) +
      (formValues.maintenance_budget || 0) +
      (formValues.rd_investment || 0) +
      (formValues.qhse_investment || 0) +
      (formValues.hr_investment || 0);

    const income = formValues.loan_amount || 0;

    return teamCash + income - expenses;
  }, [formValues, teamCash]);

  // Check if estimated cash is negative
  const isCashNegative = estimatedEndCash < 0;

  // Calculate total investments
  const totalInvestments = React.useMemo(() => {
    return (
      (formValues.marketing_budget || 0) +
      (formValues.maintenance_budget || 0) +
      (formValues.rd_investment || 0) +
      (formValues.qhse_investment || 0) +
      (formValues.hr_investment || 0)
    );
  }, [formValues]);

  // Format last saved time
  const formattedLastSaved = React.useMemo(() => {
    if (!lastSaved) return null;
    try {
      const date = new Date(lastSaved);
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [lastSaved]);

  return (
    <div className="sticky top-4">
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Résumé des décisions</CardTitle>
            {formattedLastSaved && !isLocked && (
              <Badge variant="outline" className="text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                Sauvegardé à {formattedLastSaved}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Decision Values */}
          <div className="space-y-2 text-sm">
            <SummaryRow label="Prix unitaire" value={formatCurrency(formValues.price_per_unit || 0)} />
            <SummaryRow label="Volume production" value={`${formValues.production_volume || 0} u`} />
            <SummaryRow label="Budget marketing" value={formatCurrency(formValues.marketing_budget || 0)} />
            <SummaryRow label="Budget maintenance" value={formatCurrency(formValues.maintenance_budget || 0)} />
            <SummaryRow label="Emprunt" value={formatCurrency(formValues.loan_amount || 0)} isPositive />
            <SummaryRow label="Budget QHSE" value={formatCurrency(formValues.qhse_investment || 0)} />
            <SummaryRow label="Budget RH" value={formatCurrency(formValues.hr_investment || 0)} />
            <SummaryRow label="Investissement R&D" value={formatCurrency(formValues.rd_investment || 0)} />
            <SummaryRow label="Salaire moyen" value={formatCurrency(formValues.avg_salary || 0)} />
          </div>

          <Separator />

          {/* Financial Summary */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calculator className="h-4 w-4" />
              Estimation trésorerie
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Trésorerie actuelle</p>
                <p className="font-semibold">{formatCurrency(teamCash)}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-500">Total investissements</p>
                <p className="font-semibold">{formatCurrency(totalInvestments)}</p>
              </div>
            </div>

            <div
              className={`rounded p-3 ${
                isCashNegative ? 'bg-red-50' : 'bg-green-50'
              }`}
            >
              <p className={`text-xs ${isCashNegative ? 'text-red-600' : 'text-green-600'}`}>
                Trésorerie estimée fin de tour
              </p>
              <p
                className={`text-lg font-bold ${
                  isCashNegative ? 'text-red-700' : 'text-green-700'
                }`}
              >
                {formatCurrency(estimatedEndCash)}
              </p>
              {isCashNegative && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Trésorerie négative !
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {isLocked ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium flex items-center gap-2">
                🔒 Décisions verrouillées
              </p>
              <p className="text-xs text-red-600 mt-1">
                Vous ne pouvez plus modifier vos décisions pour ce tour.
              </p>
            </div>
          ) : (
            <ConfirmSubmitDialog
              isValid={isValid}
              isSubmitting={isSubmitting}
              isCashNegative={isCashNegative}
              onSubmit={onSubmit}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------
// Summary Row Helper
// ------------------------------------------------------------

function SummaryRow({
  label,
  value,
  isPositive = false,
}: {
  label: string;
  value: string;
  isPositive?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium ${
          isPositive ? 'text-green-600' : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ------------------------------------------------------------
// Confirm Submit Dialog
// ------------------------------------------------------------

function ConfirmSubmitDialog({
  isValid,
  isSubmitting,
  isCashNegative,
  onSubmit,
}: {
  isValid: boolean;
  isSubmitting: boolean;
  isCashNegative: boolean;
  onSubmit: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = () => {
    onSubmit();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!isValid || isSubmitting}
        >
          <Check className="h-4 w-4 mr-2" />
          Soumettre les décisions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmer la soumission</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir soumettre vos décisions pour ce tour ?
            Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>

        {isCashNegative && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Attention : votre trésorerie estimée est négative
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>Soumission...</>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirmer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
