// ============================================================
// MarketSim Pro - 404 Not Found Page
// ============================================================

import * as React from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <Search className="h-12 w-12 text-gray-300 mx-auto" />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          404
        </h1>
        <h2 className="text-xl text-gray-600 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>

        <Button asChild>
          <Link href="/">
            Retour à l&apos;accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
