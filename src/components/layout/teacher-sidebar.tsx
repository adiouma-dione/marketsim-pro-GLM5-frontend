// ============================================================
// MarketSim Pro - Teacher Sidebar Component
// ============================================================

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  LayoutDashboard,
  Settings,
  Users,
  Gamepad2,
  LineChart,
  Trophy,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ------------------------------------------------------------
// Navigation Items
// ------------------------------------------------------------

const mainNavItems: NavItem[] = [
  {
    label: 'Tableau de bord',
    href: '/teacher/sessions',
    icon: LayoutDashboard,
  },
];

const settingsNavItems: NavItem[] = [
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings,
  },
];

const sessionNavItems: NavItem[] = [
  {
    label: 'Équipes & Setup',
    href: '/setup',
    icon: Users,
  },
  {
    label: 'Console Pilotage',
    href: '/monitor',
    icon: Gamepad2,
  },
  {
    label: 'Résultats',
    href: '/results',
    icon: BarChart2,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: LineChart,
  },
  {
    label: 'Rapport Final',
    href: '/report',
    icon: Trophy,
  },
];

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function TeacherSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Check if we're in a session context
  const sessionMatch = pathname.match(/\/teacher\/session\/([^/]+)/);
  const sessionId = sessionMatch?.[1];
  const isInSession = !!sessionId;

  // Check if a nav item is active
  const isMainItemActive = (href: string) => {
    if (href === '/teacher/sessions') {
      return pathname === '/teacher/sessions' || pathname === '/teacher';
    }
    return pathname.startsWith(href);
  };

  const isSessionItemActive = (sessionHref: string) => {
    const fullPath = `/teacher/session/${sessionId}${sessionHref}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  // Get initials for avatar
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
        href="/teacher/sessions"
        className="flex items-center gap-2 px-4 py-4 hover:bg-white/5 transition-colors"
      >
        <BarChart2 className="h-4 w-4 text-blue-400" />
        <span className="font-semibold text-white">MarketSim Pro</span>
      </Link>

      <Separator className="bg-[#2D3A4A]" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Main Navigation */}
        <ul className="space-y-1 px-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isMainItemActive(item.href);
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

        {/* Session Navigation (when in session context) */}
        {isInSession && (
          <>
            <Separator className="bg-[#2D3A4A] my-4" />
            
            {/* Session Header */}
            <div className="px-4 mb-3">
              <Link
                href="/teacher/sessions"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-2"
              >
                <ChevronLeft className="h-3 w-3" />
                Retour aux sessions
              </Link>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Session en cours
              </p>
              <p className="text-sm text-white font-medium truncate">
                Session active
              </p>
            </div>

            {/* Session Nav Items */}
            <ul className="space-y-1 px-2">
              {sessionNavItems.map((item) => {
                const Icon = item.icon;
                const active = isSessionItemActive(item.href);
                const fullPath = `/teacher/session/${sessionId}${item.href}`;
                return (
                  <li key={item.href}>
                    <Link
                      href={fullPath}
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
          </>
        )}

        {/* Settings */}
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#2D3A4A] flex items-center justify-center text-white text-sm font-medium">
            {getInitials(user?.full_name || user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white font-medium truncate">
              {user?.full_name || 'Utilisateur'}
            </p>
            <Badge className="bg-purple-100 text-purple-700 text-xs mt-0.5">
              Professeur
            </Badge>
          </div>
        </div>
      </div>
    </aside>
  );
}
