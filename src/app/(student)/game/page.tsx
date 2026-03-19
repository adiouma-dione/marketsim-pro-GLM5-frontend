// ============================================================
// MarketSim Pro - Game Root Redirect
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

export default function GameRootPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/game/dashboard');
  }, [router]);

  return null;
}
