// ============================================================
// MarketSim Pro - Error Card Component
// ============================================================

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, AlertCircle, Wifi, ServerCrash } from 'lucide-react';
import { parseApiError } from '@/lib/utils';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface ErrorCardProps {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
  variant?: 'default' | 'network' | 'server' | 'not-found';
}

// ------------------------------------------------------------
// Variant Configurations
// ------------------------------------------------------------

const variantConfig = {
  default: {
    icon: AlertTriangle,
    title: 'Une erreur est survenue',
    color: 'text-amber-500',
  },
  network: {
    icon: Wifi,
    title: 'Erreur de connexion',
    color: 'text-red-500',
  },
  server: {
    icon: ServerCrash,
    title: 'Erreur serveur',
    color: 'text-red-500',
  },
  'not-found': {
    icon: AlertCircle,
    title: 'Non trouvé',
    color: 'text-gray-400',
  },
};

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function ErrorCard({
  title,
  message,
  error,
  onRetry,
  onHome,
  className,
  variant = 'default',
}: ErrorCardProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;
  
  const errorMessage = message || (error ? parseApiError(error) : null);
  const displayTitle = title || config.title;

  return (
    <Card className={cn('shadow-sm border-red-200', className)}>
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 rounded-full bg-red-50 p-4 w-fit">
          <Icon className={cn('h-8 w-8', config.color)} />
        </div>
        <CardTitle className="text-lg text-gray-900">{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        {errorMessage && (
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            {errorMessage}
          </p>
        )}
      </CardContent>
      {(onRetry || onHome) && (
        <CardFooter className="flex justify-center gap-3 pt-2">
          {onRetry && (
            <Button variant="default" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          )}
          {onHome && (
            <Button variant="outline" onClick={onHome}>
              <Home className="h-4 w-4 mr-2" />
              Accueil
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

// ------------------------------------------------------------
// Preset Error Components
// ------------------------------------------------------------

export function NetworkErrorCard({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorCard
      variant="network"
      message="Impossible de se connecter au serveur. Vérifiez votre connexion internet et réessayez."
      onRetry={onRetry}
      className={className}
    />
  );
}

export function ServerErrorCard({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorCard
      variant="server"
      message="Le serveur rencontre un problème. Veuillez réessayer dans quelques instants."
      onRetry={onRetry}
      className={className}
    />
  );
}

export function NotFoundCard({
  resource = 'ressource',
  onHome,
  className,
}: {
  resource?: string;
  onHome?: () => void;
  className?: string;
}) {
  return (
    <ErrorCard
      variant="not-found"
      title={`${resource} non trouvé(e)`}
      message={`La ${resource.toLowerCase()} que vous recherchez n'existe pas ou a été supprimée.`}
      onHome={onHome}
      className={className}
    />
  );
}

export function UnauthorizedCard({
  className,
}: {
  className?: string;
}) {
  return (
    <ErrorCard
      variant="default"
      title="Accès non autorisé"
      message="Vous n'avez pas les permissions nécessaires pour accéder à cette page."
      className={className}
    />
  );
}

// ------------------------------------------------------------
// Query Error Boundary Wrapper
// ------------------------------------------------------------

export interface QueryErrorProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function QueryError({ error, onRetry, className }: QueryErrorProps) {
  // Detect error type
  const axiosError = error as {
    response?: { status?: number };
    message?: string;
  };

  if (axiosError?.response?.status === 404) {
    return <NotFoundCard onHome={onRetry} className={className} />;
  }

  if (
    axiosError?.response?.status &&
    axiosError.response.status >= 500
  ) {
    return <ServerErrorCard onRetry={onRetry} className={className} />;
  }

  if (axiosError?.message === 'Network Error') {
    return <NetworkErrorCard onRetry={onRetry} className={className} />;
  }

  return (
    <ErrorCard
      error={error}
      onRetry={onRetry}
      className={className}
    />
  );
}
