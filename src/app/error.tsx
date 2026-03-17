// ============================================================
// MarketSim Pro - Global Error Page
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  const handleRetry = () => {
    reset();
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Une erreur est survenue
          </h1>
          
          <p className="text-gray-500 mb-6">
            Une erreur inattendue s&apos;est produite. Veuillez réessayer.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded p-3 mb-6 text-left overflow-auto">
              <p className="text-xs text-gray-600 font-mono">
                {error.message || 'Unknown error'}
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              Retour à l&apos;accueil
            </Button>
            <Button onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
