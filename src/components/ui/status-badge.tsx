// ============================================================
// MarketSim Pro - Status Badge Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface StatusBadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  icon?: LucideIcon;
  label: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

// ------------------------------------------------------------
// Variant Styles
// ------------------------------------------------------------

const variantStyles = {
  default: 'bg-gray-100 text-gray-600',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-gray-100 text-gray-600',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function StatusBadge({
  variant = 'default',
  icon: Icon,
  label,
  className,
  size = 'md',
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
}

// ------------------------------------------------------------
// Preset Components
// ------------------------------------------------------------

export interface SessionStatusBadgeProps {
  status: 'draft' | 'active' | 'paused' | 'finished';
  className?: string;
}

export function SessionStatusBadge({ status, className }: SessionStatusBadgeProps) {
  const config = {
    draft: { variant: 'neutral' as const, label: 'Brouillon' },
    active: { variant: 'info' as const, label: 'En cours' },
    paused: { variant: 'warning' as const, label: 'En pause' },
    finished: { variant: 'success' as const, label: 'Terminée' },
  };

  const { variant, label } = config[status];
  return <StatusBadge variant={variant} label={label} className={className} />;
}

export interface UserRoleBadgeProps {
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = {
    ADMIN: { variant: 'error' as const, label: 'Administrateur' },
    TEACHER: { variant: 'info' as const, label: 'Enseignant' },
    STUDENT: { variant: 'default' as const, label: 'Étudiant' },
  };

  const { variant, label } = config[role];
  return <StatusBadge variant={variant} label={label} className={className} />;
}

export interface DecisionStatusBadgeProps {
  status: 'submitted' | 'pending' | 'locked' | 'draft';
  className?: string;
}

export function DecisionStatusBadge({ status, className }: DecisionStatusBadgeProps) {
  const config = {
    submitted: { variant: 'success' as const, label: 'Soumises' },
    draft: { variant: 'info' as const, label: 'Brouillon' },
    pending: { variant: 'warning' as const, label: 'En attente' },
    locked: { variant: 'error' as const, label: 'Verrouillées' },
  };

  const { variant, label } = config[status];
  return <StatusBadge variant={variant} label={label} className={className} />;
}

export interface ISOBadgeProps {
  certified: boolean;
  className?: string;
}

export function ISOBadge({ certified, className }: ISOBadgeProps) {
  if (!certified) return null;
  
  return (
    <StatusBadge
      variant="success"
      label="ISO 9001 ✓"
      className={className}
    />
  );
}
