// ============================================================
// MarketSim Pro - Student Sidebar Component
// ============================================================

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2 as LogoChart,
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  Trophy,
  DollarSign,
  Award,
  Settings,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
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

const settingsNavItems = [
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

// ------------------------------------------------------------
// Sidebar Component
// ------------------------------------------------------------

export function StudentSidebar() {
  const pathname = usePathname();
  const { data: teamData, isLoading } = useMyTeam();
  const { user } = useAuthStore();

  const team = teamData;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="w-[220px] h-screen bg-[#1E2A3A] sticky top-0 flex flex-col flex-shrink-0">
      {/* Logo */}
      <Link
        href="/game/dashboard"
        className="flex items-center gap-2 px-4 py-4 hover:bg-white/5 transition-colors"
      >
        <LogoChart className="h-4 w-4 text-blue-400" />
        <span className="font-semibold text-white">MarketSim Pro</span>
      </Link>

      <Separator className="bg-[#2D3A4A]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-400 -ml-[2px] pl-[calc(0.75rem+2px)]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Separator className="bg-[#2D3A4A] my-4" />
        <ul className="space-y-1 px-2">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                    active
                      ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-400 -ml-[2px] pl-[calc(0.75rem+2px)]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="border-t border-[#2D3A4A] p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2D3A4A] flex items-center justify-center text-white text-sm font-medium">
              {getInitials(user?.full_name || user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">
                {team?.name || user?.full_name || 'Étudiant'}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                {team?.color_hex ? (
                  <span
                    className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: team.color_hex }}
                  />
                ) : null}
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  Étudiant
                </Badge>
              </div>
            </div>
          </div>
        )}
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
