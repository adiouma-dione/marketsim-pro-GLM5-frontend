// ============================================================
// MarketSim Pro - Empty State Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} variant="default">
          {action.label}
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Preset Empty States
// ------------------------------------------------------------

export function NoDataState({ className }: { className?: string }) {
  return (
    <EmptyState
      title="Aucune donnée"
      description="Il n'y a pas encore de données à afficher."
      className={className}
    />
  );
}

export function NoResultsState({
  searchTerm,
  className,
}: {
  searchTerm?: string;
  className?: string;
}) {
  return (
    <EmptyState
      title="Aucun résultat"
      description={
        searchTerm
          ? `Aucun résultat pour "${searchTerm}"`
          : 'Aucun résultat ne correspond à votre recherche.'
      }
      className={className}
    />
  );
}

export function NoTeamsState({ className }: { className?: string }) {
  return (
    <EmptyState
      title="Aucune équipe"
      description="Créez des équipes pour commencer la simulation."
      className={className}
    />
  );
}

export function NoDecisionsState({ className }: { className?: string }) {
  return (
    <EmptyState
      title="Aucune décision"
      description="Les équipes n'ont pas encore soumis de décisions pour ce tour."
      className={className}
    />
  );
}

export function NoNotificationsState({ className }: { className?: string }) {
  return (
    <EmptyState
      title="Aucune notification"
      description="Vous n'avez pas de nouvelles notifications."
      className={className}
    />
  );
}

export function ComingSoonState({
  feature,
  className,
}: {
  feature?: string;
  className?: string;
}) {
  return (
    <EmptyState
      title="Bientôt disponible"
      description={
        feature
          ? `La fonctionnalité "${feature}" sera bientôt disponible.`
          : 'Cette fonctionnalité sera bientôt disponible.'
      }
      className={className}
    />
  );
}
