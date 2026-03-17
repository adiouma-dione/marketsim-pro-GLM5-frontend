// ============================================================
// MarketSim Pro - Student Layout
// ============================================================

'use client';

import * as React from 'react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <main className="lg:ml-[220px] min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
