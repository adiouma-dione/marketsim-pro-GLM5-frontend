// ============================================================
// MarketSim Pro - Student Sidebar Component
// ============================================================

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  Trophy,
  DollarSign,
  Award,
  Settings,
  Loader2,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/stores/auth-store';

// ------------------------------------------------------------
// Navigation Items
// ------------------------------------------------------------

const navItems: Array<{
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
  {
    label: 'Dashboard',
    href: '/game/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Mes Décisions',
    href: '/game/decisions',
    icon: ClipboardList,
  },
  {
    label: 'Résultats',
    href: '/game/results',
    icon: BarChart2,
  },
  {
    label: 'Classement',
    href: '/game/ranking',
    icon: Trophy,
  },
  {
    label: 'Finances',
    href: '/game/finances',
    icon: DollarSign,
  },
  {
    label: 'Rapport Final',
    href: '/game/final',
    icon: Award,
  },
];

// ------------------------------------------------------------
// Sidebar Component
// ------------------------------------------------------------

export function StudentSidebar() {
  const pathname = usePathname();
  const { data: teamData, isLoading } = useMyTeam();
  const logout = useAuthStore((state) => state.logout);

  const team = teamData;

  const handleLogout = () => {
    logout();
    window.location.href = ROUTES.LOGIN;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-[#1E2A3A] text-white flex flex-col z-40">
      {/* Logo */}
      <div className="p-4 border-b border-[#374151]">
        <Link href="/game/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">MS</span>
          </div>
          <span className="font-semibold text-lg">MarketSim</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-[#374151] hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Team Info Footer */}
      <div className="p-4 border-t border-[#374151] space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        ) : team ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: team.color_hex }}
              />
              <span className="text-sm text-white truncate">{team.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30">
                Étudiant
              </Badge>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400">Équipe non assignée</p>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-gray-300 hover:text-white hover:bg-[#374151] justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
}

// ------------------------------------------------------------
// Mobile Sidebar (Sheet)
// ------------------------------------------------------------

export function StudentMobileSidebar() {
  const pathname = usePathname();
  const { data: teamData } = useMyTeam();
  const team = teamData;

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#1E2A3A] text-white flex items-center justify-between px-4 z-50">
      <Link href="/game/dashboard" className="flex items-center gap-2">
        <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-xs">MS</span>
        </div>
        <span className="font-semibold">MarketSim</span>
      </Link>
      {team && (
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: team.color_hex }}
          />
          <span className="text-sm truncate max-w-[100px]">{team.name}</span>
        </div>
      )}
    </div>
  );
}
