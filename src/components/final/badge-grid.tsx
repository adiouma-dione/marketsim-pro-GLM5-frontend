// ============================================================
// MarketSim Pro - Badge Grid Component
// ============================================================

'use client';

import * as React from 'react';
import { Award, Lock, CheckCircle, Zap, Target, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { BadgeDefinition } from '@/lib/hooks/use-final-report';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface EarnedBadge {
  badge_id: string;
  earned_at: string;
}

interface BadgeGridProps {
  badges: BadgeDefinition[];
  earnedBadges: EarnedBadge[];
  className?: string;
}

// ------------------------------------------------------------
// Icon Mapping
// ------------------------------------------------------------

const iconMap: Record<string, React.ElementType> = {
  award: Award,
  lock: Lock,
  'check-circle': CheckCircle,
  zap: Zap,
  target: Target,
  'dollar-sign': DollarSign,
};

// ------------------------------------------------------------
// Rarity Styles
// ------------------------------------------------------------

const rarityStyles: Record<string, string> = {
  common: 'bg-gray-100 text-gray-700 border-gray-200',
  rare: 'bg-blue-100 text-blue-700 border-blue-200',
  epic: 'bg-amber-100 text-amber-700 border-amber-200',
};

const rarityEmojis: Record<string, string> = {
  common: '🥉',
  rare: '⭐',
  epic: '🏆',
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function BadgeGrid({ badges, earnedBadges, className }: BadgeGridProps) {
  const earnedBadgeIds = new Set(earnedBadges.map((b) => b.badge_id));

  const getIcon = (iconName: string): React.ElementType => {
    const IconComponent = iconMap[iconName.toLowerCase()] || Award;
    return IconComponent;
  };

  return (
    <Card className={cn('print:break-inside-avoid', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Badges obtenus
        </CardTitle>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucun badge disponible
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map((badge, index) => {
              const isEarned = earnedBadgeIds.has(badge.badge_id);
              const Icon = getIcon(badge.icon || 'award');
              const rarityStyle = rarityStyles[badge.rarity] || rarityStyles.common;
              const emoji = rarityEmojis[badge.rarity] || '';
              const badgeKey = badge.badge_id || badge.label || `badge-${index}`;

              return (
                <TooltipProvider key={badgeKey}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          'relative p-4 rounded-lg border-2 transition-all',
                          !isEarned && 'opacity-30 grayscale',
                          isEarned && 'ring-2 ring-offset-2 ring-amber-400'
                        )}
                      >
                        {/* Earned indicator */}
                        {isEarned && (
                          <div className="absolute -top-2 -right-2">
                            <span className="text-lg">{emoji}</span>
                          </div>
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            'h-12 w-12 mx-auto mb-2 rounded-full flex items-center justify-center',
                            isEarned ? 'bg-amber-100' : 'bg-gray-100'
                          )}
                        >
                          <Icon className={isEarned ? 'text-amber-600' : 'text-gray-400'} />
                        </div>

                        {/* Label */}
                        <p className="text-sm font-medium text-center text-gray-900">
                          {badge.label}
                        </p>

                        {/* Rarity badge */}
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs mt-1',
                            rarityStyle
                          )}
                        >
                          {badge.rarity}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="font-medium text-gray-900">{badge.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{badge.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="font-medium">Condition : </span>
                        {badge.condition}
                      </p>
                      {isEarned && (
                        <p className="text-xs text-green-600 mt-2">
                          ✓ Obtenu
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
