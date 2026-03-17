// ============================================================
// MarketSim Pro - Teacher Layout
// ============================================================

import type { ReactNode } from 'react';
import { TeacherSidebar } from '@/components/layout/teacher-sidebar';
import { AppHeader } from '@/components/layout/app-header';

// ------------------------------------------------------------
// Teacher Layout Component
// ------------------------------------------------------------

interface TeacherLayoutProps {
  children: ReactNode;
}

export default function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
