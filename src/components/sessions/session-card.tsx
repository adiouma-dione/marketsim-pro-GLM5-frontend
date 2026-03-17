// ============================================================
// MarketSim Pro - Session Card Component
// ============================================================

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Calendar, Users, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SessionStatusBadge } from '@/components/ui/status-badge';
import { formatDate, formatDuration } from '@/lib/utils';
import type { GameSessionResponse, GameSessionStatus } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ------------------------------------------------------------
// Status Color Configuration
// ------------------------------------------------------------

const statusBorderColor: Record<GameSessionStatus, string> = {
  draft: 'border-l-gray-400',
  active: 'border-l-blue-500',
  paused: 'border-l-amber-500',
  finished: 'border-l-green-500',
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface SessionCardProps {
  session: GameSessionResponse;
  onDelete?: (sessionId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

export function SessionCard({
  session,
  onDelete,
  isDeleting = false,
  className,
}: SessionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    // Navigate based on session status
    if (session.status === 'draft') {
      router.push(`/teacher/sessions/${session.id}/setup`);
    } else {
      router.push(`/teacher/sessions/${session.id}/monitor`);
    }
  };

  return (
    <Card
      className={cn(
        'shadow-sm border-l-4 cursor-pointer transition-all hover:shadow-md',
        statusBorderColor[session.status],
        className
      )}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
            {session.name}
          </CardTitle>
          <SessionStatusBadge status={session.status} />
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>0 équipe(s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700">
              Tour {session.current_round}/{session.max_rounds}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatDuration(session.round_duration_minutes)}/tour</span>
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <Calendar className="h-3.5 w-3.5" />
          <span>Créée le {formatDate(session.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Ouvrir
            <ArrowRight className="h-4 w-4" />
          </Button>

          {/* Delete Button (only for draft sessions) */}
          {session.status === 'draft' && onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la session ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer la session "{session.name}" ?
                    Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(session.id);
                    }}
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Session Card Skeleton
// ------------------------------------------------------------

export function SessionCardSkeleton() {
  return (
    <Card className="shadow-sm border-l-4 border-l-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="h-3 w-32 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
