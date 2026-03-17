// ============================================================
// MarketSim Pro - Event Card Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LucideIcon } from 'lucide-react';
import {
  Zap,
  Truck,
  Receipt,
  Leaf,
  TrendingUp,
  TrendingDown,
  FileText,
  Cpu,
  AlertTriangle,
} from 'lucide-react';
import { EVENT_LABELS, SEVERITY_CONFIG } from '@/lib/constants';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface GameEvent {
  id: string;
  event_type: string;
  severity?: number;
  description: string;
  round_number?: number;
  created_at?: string;
}

export interface EventCardProps {
  event: GameEvent;
  showRound?: boolean;
  compact?: boolean;
  className?: string;
}

// ------------------------------------------------------------
// Icon Mapping
// ------------------------------------------------------------

const iconMap: Record<string, LucideIcon> = {
  energy_crisis: Zap,
  supplier_shortage: Truck,
  tax_change: Receipt,
  eco_subsidy: Leaf,
  economic_boom: TrendingUp,
  recession: TrendingDown,
  new_regulation: FileText,
  tech_disruption: Cpu,
};

// ------------------------------------------------------------
// Color Mapping
// ------------------------------------------------------------

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-600',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'text-orange-600',
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'text-purple-600',
  },
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function EventCard({
  event,
  showRound = false,
  compact = false,
  className,
}: EventCardProps) {
  const eventConfig = EVENT_LABELS[event.event_type] || {
    label: event.event_type,
    icon: AlertTriangle,
    color: 'amber',
  };

  const Icon = iconMap[event.event_type] || eventConfig.icon || AlertTriangle;
  const colors = colorMap[eventConfig.color] || colorMap.amber;

  const severityConfig = event.severity
    ? SEVERITY_CONFIG[event.severity]
    : null;

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border',
          colors.bg,
          colors.border,
          className
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', colors.icon)} />
        <span className="text-sm font-medium text-gray-900">
          {eventConfig.label}
        </span>
        {severityConfig && (
          <Badge
            variant="outline"
            className={cn('text-xs', severityConfig.bg, severityConfig.text)}
          >
            Niveau {event.severity}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'shadow-sm border-l-4',
        colors.border,
        colors.bg,
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg bg-white/50', colors.icon)}>
              <Icon className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-medium text-gray-900">
              {eventConfig.label}
            </CardTitle>
          </div>
          {severityConfig && (
            <Badge
              variant="outline"
              className={cn('text-xs', severityConfig.bg, severityConfig.text)}
            >
              Niveau {event.severity}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{event.description}</p>
        {showRound && event.round_number && (
          <p className="text-xs text-gray-400 mt-2">
            Tour {event.round_number}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Event List Component
// ------------------------------------------------------------

export interface EventListProps {
  events: GameEvent[];
  showRound?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function EventList({
  events,
  showRound = false,
  compact = false,
  emptyMessage = 'Aucun événement actif',
  className,
}: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          showRound={showRound}
          compact={compact}
        />
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Event Badge Component
// ------------------------------------------------------------

export interface EventBadgeProps {
  eventType: string;
  className?: string;
}

export function EventBadge({ eventType, className }: EventBadgeProps) {
  const config = EVENT_LABELS[eventType] || {
    label: eventType,
    color: 'amber',
  };

  const colors = colorMap[config.color] || colorMap.amber;
  const Icon = iconMap[eventType] || config.icon || AlertTriangle;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
        colors.bg,
        colors.icon,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// ------------------------------------------------------------
// Severity Indicator
// ------------------------------------------------------------

export interface SeverityIndicatorProps {
  severity: number;
  showLabel?: boolean;
  className?: string;
}

export function SeverityIndicator({
  severity,
  showLabel = true,
  className,
}: SeverityIndicatorProps) {
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG[1];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={cn(
              'w-2 h-4 rounded-sm',
              level <= severity ? config.bg : 'bg-gray-200'
            )}
          />
        ))}
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', config.text)}>
          Sévérité {severity}
        </span>
      )}
    </div>
  );
}
