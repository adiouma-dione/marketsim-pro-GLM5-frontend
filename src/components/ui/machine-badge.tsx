// ============================================================
// MarketSim Pro - Machine Badge Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { MachineType } from '@/lib/types';
import { Cog, Settings2, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { MACHINE_CONFIG } from '@/lib/constants';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface MachineBadgeProps {
  type: MachineType;
  quantity?: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

const machineConfig: Record<MachineType, {
  label: string;
  icon: LucideIcon;
  bgClass: string;
  textClass: string;
}> = {
  basic: {
    label: 'Basique',
    icon: Cog,
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
  standard: {
    label: 'Standard',
    icon: Settings2,
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  premium: {
    label: 'Premium',
    icon: Star,
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-700',
  },
};

const sizeConfig = {
  sm: {
    badge: 'px-2 py-0.5 text-xs',
    icon: 'h-3 w-3',
    gap: 'gap-1',
  },
  md: {
    badge: 'px-2.5 py-1 text-xs',
    icon: 'h-3.5 w-3.5',
    gap: 'gap-1.5',
  },
  lg: {
    badge: 'px-3 py-1.5 text-sm',
    icon: 'h-4 w-4',
    gap: 'gap-2',
  },
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function MachineBadge({
  type,
  quantity,
  showDetails = false,
  size = 'md',
  className,
}: MachineBadgeProps) {
  const config = machineConfig[type];
  const Icon = config.icon;
  const sizes = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.bgClass,
        config.textClass,
        sizes.badge,
        sizes.gap,
        className
      )}
    >
      <Icon className={sizes.icon} />
      {config.label}
      {quantity !== undefined && (
        <span className="ml-0.5 font-bold">×{quantity}</span>
      )}
    </span>
  );
}

// ------------------------------------------------------------
// Machine Card Component (for details display)
// ------------------------------------------------------------

export interface MachineCardProps {
  type: MachineType;
  quantity?: number;
  showPrice?: boolean;
  className?: string;
}

export function MachineCard({
  type,
  quantity = 1,
  showPrice = true,
  className,
}: MachineCardProps) {
  const config = MACHINE_CONFIG[type];
  const BadgeIcon = machineConfig[type].icon;

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'p-2 rounded-lg',
              machineConfig[type].bgClass
            )}
          >
            <BadgeIcon
              className={cn(
                'h-5 w-5',
                machineConfig[type].textClass
              )}
            />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{config.label}</h4>
            {quantity > 1 && (
              <p className="text-sm text-gray-500">Quantité: {quantity}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Capacité:</span>
          <span className="ml-1 font-medium text-gray-900">
            {config.capacity} u/tour
          </span>
        </div>
        <div>
          <span className="text-gray-500">Qualité:</span>
          <span className="ml-1 font-medium text-gray-900">
            {(config.quality * 100).toFixed(0)}%
          </span>
        </div>
        <div>
          <span className="text-gray-500">Énergie:</span>
          <span className="ml-1 font-medium text-gray-900">{config.energy}</span>
        </div>
        <div>
          <span className="text-gray-500">Défauts:</span>
          <span className="ml-1 font-medium text-gray-900">{config.defectRate}</span>
        </div>
      </div>

      {showPrice && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Prix unitaire:</span>
            <span className="font-semibold text-gray-900 tabular-nums">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
              }).format(config.price)}
            </span>
          </div>
          {quantity > 1 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-gray-500">Total ({quantity}):</span>
              <span className="font-semibold text-blue-600 tabular-nums">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(config.price * quantity)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Machine Selector Component
// ------------------------------------------------------------

export interface MachineOptionProps {
  type: MachineType;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function MachineOption({
  type,
  selected = false,
  disabled = false,
  onClick,
  className,
}: MachineOptionProps) {
  const config = MACHINE_CONFIG[type];
  const Icon = machineConfig[type].icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 bg-white hover:border-gray-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'p-1.5 rounded',
            machineConfig[type].bgClass
          )}
        >
          <Icon
            className={cn(
              'h-4 w-4',
              machineConfig[type].textClass
            )}
          />
        </div>
        <span className="font-medium text-gray-900">{config.label}</span>
      </div>
      <div className="text-xs text-gray-500 space-y-0.5">
        <p>Capacité: {config.capacity} u/tour</p>
        <p>Qualité: {(config.quality * 100).toFixed(0)}%</p>
        <p className="font-medium text-gray-700">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
          }).format(config.price)}
        </p>
      </div>
    </button>
  );
}
