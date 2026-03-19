'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useMyTeam, useSessionStatus } from '@/lib/hooks/use-team-dashboard';
import { ROUTES } from '@/lib/constants';

export default function StudentResultsIndexPage() {
  const router = useRouter();
  const { data: myTeamData, isLoading: teamLoading } = useMyTeam();
  const sessionId = myTeamData?.session_id;
  const { data: sessionData, isLoading: sessionLoading } = useSessionStatus(sessionId || '');

  React.useEffect(() => {
    if (teamLoading || sessionLoading) {
      return;
    }

    if (!myTeamData) {
      router.replace(ROUTES.JOIN);
      return;
    }

    if (!sessionData) {
      return;
    }

    const targetRound =
      sessionData.status === 'finished'
        ? Math.max(1, sessionData.current_round)
        : Math.max(1, sessionData.current_round - 1);

    router.replace(`/game/results/${targetRound}`);
  }, [myTeamData, router, sessionData, sessionLoading, teamLoading]);

  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
