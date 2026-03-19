// ============================================================
// MarketSim Pro - Monitor Table Component
// ============================================================

'use client';

import * as React from 'react';
import { Award, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { DecisionStatusBadge } from '@/components/ui/status-badge';
import { formatCurrency, formatPercentage, formatPercent } from '@/lib/utils';
import type { ControlMonitorRow } from '@/lib/types';

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface MonitorTableProps {
  rows: ControlMonitorRow[];
  currentRound: number;
  className?: string;
}

export function MonitorTable({ rows, currentRound, className }: MonitorTableProps) {
  // Sort rows by rank
  const sortedRows = [...rows].sort((a, b) => a.rank - b.rank);

  // Calculate submission progress
  const submittedCount = rows.filter((r) => r.decisions_submitted).length;
  const totalCount = rows.length;
  const progressPercent = totalCount > 0 ? (submittedCount / totalCount) * 100 : 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            État des équipes — Tour {currentRound}
          </h3>
          <p className="text-sm text-gray-500">
            {submittedCount}/{totalCount} équipes ont soumis leurs décisions
          </p>
          <p className="text-xs text-gray-400 mt-1">
            `Décisions` correspond au tour en cours. `Rang`, `PDM`, `QHSE` et `RSE`
            correspondent au dernier tour déjà simulé.
          </p>
        </div>
        <div className="w-48">
          <Progress value={progressPercent} className="h-2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12"></TableHead>
              <TableHead className="text-center">Rang</TableHead>
              <TableHead>Équipe</TableHead>
              <TableHead className="text-center">Décisions</TableHead>
              <TableHead className="text-right tabular-nums">Trésorerie</TableHead>
              <TableHead className="text-right tabular-nums">PDM</TableHead>
              <TableHead className="text-center tabular-nums">QHSE</TableHead>
              <TableHead className="text-center">RSE</TableHead>
              <TableHead className="text-center">ISO</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                  Aucune équipe configurée
                </TableCell>
              </TableRow>
            ) : (
              sortedRows.map((row) => (
                <TableRow
                  key={row.team_id}
                  className={cn(
                    !row.decisions_submitted && 'bg-amber-50/50'
                  )}
                >
                  {/* Color dot */}
                  <TableCell>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: row.team_color || '#3B82F6' }}
                    />
                  </TableCell>

                  {/* Rank */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.rank <= 3 ? (
                        <span
                          className={cn(
                            'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                            row.rank === 1 && 'bg-amber-100 text-amber-700',
                            row.rank === 2 && 'bg-gray-100 text-gray-600',
                            row.rank === 3 && 'bg-orange-100 text-orange-700'
                          )}
                        >
                          {row.rank === 1 ? '🏆' : row.rank}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">{row.rank}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Team name */}
                  <TableCell className="font-medium text-gray-900">
                    {row.team_name}
                  </TableCell>

                  {/* Decision status */}
                  <TableCell className="text-center">
                    <DecisionStatusBadge
                      status={row.decisions_submitted ? 'submitted' : 'pending'}
                    />
                  </TableCell>

                  {/* Cash */}
                  <TableCell className="text-right tabular-nums">
                    <span
                      className={cn(
                        row.cash < 0 ? 'text-red-600' : 'text-gray-900'
                      )}
                    >
                      {formatCurrency(row.cash)}
                    </span>
                  </TableCell>

                  {/* Market share */}
                  <TableCell className="text-right tabular-nums">
                    {formatPercentage(row.market_share)}
                  </TableCell>

                  {/* QHSE Score */}
                  <TableCell className="text-center tabular-nums">
                    <span
                      className={cn(
                        row.qhse_score >= 80
                          ? 'text-green-600'
                          : row.qhse_score >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                      )}
                    >
                      {formatPercent(row.qhse_score, 0)}
                    </span>
                  </TableCell>

                  {/* RSE Score */}
                  <TableCell className="text-center tabular-nums">
                    <span
                      className={cn(
                        row.rse_score >= 80
                          ? 'text-green-600'
                          : row.rse_score >= 50
                            ? 'text-amber-600'
                            : 'text-red-600'
                      )}
                    >
                      {formatPercent(row.rse_score, 0)}
                    </span>
                  </TableCell>

                  {/* ISO Badge */}
                  <TableCell className="text-center">
                    {row.iso_certified ? (
                      <div className="flex items-center justify-center gap-1">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          {row.iso_badge}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Incident Log Component
// ------------------------------------------------------------

interface ControlMonitorIncident {
  team_id: string;
  team_name: string;
  round_number: number;
  audit_triggered: boolean;
  accident: boolean;
  non_conformity: boolean;
  penalty: number;
  subsidy: number;
}

interface IncidentLogProps {
  incidents: ControlMonitorIncident[];
  className?: string;
}

export function IncidentLog({ incidents, className }: IncidentLogProps) {
  if (incidents.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <h4 className="text-sm font-medium text-gray-700">Incidents récents</h4>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {incidents.map((incident, index) => (
          <div
            key={`${incident.team_id}-${index}`}
            className="flex items-center gap-2 text-sm p-2 bg-amber-50 rounded-md"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <span className="font-medium text-gray-700">
              {incident.team_name}
            </span>
            <div className="flex items-center gap-1">
              {incident.audit_triggered && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                  Audit
                </span>
              )}
              {incident.accident && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                  Accident
                </span>
              )}
              {incident.non_conformity && (
                <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
                  NC
                </span>
              )}
            </div>
            {incident.penalty > 0 && (
              <span className="text-xs text-red-600 ml-auto">
                -{formatCurrency(incident.penalty)}
              </span>
            )}
            {incident.subsidy > 0 && (
              <span className="text-xs text-green-600 ml-auto">
                +{formatCurrency(incident.subsidy)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
