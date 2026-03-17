// ============================================================
// MarketSim Pro - Teacher Sessions Page
// ============================================================

'use client';

import * as React from 'react';
import { Plus, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { KPIGrid, KPICard, KPICardSkeleton } from '@/components/ui/kpi-card';
import { SessionCard, SessionCardSkeleton } from '@/components/sessions/session-card';
import { CreateSessionDialog } from '@/components/sessions/create-session-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useSessions, useDeleteSession } from '@/lib/hooks/use-sessions';
import type { GameSessionResponse } from '@/lib/types';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function TeacherSessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const deleteSession = useDeleteSession();

  // Count active sessions
  const activeCount =
    sessions?.filter((s) => s.status === 'active' || s.status === 'paused')
      .length || 0;

  // Handle session deletion
  const handleDelete = (sessionId: string) => {
    deleteSession.mutate(sessionId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <EmptyState
          icon={Gamepad2}
          title="Erreur de chargement"
          description="Impossible de charger les sessions. Veuillez réessayer."
          action={{
            label: 'Réessayer',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  // Empty state
  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Mes Sessions</h1>
            <p className="text-sm text-gray-500 mt-1">0 session active</p>
          </div>
          <CreateSessionDialog
            trigger={
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Créer une session
              </Button>
            }
          />
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center h-96">
          <EmptyState
            icon={Gamepad2}
            title="Aucune session"
            description="Créez votre première simulation pour commencer."
            action={{
              label: 'Créer une session',
              onClick: () => {},
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Mes Sessions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeCount} session{activeCount !== 1 ? 's' : ''} active
            {activeCount !== 1 ? 's' : ''}
          </p>
        </div>
        <CreateSessionDialog
          trigger={
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Créer une session
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <KPIGrid columns={4}>
        <KPICard
          title="Sessions actives"
          value={sessions.filter((s) => s.status === 'active').length.toString()}
          icon={Gamepad2}
          variant="info"
        />
        <KPICard
          title="En pause"
          value={sessions.filter((s) => s.status === 'paused').length.toString()}
          variant="warning"
        />
        <KPICard
          title="Terminées"
          value={sessions.filter((s) => s.status === 'finished').length.toString()}
          variant="success"
        />
        <KPICard
          title="Brouillons"
          value={sessions.filter((s) => s.status === 'draft').length.toString()}
          variant="default"
        />
      </KPIGrid>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <div key={session.id} className="group">
            <SessionCard
              session={session}
              onDelete={handleDelete}
              isDeleting={deleteSession.isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
