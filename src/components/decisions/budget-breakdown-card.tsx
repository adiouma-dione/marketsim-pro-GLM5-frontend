'use client';

import * as React from 'react';
import { Calculator, Info } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabHeader } from './decisions-tabs';
import { formatCurrency } from '@/lib/utils';
import type { DecisionFormData } from '@/lib/hooks/use-decisions';

interface BudgetBreakdownItem {
  key: string;
  label: string;
  unitCost: number;
  unitLabel: string;
  hint?: string;
}

interface BudgetBreakdownCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  totalField: keyof DecisionFormData;
  breakdownField: string;
  items: BudgetBreakdownItem[];
  maxTotal: number;
  disabled?: boolean;
  helperTitle?: string;
  helperLines?: string[];
}

export function BudgetBreakdownCard({
  title,
  description,
  icon,
  totalField,
  breakdownField,
  items,
  maxTotal,
  disabled = false,
  helperTitle,
  helperLines = [],
}: BudgetBreakdownCardProps) {
  const { register, watch, setValue, getValues } = useFormContext<DecisionFormData>();
  const initializedRef = React.useRef(false);

  const breakdown = (watch(breakdownField as never) as Record<string, number> | undefined) || {};
  const currentTotal = Number(watch(totalField) || 0);

  const computedTotal = React.useMemo(
    () =>
      items.reduce((sum, item) => {
        const quantity = Number(breakdown[item.key] || 0);
        return sum + quantity * item.unitCost;
      }, 0),
    [breakdown, items]
  );

  React.useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    const initialTotal = Number(getValues(totalField) || 0);
    const initialBreakdown =
      (getValues(breakdownField as never) as Record<string, number> | undefined) || {};
    const breakdownSum = items.reduce((sum, item) => {
      return sum + Number(initialBreakdown[item.key] || 0) * item.unitCost;
    }, 0);

    if (breakdownSum === 0 && initialTotal > 0) {
      const adjustmentItem = items[items.length - 1];
      setValue(`${breakdownField}.${adjustmentItem.key}` as never, initialTotal as never, {
        shouldDirty: false,
        shouldTouch: false,
      });
      setValue(totalField, initialTotal as never, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [breakdownField, getValues, items, setValue, totalField]);

  React.useEffect(() => {
    if (computedTotal !== currentTotal) {
      setValue(totalField, computedTotal as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [computedTotal, currentTotal, setValue, totalField]);

  const isOverBudget = computedTotal > maxTotal;

  return (
    <Card>
      <CardHeader className="pb-3">
        <TabHeader title={title} description={description} icon={icon} />
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Label className="text-xs uppercase tracking-wide text-blue-700">
                Total calculé
              </Label>
              <p className="mt-1 text-2xl font-bold text-blue-700">
                {formatCurrency(computedTotal)}
              </p>
            </div>
            <div className="text-right text-sm text-blue-700">
              <p>Plafond du moteur de simulation</p>
              <p className="font-semibold">{formatCurrency(maxTotal)}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-blue-700">
            Le montant envoyé au backend est la somme automatique des postes ci-dessous.
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const quantity = Number(breakdown[item.key] || 0);
            const subtotal = quantity * item.unitCost;

            return (
              <div
                key={item.key}
                className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-[minmax(0,1.8fr)_140px_140px_150px]"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.unitCost)} / {item.unitLabel}
                  </p>
                  {item.hint ? (
                    <p className="mt-1 text-xs text-gray-400">{item.hint}</p>
                  ) : null}
                </div>

                <div className="space-y-1">
                  <Label htmlFor={`${breakdownField}.${item.key}`} className="text-xs text-gray-500">
                    Quantité
                  </Label>
                  <Input
                    id={`${breakdownField}.${item.key}`}
                    type="number"
                    min={0}
                    step={1}
                    disabled={disabled}
                    {...register(`${breakdownField}.${item.key}` as never, {
                      valueAsNumber: true,
                      setValueAs: (value) => {
                        const parsed = Number(value);
                        return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
                      },
                    })}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Unité</Label>
                  <div className="flex h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                    {item.unitLabel}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Sous-total</Label>
                  <div className="flex h-10 items-center justify-end rounded-md border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-900">
                    {formatCurrency(subtotal)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className={`rounded-xl border p-4 ${
              isOverBudget
                ? 'border-red-200 bg-red-50'
                : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <Calculator
                className={`mt-0.5 h-4 w-4 flex-shrink-0 ${
                  isOverBudget ? 'text-red-600' : 'text-emerald-600'
                }`}
              />
              <div className="text-sm">
                <p className={`font-medium ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
                  {isOverBudget ? 'Total au-dessus du plafond autorisé' : 'Total prêt pour simulation'}
                </p>
                <p className={isOverBudget ? 'text-red-600' : 'text-emerald-600'}>
                  {isOverBudget
                    ? `Réduisez ce budget de ${formatCurrency(computedTotal - maxTotal)} pour rester valide.`
                    : `Ce poste comptera pour ${formatCurrency(computedTotal)} dans vos décisions.`}
                </p>
              </div>
            </div>
          </div>

          {helperLines.length > 0 ? (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium text-gray-900">{helperTitle || 'Repères'}</p>
                  <ul className="mt-2 space-y-1 text-xs text-gray-600">
                    {helperLines.map((line) => (
                      <li key={line}>• {line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
