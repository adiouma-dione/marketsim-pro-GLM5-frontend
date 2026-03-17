// ============================================================
// MarketSim Pro - Quality & HR Tab Component
// ============================================================

'use client';

import * as React from 'react';
import { Heart, Beaker, Users, Banknote, Award, Target } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { TabHeader, DecisionTabContent } from './decisions-tabs';
import { formatCurrency } from '@/lib/utils';
import type { DecisionFormData } from '@/lib/hooks/use-decisions';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface QualityTabProps {
  currentQhseScore?: number;
  cumulativeRdInvestment?: number;
  disabled?: boolean;
}

// ------------------------------------------------------------
// R&D Milestones
// ------------------------------------------------------------

const RD_MILESTONES = [
  { amount: 150000, label: 'Amélioration produit', icon: Target },
  { amount: 300000, label: 'Vélo électrique', icon: Award },
  { amount: 500000, label: 'Brevet', icon: Award },
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function QualityTab({
  currentQhseScore = 50,
  cumulativeRdInvestment = 0,
  disabled = false,
}: QualityTabProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<DecisionFormData>();

  const qhseInvestment = watch('qhse_investment');
  const hrInvestment = watch('hr_investment');
  const rdInvestment = watch('rd_investment');
  const avgSalary = watch('avg_salary');

  // Calculate R&D progress
  const totalRdInvestment = cumulativeRdInvestment + (rdInvestment || 0);
  const nextMilestone = RD_MILESTONES.find((m) => m.amount > cumulativeRdInvestment);
  const rdProgressPercent = Math.min(
    ((totalRdInvestment / 500000) * 100),
    100
  );

  // Handle slider changes
  const handleQhseSliderChange = (value: number[]) => {
    setValue('qhse_investment', value[0], { shouldValidate: true });
  };

  const handleHrSliderChange = (value: number[]) => {
    setValue('hr_investment', value[0], { shouldValidate: true });
  };

  const handleRdSliderChange = (value: number[]) => {
    setValue('rd_investment', value[0], { shouldValidate: true });
  };

  return (
    <DecisionTabContent>
      {/* QHSE Budget */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Budget QHSE"
            description="Qualité, Hygiène, Sécurité, Environnement"
            icon={Heart}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Score */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Score QHSE actuel</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {currentQhseScore}
                </span>
                <span className="text-gray-500">/ 100</span>
              </div>
              <Progress
                value={currentQhseScore}
                className="h-2 mt-2"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Impact d'un bon score QHSE :</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Réduction des accidents et pannes
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Certification ISO possible
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Amélioration de l'image de marque
                </li>
              </ul>
            </div>
          </div>

          {/* QHSE Slider */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Investissement QHSE</Label>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(qhseInvestment || 0)}
              </span>
            </div>
            <Slider
              min={0}
              max={100000}
              step={5000}
              value={[qhseInvestment || 0]}
              onValueChange={handleQhseSliderChange}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 €</span>
              <span>50 000 €</span>
              <span>100 000 €</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HR Budget */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Budget Ressources Humaines"
            description="Investissez dans vos équipes"
            icon={Users}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Investissement RH</Label>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(hrInvestment || 0)}
              </span>
            </div>
            <Slider
              min={0}
              max={100000}
              step={5000}
              value={[hrInvestment || 0]}
              onValueChange={handleHrSliderChange}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 €</span>
              <span>50 000 €</span>
              <span>100 000 €</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 mt-4">
            <p>
              💡 Les investissements RH améliorent la motivation des employés
              et réduisent le turnover.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* R&D Investment */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Investissement R&D"
            description="Innovation et développement de nouveaux produits"
            icon={Beaker}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Investissement R&D ce tour</Label>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(rdInvestment || 0)}
              </span>
            </div>
            <Slider
              min={0}
              max={100000}
              step={5000}
              value={[rdInvestment || 0]}
              onValueChange={handleRdSliderChange}
              disabled={disabled}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 €</span>
              <span>50 000 €</span>
              <span>100 000 €</span>
            </div>
          </div>

          {/* R&D Progress */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">
                Investissement R&D cumulé
              </p>
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(totalRdInvestment)}
              </span>
            </div>
            <Progress
              value={rdProgressPercent}
              className="h-3 mb-3"
            />

            {/* Milestones */}
            <div className="space-y-2 mt-4">
              <p className="text-sm font-medium text-gray-700">Paliers R&D</p>
              {RD_MILESTONES.map((milestone) => {
                const achieved = totalRdInvestment >= milestone.amount;
                const Icon = milestone.icon;
                return (
                  <div
                    key={milestone.amount}
                    className={`flex items-center justify-between p-2 rounded ${
                      achieved ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`h-4 w-4 ${
                          achieved ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          achieved ? 'text-green-700 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {milestone.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm ${
                          achieved ? 'text-green-600' : 'text-gray-500'
                        }`}
                      >
                        {formatCurrency(milestone.amount)}
                      </span>
                      {achieved && (
                        <span className="text-green-600 text-xs">✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Prochain objectif : </span>
                  {nextMilestone.label} à {formatCurrency(nextMilestone.amount)}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Il vous reste{' '}
                  {formatCurrency(nextMilestone.amount - totalRdInvestment)} à investir
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Average Salary */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Salaire moyen"
            description="Définissez le salaire moyen mensuel de vos employés"
            icon={Banknote}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="avg_salary">Salaire moyen mensuel (€)</Label>
              <Input
                id="avg_salary"
                type="number"
                min={1500}
                max={5000}
                step={50}
                {...register('avg_salary', { valueAsNumber: true })}
                disabled={disabled}
                className={errors.avg_salary ? 'border-red-500' : ''}
              />
              {errors.avg_salary && (
                <p className="text-xs text-red-500">
                  {errors.avg_salary.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Entre 1 500 € et 5 000 €
              </p>
            </div>

            <div className="flex items-end">
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 w-full">
                <p className="font-medium mb-1">Impact des salaires</p>
                <ul className="text-xs space-y-1 text-gray-600">
                  <li>• Salaires bas = turnover élevé</li>
                  <li>• Salaires élevés = motivation accrue</li>
                  <li>• Impact sur les coûts de production</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DecisionTabContent>
  );
}
