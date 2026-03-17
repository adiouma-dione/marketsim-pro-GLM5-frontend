// ============================================================
// MarketSim Pro - Results Index Page (Redirect to Current Round)
// ============================================================

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/hooks/use-sessions';
import { ROUTES } from '@/lib/constants';

export default function ResultsIndexPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data: session, isLoading } = useSession(sessionId);

  React.useEffect(() => {
    if (isLoading || !session) return;
    const targetRound = Math.max(1, session.current_round || 1);
    router.replace(ROUTES.TEACHER_RESULTS(sessionId, targetRound));
  }, [isLoading, session, router, sessionId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">Session introuvable.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.TEACHER_SESSIONS)}>
          Retour aux sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
