// ============================================================
// MarketSim Pro - Auth Layout (Public Pages)
// ============================================================

import { BarChart2 } from 'lucide-react';
import type { ReactNode } from 'react';

// ------------------------------------------------------------
// Auth Layout Component
// ------------------------------------------------------------

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 flex items-center justify-center gap-2">
        <BarChart2 className="h-8 w-8 text-blue-600" />
        <div className="text-3xl font-semibold tracking-tight">
          <span className="text-[#1E2A3A]">MarketSim</span>{' '}
          <span className="text-blue-600">Pro</span>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
