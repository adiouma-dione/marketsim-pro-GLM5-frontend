// ============================================================
// MarketSim Pro - Financial Pivot Table Component
// ============================================================

'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

export interface PivotRow {
  label: string;
  key: string;
  isTotal?: boolean;
  isSubtotal?: boolean;
  indent?: boolean;
}

interface PivotTableProps {
  rows: PivotRow[];
  data: Record<string, number>[];
  keyField: string;
  roundPrefix?: string;
  divisor?: number;
  className?: string;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function PivotTable({
  rows,
  data,
  keyField,
  roundPrefix = 'T',
  divisor = 1,
  className,
}: PivotTableProps) {
  // Get all rounds dynamically from data
  const rounds = React.useMemo(() => {
    return data.map((item) => item[keyField] as number).sort((a, b) => a - b);
  }, [data, keyField]);

  // Get value for a specific row and round
  const getValue = (rowKey: string, round: number): number | undefined => {
    const roundData = data.find((item) => item[keyField] === round);
    if (!roundData) return undefined;
    
    // Handle nested keys like 'assets.cash'
    const keys = rowKey.split('.');
    let value: unknown = roundData;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined;
      }
    }
    return typeof value === 'number' ? value : undefined;
  };

  // Format value with divisor and negative styling
  const formatValue = (value: number | undefined): React.ReactNode => {
    if (value === undefined) return '-';
    
    const adjustedValue = value / divisor;
    const formatted = formatCurrency(Math.abs(adjustedValue));
    const isNegative = adjustedValue < 0;
    
    return (
      <span className={cn(isNegative && 'text-red-600')}>
        {isNegative ? '-' : ''}{formatted}
      </span>
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-white min-w-[200px]">
              Poste
            </TableHead>
            {rounds.map((round) => (
              <TableHead key={round} className="text-right min-w-[100px]">
                {roundPrefix}{round}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row.key || 'row'}-${index}`}
              className={cn(
                row.isTotal && 'bg-gray-50 font-semibold',
                row.isSubtotal && 'bg-blue-50/50'
              )}
            >
              <TableCell
                className={cn(
                  'sticky left-0 bg-white',
                  row.isTotal && 'font-semibold',
                  row.indent && 'pl-6'
                )}
              >
                {row.label}
              </TableCell>
              {rounds.map((round) => {
                const value = getValue(row.key, round);
                return (
                  <TableCell
                    key={`${row.key}-${round}`}
                    className={cn(
                      'text-right',
                      value !== undefined && value / divisor < 0 && 'bg-red-50'
                    )}
                  >
                    {formatValue(value)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ------------------------------------------------------------
// Income Statement Rows
// ------------------------------------------------------------

export const incomeStatementRows: PivotRow[] = [
  { label: 'Chiffre d\'affaires', key: 'revenue' },
  { label: 'Coût des marchandises', key: 'cogs' },
  { label: 'Marge brute', key: 'gross_margin', isSubtotal: true },
  { label: 'Dépenses marketing', key: 'marketing_expense' },
  { label: 'Frais administratifs', key: 'admin_expense' },
  { label: 'EBITDA', key: 'ebitda', isTotal: true },
  { label: 'Amortissements', key: 'depreciation' },
  { label: 'EBIT', key: 'ebit', isSubtotal: true },
  { label: 'Charges financières', key: 'interest_expense' },
  { label: 'Résultat net', key: 'net_income', isTotal: true },
];

// ------------------------------------------------------------
// Balance Sheet Rows
// ------------------------------------------------------------

export const balanceSheetRows: PivotRow[] = [
  { label: 'ACTIFS', key: '', isTotal: true },
  { label: 'Trésorerie', key: 'assets.cash', indent: true },
  { label: 'Créances clients', key: 'assets.accounts_receivable', indent: true },
  { label: 'Stocks', key: 'assets.inventory', indent: true },
  { label: 'Immobilisations', key: 'assets.fixed_assets', indent: true },
  { label: 'Total actifs', key: 'assets.total', isSubtotal: true },
  { label: 'PASSIFS', key: '', isTotal: true },
  { label: 'Dettes', key: 'liabilities.debt', indent: true },
  { label: 'Dettes fournisseurs', key: 'liabilities.accounts_payable', indent: true },
  { label: 'Total passifs', key: 'liabilities.total', isSubtotal: true },
  { label: 'Capitaux propres', key: 'equity', isTotal: true },
];

// ------------------------------------------------------------
// Cash Flow Rows
// ------------------------------------------------------------

export const cashFlowRows: PivotRow[] = [
  { label: 'Flux opérationnels', key: 'operating_cash_flow' },
  { label: 'Flux d\'investissement', key: 'investing_cash_flow' },
  { label: 'Flux de financement', key: 'financing_cash_flow' },
  { label: 'Flux net de trésorerie', key: 'net_cash_flow', isTotal: true },
  { label: 'Trésorerie début', key: 'beginning_cash' },
  { label: 'Trésorerie fin', key: 'ending_cash', isTotal: true },
];
