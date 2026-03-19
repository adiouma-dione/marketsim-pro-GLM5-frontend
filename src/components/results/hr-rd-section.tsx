// ============================================================
// MarketSim Pro - HR & R&D Section Component
// ============================================================

'use client';

import * as React from 'react';
import { Users, Lightbulb, AlertTriangle, Award, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, formatPercent } from '@/lib/utils';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface HrRdSectionProps {
  result: RoundResultData;
}

// ------------------------------------------------------------
// R&D Milestones
// ------------------------------------------------------------

const RD_MILESTONES = [
  { amount: 150000, label: 'Amélioration produit' },
  { amount: 300000, label: 'Vélo électrique' },
  { amount: 500000, label: 'Brevet' },
];

// ------------------------------------------------------------
// Component - Only renders if HR/R&D activity is relevant
// ------------------------------------------------------------

export function HrRdSection({ result }: HrRdSectionProps) {
  const motivationPercent =
    result.motivation <= 1 ? result.motivation * 100 : result.motivation;
  const productivityPercent =
    result.productivity <= 1 ? result.productivity * 100 : result.productivity;

  // Only show if there's relevant activity
  const hasRelevantActivity =
    result.strike_days > 0 ||
    result.innovation_bonus > 0 ||
    result.cumulative_rd_investment > 0 ||
    result.patent_active_turns > 0 ||
    result.new_market_unlocked ||
    result.motivation > 0 ||
    result.productivity > 0;

  if (!hasRelevantActivity) {
    return null;
  }

  // Get next R&D milestone
  const nextMilestone = RD_MILESTONES.find(
    (m) => m.amount > result.cumulative_rd_investment
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-base">Ressources Humaines & R&D</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* HR Metrics */}
        {(result.motivation > 0 || result.productivity > 0) && (
          <div className="grid grid-cols-2 gap-4">
            {result.motivation > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Motivation</span>
                  <span className="text-sm font-semibold">
                    {formatPercent(motivationPercent)}
                  </span>
                </div>
                <Progress
                  value={motivationPercent}
                  className={`h-2 ${
                    motivationPercent >= 80
                      ? '[&>div]:bg-green-500'
                      : motivationPercent >= 50
                      ? '[&>div]:bg-amber-500'
                      : '[&>div]:bg-red-500'
                  }`}
                />
              </div>
            )}
            {result.productivity > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Productivité</span>
                  <span className="text-sm font-semibold">
                    {formatPercent(productivityPercent)}
                  </span>
                </div>
                <Progress
                  value={productivityPercent}
                  className={`h-2 ${
                    productivityPercent >= 80
                      ? '[&>div]:bg-green-500'
                      : productivityPercent >= 50
                      ? '[&>div]:bg-amber-500'
                      : '[&>div]:bg-red-500'
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Strike Days Alert */}
        {result.strike_days > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-700">
                {result.strike_days} jour{result.strike_days > 1 ? 's' : ''} de grève
              </p>
              <p className="text-red-600">
                La production a été impactée par des mouvements sociaux.
              </p>
            </div>
          </div>
        )}

        {/* R&D Section */}
        {result.cumulative_rd_investment > 0 && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Investissement R&D cumulé</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-gray-900">
                {formatCurrency(result.cumulative_rd_investment)}
              </span>
              <Progress
                value={Math.min(
                  (result.cumulative_rd_investment / 500000) * 100,
                  100
                )}
                className="h-2 w-32"
              />
            </div>

            {/* Milestones */}
            <div className="flex flex-wrap gap-2">
              {RD_MILESTONES.map((milestone) => {
                const achieved = result.cumulative_rd_investment >= milestone.amount;
                return (
                  <Badge
                    key={milestone.amount}
                    className={
                      achieved
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-gray-100 text-gray-500 border-gray-200'
                    }
                  >
                    {achieved && <CheckCircle className="h-3 w-3 mr-1" />}
                    {milestone.label}
                  </Badge>
                );
              })}
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <p className="text-xs text-gray-500">
                Prochain objectif : {nextMilestone.label} à{' '}
                {formatCurrency(nextMilestone.amount)}
              </p>
            )}
          </div>
        )}

        {/* Innovation Bonus */}
        {result.innovation_bonus > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <Zap className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-700">Bonus d'innovation</p>
              <p className="text-amber-600">
                +{formatCurrency(result.innovation_bonus)} de bonus ce tour
              </p>
            </div>
          </div>
        )}

        {/* Patent & New Market */}
        <div className="flex flex-wrap gap-2">
          {result.patent_active_turns > 0 && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Award className="h-3 w-3 mr-1" />
              Brevet actif ({result.patent_active_turns} tours)
            </Badge>
          )}
          {result.new_market_unlocked && (
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              Nouveau marché débloqué
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Helper Component
// ------------------------------------------------------------

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
