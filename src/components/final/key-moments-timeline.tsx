// ============================================================
// MarketSim Pro - Key Moments Timeline Component
// ============================================================

// 'use client';

import * as React from 'react';
import { TrendingUp, AlertTriangle, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface KeyMoment {
  round: number;
  type: 'peak_pdm' | 'iso' | 'strike' | 'innovation';
  description: string;
  icon: React.ElementType;
  color: string;
}

interface KeyMomentsTimelineProps {
  history: RoundResultData[];
  className?: string;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function KeyMomentsTimeline({ history, className }: KeyMomentsTimelineProps) {
  const moments = React.useMemo(() => {
    const events: KeyMoment[] = [];

    history.forEach((result) => {
      // Pic PDM
      if (result.market_share_pct > 0) {
        const previousPdm = history.find(
          (r) => r.round_number === result.round_number - 1
        )?.market_share_pct || 0;

        if (!previousPdm || result.market_share_pct > previousPdm) {
          events.push({
            round: result.round_number,
            type: 'peak_pdm',
            description: `Pic de PDM : ${(result.market_share_pct * 100).toFixed(1)}%`,
            icon: TrendingUp,
            color: 'text-green-600',
          });
        }
      }

      // ISO Certification
      if (result.iso_certified) {
        events.push({
          round: result.round_number,
          type: 'iso',
          description: 'Certification ISO 9001 obtenue',
          icon: CheckCircle,
          color: 'text-purple-600',
        });
      }

      // Strike
      if (result.strike_days > 0) {
        events.push({
          round: result.round_number,
          type: 'strike',
          description: `${result.strike_days} jour(s) de grève`,
          icon: AlertTriangle,
          color: 'text-red-600',
        });
      }

      // Innovation
      if (result.innovation_bonus > 0) {
        events.push({
          round: result.round_number,
          type: 'innovation',
          description: `Bonus innovation : +${result.innovation_bonus?.toLocaleString('fr-FR')} €`,
          icon: Award,
          color: 'text-amber-600',
        });
      }
    });

    return events;
  }, [history]);

  if (moments.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Moments clés de la simulation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-0 right-0 top-1/2 w-0.5 bg-gray-200" />
          
          {/* Timeline events */}
          <div className="flex justify-between relative">
            {moments.map((moment, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                {/* Dot */}
                <div
                  className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center relative z-10',
                    moment.color === 'text-green-600' && 'bg-green-100',
                    moment.color === 'text-blue-600' && 'bg-blue-100',
                    moment.color === 'text-purple-600' && 'bg-purple-100',
                    moment.color === 'text-red-600' && 'bg-red-100',
                    moment.color === 'text-amber-600' && 'bg-amber-100'
                  )}
                  style={{ color: moment.color }}
                >
                  <moment.icon className="h-3 w-3" />
                </div>

                {/* Round number */}
                <p className="text-xs text-gray-500 mt-2">T{moment.round}</p>

                
                {/* Description */}
                <p className="text-sm text-gray-700 text-center mt-1 max-w-[120px]">
                  {moment.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
