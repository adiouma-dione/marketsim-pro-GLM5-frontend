// ============================================================
// MarketSim Pro - Production Tab Component
// ============================================================

'use client';

import * as React from 'react';
import { Factory, Wrench } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MachinePurchaseGrid } from './machine-purchase-card';
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
        </CardContent>
      </Card>

      {/* Maintenance Budget */}
      <Card>
        <CardHeader className="pb-3">
          <TabHeader
            title="Budget maintenance"
            description="Investissez dans la maintenance pour préserver vos machines"
            icon={Wrench}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maintenance_budget">
                Budget maintenance (€)
              </Label>
              <Input
                id="maintenance_budget"
                type="number"
                min={0}
                max={50000}
                {...register('maintenance_budget', { valueAsNumber: true })}
                disabled={disabled}
                className={errors.maintenance_budget ? 'border-red-500' : ''}
              />
              {errors.maintenance_budget && (
                <p className="text-xs text-red-500">
                  {errors.maintenance_budget.message}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Max : 50 000 €
              </p>
            </div>

            <div className="flex items-end">
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p>
                  💡 Un budget maintenance suffisant permet de maintenir les performances
                  de vos machines et d'éviter les pannes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </DecisionTabContent>
  );
}
