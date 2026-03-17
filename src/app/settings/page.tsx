// ============================================================
// MarketSim Pro - Settings Page (Shared Teacher/Student)
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfileForm } from '@/components/settings/profile-form';
import { PasswordForm } from '@/components/settings/password-form';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiPost } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { UserResponse } from '@/lib/types';

// ------------------------------------------------------------
// Extended User Type for Settings
// ------------------------------------------------------------

interface SettingsUser extends UserResponse {
  full_name?: string;
}

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiPost(API_ENDPOINTS.AUTH_LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    }
    // Clear local state
    logout();
    router.push('/login');
  };

  // Loading state
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <Skeleton className="h-8 w-32" />
        </div>

        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Cast user to extended type
  const settingsUser = user as SettingsUser;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Paramètres
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Gérez votre profil et vos préférences
        </p>
      </div>

      {/* Profile Form */}
      <ProfileForm user={settingsUser} />

      {/* Password Form */}
      <PasswordForm />

      {/* Logout Card */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base">Déconnexion</CardTitle>
          <CardDescription>
            Quitter votre session MarketSim Pro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="ghost"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Déconnexion...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
