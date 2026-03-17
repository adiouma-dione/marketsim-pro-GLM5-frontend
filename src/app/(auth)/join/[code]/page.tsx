// ============================================================
// MarketSim Pro - Join Team Page
// ============================================================

'use client';

import { use } from 'react';
import { JoinFormWrapper } from '@/components/auth/join-form';

// ------------------------------------------------------------
// Page Props
// ------------------------------------------------------------

interface JoinPageProps {
  params: Promise<{
    code: string;
  }>;
}

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function JoinPage({ params }: JoinPageProps) {
  const { code } = use(params);

  return <JoinFormWrapper initialCode={code} />;
}
