// ============================================================
// MarketSim Pro - P&L Table Component
// ============================================================

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import type { SessionResults, RoundResultData } from '@/lib/types';

interface PnLTableProps {
  sessionResults: SessionResults;
}

type TeamResultWithInfo = SessionResults['results'][number] & {
  result: RoundResultData;
};

export function PnLTable({ sessionResults }: PnLTableProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(
    sessionResults.results[0]?.result.team_id || null
  );

  const selectedTeamResult = sessionResults.results.find(
    (r) => r.result.team_id === selectedTeamId
  );

  if (!sessionResults.results.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compte de résultat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aucune donnée disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Compte de résultat</CardTitle>
        <Select
          value={selectedTeamId || ''}
          onValueChange={setSelectedTeamId}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sélectionner une équipe" />
          </SelectTrigger>
          <SelectContent>
            {sessionResults.results.map((teamResult) => (
              <SelectItem
                key={teamResult.result.team_id}
                value={teamResult.result.team_id}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: teamResult.team_color }}
                  />
                  {teamResult.team_name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {selectedTeamResult && (
          <PnLTableContent teamResult={selectedTeamResult} />
        )}
      </CardContent>
    </Card>
  );
}

function PnLTableContent({ teamResult }: { teamResult: TeamResultWithInfo }) {
  const result = teamResult.result;
  const grossMarginPercent = result.revenue > 0
    ? (result.gross_margin / result.revenue) * 100
    : 0;
  const ebitdaPercent = result.revenue > 0
    ? (result.ebitda / result.revenue) * 100
    : 0;
  const netMarginPercent = result.revenue > 0
    ? (result.net_income / result.revenue) * 100
    : 0;

  const rows: Array<{
    label: string;
    value: number;
    format: 'currency' | 'percent' | 'number';
    isHeader?: boolean;
    isTotal?: boolean;
    indent?: boolean;
    color?: 'green' | 'red' | 'neutral';
  }> = [
    { label: 'Chiffre d\'affaires', value: result.revenue, format: 'currency', isHeader: true },
    { label: 'Coût des marchandises (COGS)', value: result.cogs, format: 'currency', indent: true, color: 'red' },
    { label: 'Marge brute', value: result.gross_margin, format: 'currency', isTotal: true },
    { label: 'Taux de marge brute', value: grossMarginPercent, format: 'percent', indent: true },
    { label: 'Dépenses marketing', value: result.marketing_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'Dépenses administratives', value: result.admin_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'Dépenses maintenance', value: result.maintenance_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'Dépenses R&D', value: result.rd_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'Dépenses QHSE', value: result.qhse_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'Dépenses RH', value: result.hr_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'EBITDA', value: result.ebitda, format: 'currency', isTotal: true },
    { label: 'Taux EBITDA', value: ebitdaPercent, format: 'percent', indent: true },
    { label: 'Amortissements', value: result.depreciation, format: 'currency', indent: true, color: 'red' },
    { label: 'EBIT', value: result.ebit, format: 'currency', isTotal: true },
    { label: 'Charges d\'intérêts', value: result.interest_expense, format: 'currency', indent: true, color: 'red' },
    { label: 'Résultat net', value: result.net_income, format: 'currency', isTotal: true },
    { label: 'Marge nette', value: netMarginPercent, format: 'percent', indent: true },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Poste</TableHead>
          <TableHead className="text-right">Montant</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => {
          const colorClass = row.color === 'green'
            ? 'text-green-600'
            : row.color === 'red'
              ? 'text-red-600'
              : row.isTotal && row.value >= 0
                ? 'text-green-600'
                : row.isTotal
                  ? 'text-red-600'
                  : '';

          return (
            <TableRow
              key={index}
              className={`
                ${row.isHeader ? 'bg-muted/50 font-semibold' : ''}
                ${row.isTotal ? 'bg-muted/30 font-semibold border-t-2' : ''}
              `}
            >
              <TableCell
                className={`
                  ${row.indent ? 'pl-8' : ''}
                  ${row.isTotal ? 'font-semibold' : ''}
                `}
              >
                {row.label}
              </TableCell>
              <TableCell className={`text-right ${colorClass}`}>
                {row.format === 'currency' && formatCurrency(row.value)}
                {row.format === 'percent' && formatPercent(row.value)}
                {row.format === 'number' && formatNumber(row.value)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ------------------------------------------------------------
// Comparative P&L Table (all teams side by side)
// ------------------------------------------------------------

interface ComparativePnLTableProps {
  sessionResults: SessionResults;
}

export function ComparativePnLTable({ sessionResults }: ComparativePnLTableProps) {
  if (!sessionResults.results.length) {
    return null;
  }

  const teams = sessionResults.results;

  const metrics: Array<{
    label: string;
    key: keyof RoundResultData;
    format: 'currency' | 'percent' | 'number';
  }> = [
    { label: 'Chiffre d\'affaires', key: 'revenue', format: 'currency' },
    { label: 'COGS', key: 'cogs', format: 'currency' },
    { label: 'Marge brute', key: 'gross_margin', format: 'currency' },
    { label: 'EBITDA', key: 'ebitda', format: 'currency' },
    { label: 'EBIT', key: 'ebit', format: 'currency' },
    { label: 'Résultat net', key: 'net_income', format: 'currency' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Comparaison des résultats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background">Métrique</TableHead>
                {teams.map((team) => (
                  <TableHead key={team.result.team_id} className="text-right min-w-[120px]">
                    <div className="flex items-center justify-end gap-2">
                      <span
                        className="h-3 w-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: team.team_color }}
                      />
                      <span className="truncate">{team.team_name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.key}>
                  <TableCell className="font-medium sticky left-0 bg-background">
                    {metric.label}
                  </TableCell>
                  {teams.map((team) => {
                    const value = team.result[metric.key] as number;
                    const isNegative = value < 0;

                    return (
                      <TableCell
                        key={team.result.team_id}
                        className={`text-right ${isNegative ? 'text-red-600' : ''}`}
                      >
                        {metric.format === 'currency' && formatCurrency(value)}
                        {metric.format === 'percent' && formatPercent(value)}
                        {metric.format === 'number' && formatNumber(value)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
