// ============================================================
// MarketSim Pro - Leaderboard Table Component
// ============================================================

'use client';

import * as React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Minus,
  Trophy,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency, formatPercent } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface LeaderboardTeam {
  team_id: string;
  team_name: string;
  team_color?: string;
  rank: number;
  rank_delta?: number;
  score?: number;
  market_share_pct?: number;
  cash?: number;
  debt?: number;
}

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface LeaderboardTableProps {
  teams: LeaderboardTeam[];
  currentTeamId?: string;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function LeaderboardTable({
  teams,
  currentTeamId,
}: LeaderboardTableProps) {
  // Sort teams by rank
  const sortedTeams = React.useMemo(() => {
    return [...teams].sort((a, b) => a.rank - b.rank);
  }, [teams]);

  // Render rank delta
  const renderRankDelta = (delta?: number) => {
    if (delta === undefined || delta === 0) {
      return (
        <Minus className="h-4 w-4 text-gray-400" />
      );
    }

    if (delta > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ChevronUp className="h-4 w-4" />
          <span className="text-xs font-medium">+{delta}</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-red-600">
        <ChevronDown className="h-4 w-4" />
        <span className="text-xs font-medium">{delta}</span>
      </div>
    );
  };

  // Get rank badge
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-yellow-100 text-yellow-700 font-bold text-sm">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-600 font-bold text-sm">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
          3
        </span>
      );
    }
    return (
      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 text-gray-500 font-medium text-sm">
        {rank}
      </span>
    );
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[80px]">Rang</TableHead>
            <TableHead>Équipe</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">PdM</TableHead>
            <TableHead className="text-right">Trésorerie</TableHead>
            <TableHead className="text-right">Dette</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTeams.map((team) => {
            const isCurrentTeam = team.team_id === currentTeamId;

            return (
              <TableRow
                key={team.team_id}
                className={cn(
                  isCurrentTeam && 'bg-blue-50 border-l-4 border-blue-600'
                )}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getRankBadge(team.rank)}
                    {renderRankDelta(team.rank_delta)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: team.team_color || '#6B7280' }}
                    />
                    <span
                      className={cn(
                        'font-medium',
                        isCurrentTeam && 'text-blue-700'
                      )}
                    >
                      {team.team_name}
                      {isCurrentTeam && (
                        <span className="ml-2 text-xs text-blue-500">
                          (vous)
                        </span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {team.score?.toLocaleString('fr-FR') ?? '-'}
                </TableCell>
                <TableCell className="text-right">
                  {team.market_share_pct !== undefined
                    ? formatPercent(team.market_share_pct)
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  {team.cash !== undefined ? formatCurrency(team.cash) : '-'}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right',
                    team.debt && team.debt > 0 && 'text-red-600'
                  )}
                >
                  {team.debt !== undefined ? formatCurrency(team.debt) : '-'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
