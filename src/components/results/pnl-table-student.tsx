// ============================================================
// MarketSim Pro - Student P&L Table with Comparison
// ============================================================

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import type { RoundResultData } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface PnlTableStudentProps {
  currentResult: RoundResultData;
  previousResult?: RoundResultData;
  currentRound: number;
}

// ------------------------------------------------------------
// P&L Row Definition
// ------------------------------------------------------------

interface PnlRow {
  label: string;
  currentKey: keyof RoundResultData;
  previousKey?: keyof RoundResultData;
  isTotal?: boolean;
  isSubtotal?: boolean;
}

const pnlRows: PnlRow[] = [
  { label: 'Chiffre d\'affaires', currentKey: 'revenue' },
  { label: 'Coût des marchandises', currentKey: 'cogs' },
  { label: 'Marge brute', currentKey: 'gross_margin', isSubtotal: true },
  { label: 'Dépenses marketing', currentKey: 'marketing_expense' },
  { label: 'Frais administratifs', currentKey: 'admin_expense' },
  { label: 'EBITDA', currentKey: 'ebitda', isTotal: true },
  { label: 'Amortissements', currentKey: 'depreciation' },
  { label: 'EBIT', currentKey: 'ebit', isSubtotal: true },
  { label: 'Charges financières', currentKey: 'interest_expense' },
  { label: 'Résultat net', currentKey: 'net_income', isTotal: true },
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function PnlTableStudent({
  currentResult,
  previousResult,
  currentRound,
}: PnlTableStudentProps) {
  const previousRound = currentRound - 1;

  const getValue = (
    result: RoundResultData | undefined,
    key: keyof RoundResultData
  ): number => {
    if (!result) return 0;
    return result[key] as number;
  };

  const formatValue = (value: number): React.ReactNode => {
    const formatted = formatCurrency(Math.abs(value));
    const isNegative = value < 0;
    return (
      <span className={isNegative ? 'text-red-600' : ''}>
        {isNegative ? '-' : ''}{formatted}
      </span>
    );
  };

  const getDelta = (current: number, previous: number): React.ReactNode => {
    if (!previous || previous === 0) return null;
    const delta = current - previous;
    const deltaPercent = ((delta / Math.abs(previous)) * 100).toFixed(1);
    
    if (delta === 0) return null;
    
    return (
      <span
        className={`text-xs ml-2 ${
          delta > 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {delta > 0 ? '+' : ''}{deltaPercent}%
      </span>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Compte de résultat</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Poste</TableHead>
              <TableHead className="text-right">Tour {currentRound}</TableHead>
              {previousResult && (
                <TableHead className="text-right">Tour {previousRound}</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pnlRows.map((row) => {
              const currentValue = getValue(currentResult, row.currentKey);
              const previousValue = previousResult
                ? getValue(previousResult, row.currentKey)
                : 0;

              return (
                <TableRow
                  key={row.currentKey}
                  className={
                    row.isTotal
                      ? 'bg-gray-50 font-semibold'
                      : row.isSubtotal
                      ? 'bg-blue-50/50'
                      : ''
                  }
                >
                  <TableCell
                    className={`font-medium ${
                      row.isTotal ? 'font-semibold' : ''
                    }`}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatValue(currentValue)}
                    {previousResult && getDelta(currentValue, previousValue)}
                  </TableCell>
                  {previousResult && (
                    <TableCell className="text-right text-gray-500">
                      {formatValue(previousValue)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
