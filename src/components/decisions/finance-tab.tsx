// ============================================================
// MarketSim Pro - Finance Tab Component
// ============================================================

'use client';

import * as React from 'react';
import { DollarSign, TrendingUp, Info } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpReveal } from './help-reveal';
import { TabHeader, DecisionTabContent } from './decisions-tabs';
import { formatCurrency } from '@/lib/utils';
import type { DecisionFormData } from '@/lib/hooks/use-decisions';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface FinanceTabProps {
  teamDebt: number;
  interestRate: number;
  disabled?: boolean;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function FinanceTab({
  teamDebt,
  interestRate,
  disabled = false,
}: FinanceTabProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<DecisionFormData>();

  const loanAmount = watch('loan_amount');

  // Calculate interest expense for current debt
  const currentInterestExpense = teamDebt * interestRate;

  // Calculate estimated interest for new loan
  const newLoanInterest = (loanAmount || 0) * interestRate;

  // Total debt after loan
  const totalDebtAfterLoan = teamDebt + (loanAmount || 0);

  return (
    <DecisionTabContent>
      {/* Current Debt Status */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Situation financière actuelle"
            description="État de votre dette et des intérêts"
            icon={DollarSign}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Dette actuelle</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(teamDebt)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Taux d'intérêt</p>
              <p className="text-2xl font-bold text-gray-900">
                {(interestRate * 100).toFixed(1)}%
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-600 mb-1">
                Intérêts ce tour
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {formatCurrency(currentInterestExpense)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Request */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Nouvel emprunt"
            description="Demandez un emprunt pour financer vos investissements"
            icon={TrendingUp}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loan_amount">
                Montant de l'emprunt (€)
              </Label>
              <Input
                id="loan_amount"
                type="number"
                min={0}
                max={500000}
                step={10000}
                {...register('loan_amount', { valueAsNumber: true })}
                disabled={disabled}
                className={errors.loan_amount ? 'border-red-500' : ''}
              />
              {errors.loan_amount && (
                <p className="text-xs text-red-500">
                  {errors.loan_amount.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Maximum : 500 000 €
              </p>
            </div>

            <div className="space-y-3">
              {/* Loan Summary */}
              {(loanAmount || 0) > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-blue-900">
                    Récapitulatif de l'emprunt
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Montant demandé</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(loanAmount || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Intérêts estimés</span>
                      <span className="font-medium text-blue-900">
                        {formatCurrency(newLoanInterest)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Debt Warning */}
              {totalDebtAfterLoan > 0 && (
                <div
                  className={`rounded-lg p-3 flex items-start gap-2 ${
                    totalDebtAfterLoan > 500000
                      ? 'bg-red-50'
                      : totalDebtAfterLoan > 300000
                      ? 'bg-amber-50'
                      : 'bg-gray-50'
                  }`}
                >
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">
                      Dette totale après emprunt :{' '}
                      {formatCurrency(totalDebtAfterLoan)}
                    </p>
                    {totalDebtAfterLoan > 500000 && (
                      <p className="text-red-600 mt-1">
                        ⚠️ Dette élevée, attention à la solvabilité
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <HelpReveal
            title="Repères finance"
            lines={[
              'L’emprunt vous donne de l’oxygène immédiat, mais augmente la pression future sur vos résultats.',
              'Les intérêts sont prélevés automatiquement chaque tour, même si vos ventes déçoivent.',
              'Un emprunt utile finance une stratégie claire : capacité, qualité, marketing ou redressement de trésorerie.',
              'Si vous empruntez pour couvrir uniquement des dépenses peu productives, votre risque financier monte vite.',
              'Pensez la dette comme un levier temporaire, pas comme une source normale d’équilibre économique.',
            ]}
          />
        </CardContent>
      </Card>
    </DecisionTabContent>
  );
}
