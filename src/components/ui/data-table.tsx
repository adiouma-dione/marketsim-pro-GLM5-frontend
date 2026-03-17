// ============================================================
// MarketSim Pro - Data Table Component
// ============================================================

'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  enableSorting?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
}

// ------------------------------------------------------------
// Sort Header Component
// ------------------------------------------------------------

interface SortHeaderProps {
  children: React.ReactNode;
  sorted?: 'asc' | 'desc' | false;
  onSort?: (event: unknown) => void;
  className?: string;
}

function SortHeader({ children, sorted, onSort, className }: SortHeaderProps) {
  return (
    <button
      type="button"
      onClick={onSort as () => void}
      className={cn(
        'flex items-center gap-1 text-xs font-medium text-gray-500 uppercase tracking-wider',
        'hover:text-gray-700 transition-colors',
        className
      )}
    >
      {children}
      {sorted === 'asc' && <ChevronUp className="h-3 w-3" />}
      {sorted === 'desc' && <ChevronDown className="h-3 w-3" />}
      {!sorted && <ChevronsUpDown className="h-3 w-3 opacity-50" />}
    </button>
  );
}

// ------------------------------------------------------------
// Loading Skeleton
// ------------------------------------------------------------

function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 px-4 py-3 bg-gray-50">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 px-4 py-3 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Empty State
// ------------------------------------------------------------

function TableEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ------------------------------------------------------------
// Pagination Component
// ------------------------------------------------------------

interface TablePaginationProps {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

function TablePagination({
  pageIndex,
  pageSize,
  pageCount,
  canPreviousPage,
  canNextPage,
  onPreviousPage,
  onNextPage,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <div className="text-sm text-gray-500">
        Page {pageIndex + 1} sur {pageCount || 1}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPreviousPage}
          disabled={!canPreviousPage}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Précédent
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canNextPage}
          className="h-8"
        >
          Suivant
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  enableSorting = true,
  enablePagination = false,
  pageSize = 10,
  className,
  emptyMessage = 'Aucune donnée disponible',
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: enablePagination ? setPagination : undefined,
    state: {
      sorting,
      columnFilters,
      pagination: enablePagination ? pagination : undefined,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
  });

  if (loading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm', className)}>
        <TableSkeleton columns={columns.length} />
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
              {headerGroup.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                return (
                  <TableHead key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : enableSorting && header.column.getCanSort() ? (
                      <SortHeader
                        sorted={sorted}
                        onSort={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </SortHeader>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={cn(
                  'border-b border-gray-100 transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <TableEmpty message={emptyMessage} />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {enablePagination && (
        <TablePagination
          pageIndex={table.getState().pagination.pageIndex}
          pageSize={table.getState().pagination.pageSize}
          pageCount={table.getPageCount()}
          canPreviousPage={table.getCanPreviousPage()}
          canNextPage={table.getCanNextPage()}
          onPreviousPage={table.previousPage}
          onNextPage={table.nextPage}
        />
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Exports for convenience
// ------------------------------------------------------------

export { createColumnHelper } from '@tanstack/react-table';
