// ============================================================
// MarketSim Pro - Scoring Weights Component
// ============================================================

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, AlertTriangle, Check } from 'lucide-react';
import { useUpdateScoringWeights, type ScoringWeights } from '@/lib/hooks/use-analytics';

interface ScoringWeightsProps {
  sessionId: string;
  initialWeights?: ScoringWeights;
  onWeightsChange?: (weights: ScoringWeights) => void;
}

const WEIGHT_LABELS: Record<keyof ScoringWeights, { label: string; description: string }> = {
  roi: {
    label: 'ROI',
    description: 'Retour sur investissement',
  },
  market_share: {
    label: 'Part de marché',
    description: 'Performance commerciale',
  },
  financial_health: {
    label: 'Santé financière',
    description: 'Trésorerie et endettement',
  },
  customer_satisfaction: {
    label: 'Satisfaction client',
    description: 'Qualité et service',
  },
  rse_score: {
    label: 'RSE',
    description: 'Responsabilité sociétale',
  },
};

const WEIGHT_KEYS = Object.keys(WEIGHT_LABELS) as (keyof ScoringWeights)[];

export function ScoringWeightsComponent({
  sessionId,
  initialWeights,
  onWeightsChange,
}: ScoringWeightsProps) {
  const [weights, setWeights] = useState<ScoringWeights>(
    initialWeights || {
      roi: 0.2,
      market_share: 0.2,
      financial_health: 0.2,
      customer_satisfaction: 0.2,
      rse_score: 0.2,
    }
  );

  const updateMutation = useUpdateScoringWeights(sessionId);

  // Calculate total percentage
  const totalPercent = WEIGHT_KEYS.reduce(
    (sum, key) => sum + weights[key] * 100,
    0
  );
  const isValid = Math.abs(totalPercent - 100) < 0.1;

  // Notify parent of changes
  useEffect(() => {
    onWeightsChange?.(weights);
  }, [weights, onWeightsChange]);

  const handleWeightChange = (key: keyof ScoringWeights, value: number[]) => {
    setWeights((prev) => ({
      ...prev,
      [key]: value[0] / 100, // Convert from 0-100 to 0-1
    }));
  };

  const handleRecalculate = () => {
    updateMutation.mutate(weights);
  };

  const handleReset = () => {
    const resetWeights: ScoringWeights = {
      roi: 0.2,
      market_share: 0.2,
      financial_health: 0.2,
      customer_satisfaction: 0.2,
      rse_score: 0.2,
    };
    setWeights(resetWeights);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Pondération du score final</span>
          <div className="flex items-center gap-2">
            {!isValid && (
              <Badge variant="outline" className="text-red-600 border-red-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Total: {totalPercent.toFixed(0)}%
              </Badge>
            )}
            {isValid && (
              <Badge variant="outline" className="text-green-600 border-green-300">
                <Check className="h-3 w-3 mr-1" />
                Total: 100%
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {WEIGHT_KEYS.map((key) => {
          const config = WEIGHT_LABELS[key];
          const value = weights[key] * 100;

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{config.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {config.description}
                  </p>
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {value.toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[value]}
                onValueChange={(v) => handleWeightChange(key, v)}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          );
        })}

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleRecalculate}
            disabled={!isValid || updateMutation.isPending}
            className="flex-1"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${updateMutation.isPending ? 'animate-spin' : ''}`}
            />
            Recalculer les scores
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Réinitialiser
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Ajustez les pondérations pour personnaliser le score composite final.
          Le total doit être égal à 100%.
        </p>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Compact Scoring Weights for Side Panels
// ------------------------------------------------------------

interface CompactScoringWeightsProps {
  weights: ScoringWeights;
  onWeightsChange: (weights: ScoringWeights) => void;
}

export function CompactScoringWeights({
  weights,
  onWeightsChange,
}: CompactScoringWeightsProps) {
  const totalPercent = WEIGHT_KEYS.reduce(
    (sum, key) => sum + weights[key] * 100,
    0
  );
  const isValid = Math.abs(totalPercent - 100) < 0.1;

  return (
    <div className="space-y-3">
      {WEIGHT_KEYS.map((key) => {
        const config = WEIGHT_LABELS[key];
        const value = weights[key] * 100;

        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-sm w-32 truncate">{config.label}</span>
            <Slider
              value={[value]}
              onValueChange={(v) =>
                onWeightsChange({ ...weights, [key]: v[0] / 100 })
              }
              max={100}
              step={5}
              className="flex-1"
            />
            <span className="text-sm font-medium w-10 text-right">
              {value.toFixed(0)}%
            </span>
          </div>
        );
      })}
      <div
        className={`text-sm text-center pt-2 border-t ${
          isValid ? 'text-green-600' : 'text-red-600'
        }`}
      >
        Total: {totalPercent.toFixed(0)}%
      </div>
    </div>
  );
}

export type { ScoringWeights };
