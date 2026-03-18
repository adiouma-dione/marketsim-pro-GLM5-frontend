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
import { TabHeader, DecisionTabContent } from './decisions-tabs';
import { BudgetBreakdownCard } from './budget-breakdown-card';
import { formatCurrency } from '@/lib/utils';
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
    formState: { errors },
  } = useFormContext<DecisionFormData>();

  const pricePerUnit = watch('price_per_unit');

  // Price warning state
  const isPriceBelowCost =
    estimatedCostPerUnit && pricePerUnit < estimatedCostPerUnit;
  const isPriceBelowMarket =
    averageMarketPrice && pricePerUnit < averageMarketPrice * 0.7;

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

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Repères prix</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>• Un prix bas peut soutenir les volumes, mais il comprime vite votre marge unitaire.</li>
              <li>• Un prix plus élevé suppose une offre crédible en qualité, image et disponibilité.</li>
              <li>• Si votre prix s’écarte trop du marché, vérifiez que votre budget marketing peut compenser.</li>
              <li>• Comparez toujours votre prix au coût estimé, sinon vous risquez de vendre à perte.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <BudgetBreakdownCard
        title="Budget marketing"
        description="Construisez votre budget pub à partir d'actions concrètes"
        icon={Megaphone}
        totalField="marketing_budget"
        breakdownField="marketing_breakdown"
        maxTotal={100000}
        disabled={disabled}
        items={[
          {
            key: 'small_billboards',
            label: 'Petits panneaux publicitaires',
            unitCost: 1200,
            unitLabel: 'panneau',
            hint: 'Affichage local de proximité autour des points de vente.',
          },
          {
            key: 'large_billboards',
            label: 'Grands panneaux publicitaires',
            unitCost: 3000,
            unitLabel: 'panneau',
            hint: 'Campagnes à forte visibilité sur axes très fréquentés.',
          },
          {
            key: 'radio_spots',
            label: 'Spots publicitaires radio',
            unitCost: 750,
            unitLabel: 'spot',
          },
          {
            key: 'tv_spots',
            label: 'Spots publicitaires télé',
            unitCost: 5000,
            unitLabel: 'spot',
          },
          {
            key: 'flyer_batches',
            label: 'Flyers imprimés',
            unitCost: 180,
            unitLabel: 'lot de 1 000',
          },
          {
            key: 'digital_campaigns',
            label: 'Campagnes digitales',
            unitCost: 900,
            unitLabel: 'campagne',
          },
          {
            key: 'adjustment',
            label: 'Ajustement libre',
            unitCost: 1,
            unitLabel: 'euro direct',
            hint: 'Permet de compléter un budget sans passer par un poste standard.',
          },
        ]}
        helperTitle="Repères marketing"
        helperLines={[
          'Les grands panneaux et spots TV renforcent surtout la visibilité, mais consomment vite le budget.',
          'Les spots radio, flyers et campagnes digitales sont plus souples pour tester une montée progressive.',
          'Un budget marketing élevé est plus pertinent si votre prix, votre production et votre qualité suivent.',
          'Si vous produisez peu, un budget publicitaire trop agressif peut créer une demande que vous ne pourrez pas servir.',
          'Le total calculé alimente directement le budget marketing du moteur de simulation.',
        ]}
      />

      {/* Marketing Tips */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Conseils marketing</p>
              <ul className="space-y-1 text-sm">
                <li>• Cherchez la cohérence entre le prix affiché, la promesse marketing et la qualité perçue.</li>
                <li>• Une hausse de budget pub est souvent plus efficace quand elle accompagne une vraie intention stratégique.</li>
                <li>• Si vous visez un positionnement premium, évitez de combiner prix cassé et communication de masse peu ciblée.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </DecisionTabContent>
  );
}
