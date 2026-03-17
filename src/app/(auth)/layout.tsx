// ============================================================
// MarketSim Pro - Auth Layout (Public Pages)
// ============================================================

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
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <span className="font-semibold text-2xl text-[#1E2A3A]">MarketSim</span>
        <span className="font-semibold text-2xl text-blue-600">Pro</span>
      </div>
      
      {/* Content */}
      {children}
    </div>
  );
}
