// ============================================================
// MarketSim Pro - Machine Purchase Card Component
// ============================================================

'use client';

import * as React from 'react';
import { Cog, Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MACHINE_CONFIG, MACHINE_BADGE_CONFIG } from '@/lib/constants';
import type { MachineType } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface MachinePurchaseCardProps {
  type: MachineType;
  teamCash: number;
  ownedCount: number;
  onPurchase: (type: MachineType) => void;
  isPurchasing?: boolean;
  disabled?: boolean;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function MachinePurchaseCard({
  type,
  teamCash,
  ownedCount,
  onPurchase,
  isPurchasing = false,
  disabled = false,
}: MachinePurchaseCardProps) {
  const config = MACHINE_CONFIG[type];
  const badgeConfig = MACHINE_BADGE_CONFIG[type];
  const Icon = config.icon;

  const canAfford = teamCash >= config.price;
  const isDisabled = disabled || !canAfford;

  return (
    <Card className="relative overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <Badge
            className={cn(
              'text-xs font-medium',
              badgeConfig.bg,
              badgeConfig.text
            )}
          >
            {config.label}
          </Badge>
          {ownedCount > 0 && (
            <span className="text-xs text-gray-500">
              {ownedCount} possédée{ownedCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-3">
          <div
            className={cn(
              'h-12 w-12 rounded-full flex items-center justify-center',
              type === 'basic' && 'bg-gray-100',
              type === 'standard' && 'bg-blue-100',
              type === 'premium' && 'bg-purple-100'
            )}
          >
            <Icon
              className={cn(
                'h-6 w-6',
                type === 'basic' && 'text-gray-600',
                type === 'standard' && 'text-blue-600',
                type === 'premium' && 'text-purple-600'
              )}
            />
          </div>
        </div>

        {/* Price */}
        <div className="text-center mb-3">
          <span className="text-lg font-bold text-gray-900">
            {config.price.toLocaleString('fr-FR')} €
          </span>
        </div>

        {/* Specs */}
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Capacité</span>
            <span className="font-medium text-gray-700">
              {config.capacity} u/tour
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Qualité</span>
            <span className="font-medium text-gray-700">
              {Math.round(config.quality * 100)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Énergie</span>
            <span
              className={cn(
                'font-medium',
                config.energy === 'Élevée' && 'text-red-600',
                config.energy === 'Moyenne' && 'text-amber-600',
                config.energy === 'Faible' && 'text-green-600'
              )}
            >
              {config.energy}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Taux défaut</span>
            <span
              className={cn(
                'font-medium',
                config.defectRate === '8%' && 'text-red-600',
                config.defectRate === '4%' && 'text-amber-600',
                config.defectRate === '1%' && 'text-green-600'
              )}
            >
              {config.defectRate}
            </span>
          </div>
        </div>

        {/* Purchase Button */}
        <Button
          className="w-full"
          variant={canAfford ? 'default' : 'outline'}
          disabled={isDisabled || isPurchasing}
          onClick={() => onPurchase(type)}
        >
          {isPurchasing ? (
            <>
              <Cog className="h-4 w-4 mr-2 animate-spin" />
              Achat...
            </>
          ) : !canAfford ? (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Fonds insuffisants
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Acheter
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Machine Purchase Grid
// ------------------------------------------------------------

interface MachinePurchaseGridProps {
  teamCash: number;
  ownedMachines: Record<MachineType, number>;
  onPurchase: (type: MachineType) => void;
  purchasingType?: MachineType | null;
  disabled?: boolean;
}

export function MachinePurchaseGrid({
  teamCash,
  ownedMachines,
  onPurchase,
  purchasingType,
  disabled,
}: MachinePurchaseGridProps) {
  const machineTypes: MachineType[] = ['basic', 'standard', 'premium'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {machineTypes.map((type) => (
        <MachinePurchaseCard
          key={type}
          type={type}
          teamCash={teamCash}
          ownedCount={ownedMachines[type] ?? 0}
          onPurchase={onPurchase}
          isPurchasing={purchasingType === type}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
