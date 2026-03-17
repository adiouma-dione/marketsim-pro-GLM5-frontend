// ============================================================
// MarketSim Pro - Marketing Tab Component
// ============================================================

'use client';

import * as React from 'react';
import { Megaphone, Tag, AlertTriangle, Info } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TabHeader, DecisionTabContent } from './decisions-tabs';
import { formatCurrency, formatNumber } from '@/lib/utils';
import type { DecisionFormData } from '@/lib/hooks/use-decisions';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface MarketingTabProps {
  averageMarketPrice?: number;
  estimatedCostPerUnit?: number;
  disabled?: boolean;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function MarketingTab({
  averageMarketPrice,
  estimatedCostPerUnit,
  disabled = false,
}: MarketingTabProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<DecisionFormData>();

  const pricePerUnit = watch('price_per_unit');
  const marketingBudget = watch('marketing_budget');

  // Price warning state
  const isPriceBelowCost =
    estimatedCostPerUnit && pricePerUnit < estimatedCostPerUnit;
  const isPriceBelowMarket =
    averageMarketPrice && pricePerUnit < averageMarketPrice * 0.7;

  // Handle slider change
  const handleMarketingSliderChange = (value: number[]) => {
    setValue('marketing_budget', value[0], { shouldValidate: true });
  };

  return (
    <DecisionTabContent>
      {/* Pricing */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Prix de vente"
            description="Définissez le prix de vente unitaire de vos vélos"
            icon={Tag}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_per_unit">
                Prix de vente unitaire (€)
              </Label>
              <Input
                id="price_per_unit"
                type="number"
                min={50}
                max={500}
                {...register('price_per_unit', { valueAsNumber: true })}
                disabled={disabled}
                className={errors.price_per_unit ? 'border-red-500' : ''}
              />
              {errors.price_per_unit && (
                <p className="text-xs text-red-500">
                  {errors.price_per_unit.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Entre 50 € et 500 €
              </p>
            </div>

            <div className="space-y-3">
              {/* Market Price Indicator */}
              {averageMarketPrice && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">
                    Prix moyen marché (tour précédent)
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(averageMarketPrice)}
                  </p>
                </div>
              )}

              {/* Price Warning */}
              {isPriceBelowCost && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">Prix inférieur au coût estimé</p>
                    <p className="text-xs mt-0.5">
                      Coût estimé : {formatCurrency(estimatedCostPerUnit!)}
                    </p>
                  </div>
                </div>
              )}

              {isPriceBelowMarket && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p>Prix bien inférieur au marché</p>
                    <p className="text-xs mt-0.5">
                      Cela peut augmenter vos ventes mais réduire vos marges
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Budget */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Budget marketing"
            description="Investissez dans la promotion pour augmenter vos ventes"
            icon={Megaphone}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Budget Display */}
            <div className="flex items-center justify-between">
              <Label>Budget marketing</Label>
              <span className="text-2xl font-bold text-blue-600">
                {formatCurrency(marketingBudget || 0)}
              </span>
            </div>

            {/* Slider */}
            <div className="px-1">
              <Slider
                min={0}
                max={100000}
                step={5000}
                value={[marketingBudget || 0]}
                onValueChange={handleMarketingSliderChange}
                disabled={disabled}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0 €</span>
                <span>50 000 €</span>
                <span>100 000 €</span>
              </div>
            </div>

            {/* Manual Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marketing_budget_manual">
                  Ou saisissez manuellement (€)
                </Label>
                <Input
                  id="marketing_budget_manual"
                  type="number"
                  min={0}
                  max={100000}
                  step={5000}
                  {...register('marketing_budget', { valueAsNumber: true })}
                  disabled={disabled}
                  className={errors.marketing_budget ? 'border-red-500' : ''}
                />
                {errors.marketing_budget && (
                  <p className="text-xs text-red-500">
                    {errors.marketing_budget.message}
                  </p>
                )}
              </div>

              <div className="flex items-end">
                <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700 w-full">
                  <p className="font-medium mb-1">Impact du budget</p>
                  <ul className="text-xs space-y-1">
                    <li>• Augmente la notoriété de la marque</li>
                    <li>• Améliore les ventes potentielles</li>
                    <li>• Impact sur le score de marque</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Tips */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Conseils marketing</p>
              <p>
                Un budget marketing équilibré permet de vous démarquer de la concurrence.
                Les investissements marketing améliorent votre position sur le marché
                et augmentent la demande pour vos produits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DecisionTabContent>
  );
}
