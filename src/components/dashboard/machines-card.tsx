// ============================================================
// MarketSim Pro - Machines Card Component
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Settings2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MachineBadge } from '@/components/ui/machine-badge';
import { ROUTES } from '@/lib/constants';
import { getMachineDeliveryRound } from '@/lib/machines';
import type { MachineData, MachineType } from '@/lib/types';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface MachinesCardProps {
  machines: MachineData[];
  sessionId?: string;
  teamId?: string;
}

// ------------------------------------------------------------
// Machines Card Component
// ------------------------------------------------------------

export function MachinesCard({ machines, sessionId, teamId }: MachinesCardProps) {
  const router = useRouter();

  // Group machines by type
  const machinesByType = machines.reduce(
    (acc, machine) => {
      const type = machine.machine_type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(machine);
      return acc;
    },
    {} as Record<MachineType, MachineData[]>
  );

  const machineTypes = Object.keys(machinesByType) as MachineType[];

  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            Parc machines
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {machines.length} machine{machines.length > 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {machines.length === 0 ? (
          <div className="text-center py-6">
            <Settings2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucune machine acquise
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Rendez-vous dans Mes Décisions pour investir
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Machine Types Grid */}
            <div className="grid grid-cols-1 gap-2">
              {machineTypes.map((type) => {
                const machinesOfType = machinesByType[type];
                const activeCount = machinesOfType.filter((m) => m.is_active).length;
                const pendingMachines = machinesOfType.filter((m) => !m.is_active);

                return (
                  <div key={type} className="p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <MachineBadge type={type} />
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {machinesOfType.length}
                        </span>
                        {activeCount < machinesOfType.length && (
                          <span className="text-xs text-amber-600">
                            ({activeCount} active{activeCount > 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>
                    {pendingMachines.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {pendingMachines.map((machine) => (
                          <Badge
                            key={machine.id}
                            variant="outline"
                            className="border-amber-300 bg-amber-100 text-amber-800"
                          >
                            En livraison • Tour {getMachineDeliveryRound(machine.machine_type, machine.purchase_round)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pending hint */}
            {machines.some((machine) => !machine.is_active) && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Les machines non actives ne comptent pas encore dans votre capacité de production.
              </div>
            )}

            {/* Total Capacity */}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Capacité totale</span>
                <span className="font-medium">
                  {machines
                    .filter((m) => m.is_active)
                    .reduce((sum, m) => sum + (m.quantity || 1) * getCapacity(m.machine_type), 0)
                    .toLocaleString('fr-FR')}{' '}
                  unités/tour
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => router.push(`${ROUTES.STUDENT_DECISIONS}#machines`)}
        >
          Gérer mes machines
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function getCapacity(type: MachineType): number {
  const capacities: Record<MachineType, number> = {
    basic: 1000,
    standard: 700,
    premium: 400,
  };
  return capacities[type] || 0;
}

// ------------------------------------------------------------
// Skeleton Version
// ------------------------------------------------------------

export function MachinesCardSkeleton() {
  return (
    <Card className="bg-white border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-8 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="h-9 mt-4 bg-gray-100 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
