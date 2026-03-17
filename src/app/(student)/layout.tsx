// ============================================================
// MarketSim Pro - Student Layout
// ============================================================

'use client';

import * as React from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { StudentSidebar } from '@/components/layout/student-sidebar';

// ------------------------------------------------------------
// Layout Component
// ------------------------------------------------------------

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <StudentSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader />
        <main className="flex-1">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
