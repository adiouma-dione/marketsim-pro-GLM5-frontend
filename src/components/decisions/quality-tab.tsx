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
import { Progress } from '@/components/ui/progress';
import { BudgetBreakdownCard } from './budget-breakdown-card';
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
    formState: { errors },
  } = useFormContext<DecisionFormData>();

  const rdInvestment = watch('rd_investment');

  // Calculate R&D progress
  const totalRdInvestment = cumulativeRdInvestment + (rdInvestment || 0);
  const nextMilestone = RD_MILESTONES.find((m) => m.amount > totalRdInvestment);
  const rdProgressPercent = Math.min(
    ((totalRdInvestment / 500000) * 100),
    100
  );

  return (
    <DecisionTabContent>
      <BudgetBreakdownCard
        title="Budget QHSE"
        description="Qualité, hygiène, sécurité et environnement détaillés par actions"
        icon={Heart}
        totalField="qhse_investment"
        breakdownField="qhse_breakdown"
        maxTotal={100000}
        disabled={disabled}
        items={[
          {
            key: 'safety_audits',
            label: 'Audits sécurité',
            unitCost: 1500,
            unitLabel: 'audit',
          },
          {
            key: 'protective_equipment_kits',
            label: 'Kits équipements de protection',
            unitCost: 250,
            unitLabel: 'kit',
          },
          {
            key: 'evacuation_drills',
            label: 'Simulations et exercices d’évacuation',
            unitCost: 1200,
            unitLabel: 'session',
          },
          {
            key: 'waste_treatment_batches',
            label: 'Traitement et tri des déchets',
            unitCost: 1800,
            unitLabel: 'lot',
          },
          {
            key: 'iso_preparation_blocks',
            label: 'Préparation certification ISO',
            unitCost: 4000,
            unitLabel: 'bloc',
          },
          {
            key: 'adjustment',
            label: 'Ajustement libre',
            unitCost: 1,
            unitLabel: 'euro direct',
          },
        ]}
        helperTitle="Repères QHSE"
        helperLines={[
          'Un meilleur QHSE réduit les incidents et soutient l’image de marque.',
          'La préparation ISO est un poste plus structurant que les actions ponctuelles.',
          'Les audits, exercices et équipements de protection sont utiles pour stabiliser vos opérations.',
          'Un budget QHSE cohérent est particulièrement pertinent si vous montez en cadence industrielle.',
          'Le score QHSE actuel reste affiché ci-dessous pour comparaison.',
        ]}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-2">Score QHSE actuel</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {currentQhseScore}
                </span>
                <span className="text-gray-500">/ 100</span>
              </div>
              <Progress value={currentQhseScore} className="h-2 mt-2" />
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
        </CardContent>
      </Card>

      <BudgetBreakdownCard
        title="Budget Ressources Humaines"
        description="Détaillez la formation, le recrutement et l’engagement des équipes"
        icon={Users}
        totalField="hr_investment"
        breakdownField="hr_breakdown"
        maxTotal={100000}
        disabled={disabled}
        items={[
          {
            key: 'training_sessions',
            label: 'Sessions de formation',
            unitCost: 1200,
            unitLabel: 'session',
          },
          {
            key: 'team_building_days',
            label: 'Journées team building',
            unitCost: 2500,
            unitLabel: 'journée',
          },
          {
            key: 'recruitment_campaigns',
            label: 'Campagnes de recrutement',
            unitCost: 1800,
            unitLabel: 'campagne',
          },
          {
            key: 'wellness_programs',
            label: 'Programmes bien-être',
            unitCost: 1500,
            unitLabel: 'programme',
          },
          {
            key: 'bonus_packages',
            label: 'Packs de primes collectives',
            unitCost: 1000,
            unitLabel: 'pack',
          },
          {
            key: 'adjustment',
            label: 'Ajustement libre',
            unitCost: 1,
            unitLabel: 'euro direct',
          },
        ]}
        helperTitle="Repères RH"
        helperLines={[
          'Les budgets RH influencent motivation, stabilité et qualité d’exécution.',
          'Les salaires restent gérés séparément juste en dessous.',
          'Les formations servent plutôt le moyen terme, alors que les primes peuvent produire un effet plus immédiat.',
          'Le recrutement et le bien-être ont du sens si vous cherchez à soutenir durablement la performance collective.',
          'Les primes et formations servent à tester des stratégies de mobilisation différentes.',
        ]}
      />

      <BudgetBreakdownCard
        title="Investissement R&D"
        description="Décomposez votre investissement innovation par type d’action"
        icon={Beaker}
        totalField="rd_investment"
        breakdownField="rd_breakdown"
        maxTotal={100000}
        disabled={disabled}
        items={[
          {
            key: 'prototypes',
            label: 'Prototypes produit',
            unitCost: 5000,
            unitLabel: 'prototype',
          },
          {
            key: 'lab_tests',
            label: 'Tests laboratoire',
            unitCost: 1800,
            unitLabel: 'campagne',
          },
          {
            key: 'user_studies',
            label: 'Études utilisateurs',
            unitCost: 2200,
            unitLabel: 'étude',
          },
          {
            key: 'material_research_blocks',
            label: 'Recherche matériaux',
            unitCost: 3500,
            unitLabel: 'bloc',
          },
          {
            key: 'patent_watch_cycles',
            label: 'Veille brevets',
            unitCost: 1200,
            unitLabel: 'cycle',
          },
          {
            key: 'adjustment',
            label: 'Ajustement libre',
            unitCost: 1,
            unitLabel: 'euro direct',
          },
        ]}
        helperTitle="Repères R&D"
        helperLines={[
          'Le backend continue de recevoir un investissement R&D agrégé.',
          'Les prototypes et recherches matériaux consomment vite le budget.',
          'La R&D paie rarement immédiatement : elle est surtout utile si vous jouez plusieurs tours avec une vision claire.',
          'Les petits tests et études peuvent aider à apprendre sans engager tout le budget trop tôt.',
          'Les paliers ci-dessous restent utiles pour suivre le cumul multi-tours.',
        ]}
      />

      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Progression R&D"
            description="Suivez votre cumul d’investissement et les paliers atteints"
            icon={Beaker}
          />
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-lg p-4">
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
                  <li>• Des salaires trop bas peuvent créer un turnover élevé et fragiliser l’exécution.</li>
                  <li>• Des salaires plus élevés peuvent soutenir motivation et stabilité, mais pèsent sur les coûts.</li>
                  <li>• Le bon niveau dépend de votre stratégie : défense de marge, montée en qualité ou recherche de performance sociale.</li>
                  <li>• Ne regardez pas le salaire isolément : combinez-le avec vos budgets RH et votre situation financière.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DecisionTabContent>
  );
}
