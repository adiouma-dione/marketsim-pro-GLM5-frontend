// ============================================================
// MarketSim Pro - Game Root Redirect
// ============================================================

import { redirect } from 'next/navigation';

export default function GameRootPage() {
  redirect('/game/dashboard');
}
