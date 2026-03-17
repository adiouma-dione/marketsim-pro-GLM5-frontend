// ============================================================
// MarketSim Pro - Financial Tabs Component
// ============================================================

'use client';

import * as React from 'react';
import { FileText, Scale, Banknote, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  PivotTable,
  incomeStatementRows,
  balanceSheetRows,
  cashFlowRows,
} from './pivot-table';
import { formatCurrency } from '@/lib/utils';
import type { TeamFinancials, IncomeStatement, BalanceSheet, CashFlowStatement } from '@/lib/types';

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface FinancialTabsProps {
  financials: TeamFinancials;
  teamName: string;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function FinancialTabs({ financials, teamName }: FinancialTabsProps) {
  const [useKilo, setUseKilo] = React.useState(false);
  const divisor = useKilo ? 1000 : 1;

  // Export CSV
  const handleExportCSV = () => {
    const allRounds = financials.income_statements.map((is) => is.round_number);
    
    // Build CSV header
    let csv = 'Poste,' + allRounds.map((r) => `T${r}`).join(',') + '\n';
    
    // Income Statement
    csv += '\nCompte de résultat\n';
    incomeStatementRows.forEach((row) => {
      if (!row.key) return;
      csv += row.label + ',';
      csv += allRounds.map((round) => {
        const data = financials.income_statements.find((is) => is.round_number === round);
        if (!data) return '';
        const keys = row.key.split('.');
        let value: unknown = data;
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key];
        }
        return typeof value === 'number' ? String(value / divisor) : '';
      }).join(',');
      csv += '\n';
    });

    // Balance Sheet
    csv += '\nBilan\n';
    balanceSheetRows.forEach((row) => {
      if (!row.key) return;
      csv += row.label + ',';
      csv += allRounds.map((round) => {
        const data = financials.balance_sheets.find((bs) => bs.round_number === round);
        if (!data) return '';
        const keys = row.key.split('.');
        let value: unknown = data;
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key];
        }
        return typeof value === 'number' ? String(value / divisor) : '';
      }).join(',');
      csv += '\n';
    });

    // Cash Flow
    csv += '\nCash-flow\n';
    cashFlowRows.forEach((row) => {
      if (!row.key) return;
      csv += row.label + ',';
      csv += allRounds.map((round) => {
        const data = financials.cash_flows.find((cf) => cf.round_number === round);
        if (!data) return '';
        const keys = row.key.split('.');
        let value: unknown = data;
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key];
        }
        return typeof value === 'number' ? String(value / divisor) : '';
      }).join(',');
      csv += '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financials_${teamName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // Prepare data for pivot tables
  // Use unknown type to allow nested objects for pivot table processing
  const incomeData = financials.income_statements.map((is) => ({
    ...is,
  })) as unknown as Record<string, number>[];

  const balanceData = financials.balance_sheets.map((bs) => ({
    ...bs,
  })) as unknown as Record<string, number>[];

  const cashFlowData = financials.cash_flows.map((cf) => ({
    ...cf,
  })) as unknown as Record<string, number>[];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="kilo-mode"
              checked={useKilo}
              onCheckedChange={setUseKilo}
            />
            <Label htmlFor="kilo-mode" className="text-sm">
              Afficher en k€
            </Label>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="income" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Compte de résultat</span>
            <span className="sm:hidden">P&L</span>
          </TabsTrigger>
          <TabsTrigger value="balance" className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Bilan</span>
            <span className="sm:hidden">Bilan</span>
          </TabsTrigger>
          <TabsTrigger value="cashflow" className="flex items-center gap-2">
            <Banknote className="h-4 w-4" />
            <span className="hidden sm:inline">Cash-flow</span>
            <span className="sm:hidden">CF</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="income" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Compte de résultat</CardTitle>
            </CardHeader>
            <CardContent>
              <PivotTable
                rows={incomeStatementRows}
                data={incomeData}
                keyField="round_number"
                divisor={divisor}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Bilan</CardTitle>
            </CardHeader>
            <CardContent>
              <PivotTable
                rows={balanceSheetRows}
                data={balanceData}
                keyField="round_number"
                divisor={divisor}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tableau de cash-flow</CardTitle>
            </CardHeader>
            <CardContent>
              <PivotTable
                rows={cashFlowRows}
                data={cashFlowData}
                keyField="round_number"
                divisor={divisor}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
