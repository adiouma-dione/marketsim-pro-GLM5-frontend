// ============================================================
// MarketSim Pro - Production Tab Component
// ============================================================

'use client';

import * as React from 'react';
import { Factory, Wrench } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MachinePurchaseGrid } from './machine-purchase-card';
import { BudgetBreakdownCard } from './budget-breakdown-card';
import { TabHeader, DecisionTabContent } from './decisions-tabs';
import { MACHINE_CONFIG } from '@/lib/constants';
import type { MachineType } from '@/lib/types';
import type { DecisionFormData } from '@/lib/hooks/use-decisions';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface ProductionTabProps {
  teamCash: number;
  teamMachines: Array<{
    machine_type: MachineType;
    quantity: number;
    is_active: boolean;
  }>;
  onPurchaseMachine: (type: MachineType) => void;
  purchasingType?: MachineType | null;
  disabled?: boolean;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function ProductionTab({
  teamCash,
  teamMachines,
  onPurchaseMachine,
  purchasingType,
  disabled = false,
}: ProductionTabProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<DecisionFormData>();

  const productionVolume = watch('production_volume');

  // Calculate total machine capacity
  const totalCapacity = React.useMemo(() => {
    return teamMachines.reduce((sum, machine) => {
      if (!machine.is_active) return sum;
      const config = MACHINE_CONFIG[machine.machine_type];
      return sum + config.capacity * machine.quantity;
    }, 0);
  }, [teamMachines]);

  // Count owned machines by type
  const ownedMachines = React.useMemo(() => {
    const counts: Record<MachineType, number> = {
      basic: 0,
      standard: 0,
      premium: 0,
    };
    teamMachines.forEach((machine) => {
      if (machine.is_active) {
        counts[machine.machine_type] += machine.quantity;
      }
    });
    return counts;
  }, [teamMachines]);

  // Calculate capacity utilization
  const capacityUtilization = totalCapacity > 0
    ? Math.round((productionVolume / totalCapacity) * 100)
    : 0;

  return (
    <DecisionTabContent>
      {/* Production Volume */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Volume de production"
            description="Définissez le nombre d'unités à produire ce tour"
            icon={Factory}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="production_volume">
                Volume de production (unités)
              </Label>
              <Input
                id="production_volume"
                type="number"
                min={100}
                max={10000}
                {...register('production_volume', { valueAsNumber: true })}
                disabled={disabled}
                className={errors.production_volume ? 'border-red-500' : ''}
              />
              {errors.production_volume && (
                <p className="text-xs text-red-500">
                  {errors.production_volume.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Capacité totale disponible</Label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {totalCapacity.toLocaleString('fr-FR')}
                </span>
                <span className="text-gray-500">unités/tour</span>
              </div>
              {productionVolume > 0 && (
                <div className="text-sm">
                  <span className="text-gray-500">Utilisation : </span>
                  <span
                    className={`font-medium ${
                      capacityUtilization > 100
                        ? 'text-red-600'
                        : capacityUtilization > 80
                        ? 'text-amber-600'
                        : 'text-green-600'
                    }`}
                  >
                    {capacityUtilization}%
                  </span>
                  {capacityUtilization > 100 && (
                    <span className="text-red-500 ml-2">
                      ⚠️ Dépassement de capacité
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Repères production</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>• Produire en dessous de la capacité limite le risque, mais peut vous faire perdre des ventes si la demande suit.</li>
              <li>• Produire au-dessus de la capacité est un signal de tension opérationnelle et peut dégrader vos performances.</li>
              <li>• Le bon volume dépend du prix choisi, du marketing engagé et de la fiabilité de votre parc machine.</li>
              <li>• Avant d’augmenter fortement la production, vérifiez que votre maintenance et votre trésorerie sont cohérentes.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Machine Purchase */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Achat de machines"
            description="Acquérez de nouvelles machines pour augmenter votre capacité de production"
          />
        </CardHeader>
        <CardContent>
          <MachinePurchaseGrid
            teamCash={teamCash}
            ownedMachines={ownedMachines}
            onPurchase={onPurchaseMachine}
            purchasingType={purchasingType}
            disabled={disabled}
          />

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-sm font-medium text-blue-900">Repères machines</p>
            <ul className="mt-2 space-y-2 text-sm text-blue-700">
              <li>• Acheter des machines augmente votre capacité, mais immobilise immédiatement de la trésorerie.</li>
              <li>• Un parc plus large est utile seulement si vous avez un plan crédible pour l’utiliser sur plusieurs tours.</li>
              <li>• Évitez de surinvestir en machines si votre demande reste incertaine ou votre dette déjà élevée.</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <BudgetBreakdownCard
        title="Budget maintenance"
        description="Détaillez vos dépenses de maintenance machine"
        icon={Wrench}
        totalField="maintenance_budget"
        breakdownField="maintenance_breakdown"
        maxTotal={50000}
        disabled={disabled}
        items={[
          {
            key: 'preventive_visits',
            label: 'Interventions de maintenance préventive',
            unitCost: 800,
            unitLabel: 'intervention',
          },
          {
            key: 'spare_parts_kits',
            label: 'Kits de pièces détachées',
            unitCost: 650,
            unitLabel: 'kit',
          },
          {
            key: 'external_technician_days',
            label: 'Journées technicien externe',
            unitCost: 1400,
            unitLabel: 'journée',
          },
          {
            key: 'predictive_maintenance_packs',
            label: 'Packs maintenance prédictive',
            unitCost: 2200,
            unitLabel: 'pack',
          },
          {
            key: 'safety_inspections',
            label: 'Contrôles sécurité machine',
            unitCost: 500,
            unitLabel: 'contrôle',
          },
          {
            key: 'adjustment',
            label: 'Ajustement libre',
            unitCost: 1,
            unitLabel: 'euro direct',
          },
        ]}
        helperTitle="Repères maintenance"
        helperLines={[
          'La maintenance soutient la disponibilité des machines et limite les pannes.',
          'Les techniciens externes et packs prédictifs sont utiles en montée de charge.',
          'Si vous poussez la production ou achetez de nouvelles machines, le besoin de maintenance devient plus critique.',
          'Un sous-investissement maintenance peut coûter plus cher indirectement qu’une dépense préventive bien placée.',
          'Le total calculé reste borné par le plafond backend de 50 000 €.',
        ]}
      />
    </DecisionTabContent>
  );
}
