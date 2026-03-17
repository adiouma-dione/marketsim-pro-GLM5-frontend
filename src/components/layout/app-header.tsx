// ============================================================
// MarketSim Pro - App Header Component
// ============================================================

'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/auth-store';

// ------------------------------------------------------------
// Breadcrumb Configuration
// ------------------------------------------------------------

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const routeLabels: Record<string, string> = {
  '/teacher': 'Tableau de bord',
  '/teacher/sessions': 'Mes Sessions',
  '/setup': 'Équipes & Setup',
  '/monitor': 'Console Pilotage',
  '/results': 'Résultats',
  '/analytics': 'Analytics',
  '/final': 'Rapport Final',
  '/settings': 'Paramètres',
  '/game': 'Jeu',
  '/game/dashboard': 'Tableau de bord',
  '/game/decisions': 'Décisions',
  '/game/results': 'Résultats',
  '/game/market': 'Marché',
  '/game/team': 'Mon équipe',
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface AppHeaderProps {
  sessionName?: string;
}

export function AppHeader({ sessionName }: AppHeaderProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Build breadcrumb from pathname
  const buildBreadcrumb = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    const segments = pathname.split('/').filter(Boolean);

    // Build up the path progressively
    let currentPath = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;

      // Skip UUID segments (session IDs) in label but use session name
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        segment
      );

      if (isUuid) {
        // Use session name if provided
        items.push({
          label: sessionName || 'Session',
          href: currentPath,
        });
        continue;
      }

      // Get label from mapping or format the segment
      const label =
        routeLabels[currentPath] ||
        routeLabels[`/${segment}`] ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      // Don't add href for the last item (current page)
      const isLast = i === segments.length - 1;

      items.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    }

    return items;
  };

  const breadcrumbs = buildBreadcrumb();

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
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm">
          {breadcrumbs.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => {
              // TODO: Open notifications panel
            }}
          >
            <Bell className="h-5 w-5 text-gray-500" />
            {/* Notification indicator - hidden when no notifications */}
            {/* <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" /> */}
          </Button>

          {/* User Avatar */}
          <Link href="/settings">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">
              {getInitials(user?.full_name || user?.email)}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
