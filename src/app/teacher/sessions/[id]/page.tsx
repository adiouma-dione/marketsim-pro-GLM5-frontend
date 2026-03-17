// ============================================================
// MarketSim Pro - Session Index Page (Redirect)
// ============================================================

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSession } from '@/lib/hooks/use-sessions';
import { ROUTES } from '@/lib/constants';

export default function SessionIndexPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { data: session, isLoading } = useSession(sessionId);

  React.useEffect(() => {
    if (isLoading || !session) return;
    if (session.status === 'draft') {
      router.replace(ROUTES.TEACHER_SETUP(sessionId));
      return;
    }
    router.replace(ROUTES.TEACHER_MONITOR(sessionId));
  }, [isLoading, session, router, sessionId]);

  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}
