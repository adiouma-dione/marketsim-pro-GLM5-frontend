// ============================================================
// MarketSim Pro - Register Page (Redirect to Login with Register Tab)
// ============================================================

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page with register tab active
    router.replace('/login?tab=register');
  }, [router]);

  return null;
}
