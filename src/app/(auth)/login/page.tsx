// ============================================================
// MarketSim Pro - Login Page
// ============================================================

'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { BarChart2, Loader2 } from 'lucide-react';

// ------------------------------------------------------------
// Page Content Component (uses useSearchParams)
// ------------------------------------------------------------

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState<'login' | 'register'>('login');

  // Handle tab query parameter
  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  return (
    <div className="w-full max-w-md">
      {/* Logo with Icon */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <BarChart2 className="h-7 w-7 text-blue-600" />
      </div>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="text-sm">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm">
              Inscription
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="mt-0">
            <LoginForm onSwitchToRegister={() => setActiveTab('register')} />
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-0">
            <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
          </TabsContent>
        </Tabs>

        {/* Join Link */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-center">
            <button
              onClick={() => router.push('/join')}
              className="text-sm text-gray-500 hover:text-blue-600 hover:underline"
            >
              Rejoindre avec un code →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------
// Page Component (with Suspense)
// ------------------------------------------------------------

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
