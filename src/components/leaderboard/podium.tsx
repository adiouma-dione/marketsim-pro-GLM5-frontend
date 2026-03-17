// ============================================================
// MarketSim Pro - Podium Component (Top 3)
// ============================================================

'use client';

import * as React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface PodiumTeam {
  team_id: string;
  team_name: string;
  team_color?: string;
  score?: number;
}

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface PodiumProps {
  teams: PodiumTeam[];
  currentTeamId?: string;
}

// ------------------------------------------------------------
// Medal Icons
// ------------------------------------------------------------

const medalIcons = [
  { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-100' }, // 1st - Gold
  { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100' }, // 2nd - Silver
  { icon: Award, color: 'text-amber-600', bg: 'bg-amber-100' }, // 3rd - Bronze
];

const medalEmojis = ['🥇', '🥈', '🥉'];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function Podium({ teams, currentTeamId }: PodiumProps) {
  if (teams.length === 0) {
    return null;
  }

  // Get top 3 (they should already be sorted by rank)
  const top3 = teams.slice(0, 3);
  
  // Reorder for display: 2nd, 1st, 3rd
  const displayOrder = [
    top3[1], // 2nd place (index 1)
    top3[0], // 1st place (index 0)
    top3[2], // 3rd place (index 2)
  ].filter(Boolean);

  // Heights for podium
  const heights = [80, 100, 60]; // 2nd, 1st, 3rd

  return (
    <div className="flex items-end justify-center gap-2 py-6">
      {displayOrder.map((team, displayIndex) => {
        if (!team) return null;
        
        // Map display index back to actual rank
        const actualRank = displayIndex === 0 ? 2 : displayIndex === 1 ? 1 : 3;
        const rankIndex = actualRank - 1;
        const height = heights[displayIndex];
        const isCurrentTeam = team.team_id === currentTeamId;
        const MedalIcon = medalIcons[rankIndex]?.icon || Award;

        return (
          <div
            key={team.team_id}
            className="flex flex-col items-center"
            style={{ minHeight: `${height + 80}px` }}
          >
            {/* Team Info */}
            <div className="mb-2 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl">{medalEmojis[rankIndex]}</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: team.team_color || '#6B7280' }}
                />
                <span
                  className={cn(
                    'text-sm font-medium truncate max-w-[80px]',
                    isCurrentTeam && 'text-blue-600 font-semibold'
                  )}
                >
                  {team.team_name}
                </span>
              </div>
              {team.score !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatNumber(team.score)} pts
                </p>
              )}
            </div>

            {/* Podium Block */}
            <div
              className={cn(
                'w-24 rounded-t-lg flex items-center justify-center',
                actualRank === 1 && 'bg-yellow-100 border-2 border-yellow-300',
                actualRank === 2 && 'bg-gray-100 border-2 border-gray-300',
                actualRank === 3 && 'bg-amber-100 border-2 border-amber-300',
                isCurrentTeam && 'ring-2 ring-blue-500'
              )}
              style={{ height: `${height}px` }}
            >
              <span className="text-3xl font-bold text-gray-700">
                {actualRank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
