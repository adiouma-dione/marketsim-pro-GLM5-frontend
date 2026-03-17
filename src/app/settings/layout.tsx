'use client';

import type { ReactNode } from 'react';

import { AppHeader } from '@/components/layout/app-header';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { TeacherSidebar } from '@/components/layout/teacher-sidebar';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const role = useAuthStore((state) => state.user?.role);
  const Sidebar = role === 'STUDENT' ? StudentSidebar : role ? TeacherSidebar : null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {Sidebar ? <Sidebar /> : null}
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
