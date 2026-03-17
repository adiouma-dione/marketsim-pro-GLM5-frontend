// ============================================================
// MarketSim Pro - Join Team Form Component
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { apiPost, apiGet } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { TeamResponse, GameSessionResponse } from '@/lib/types';
import { SessionStatusBadge } from '@/components/ui/status-badge';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const joinCodeSchema = z.string().uuid('Code invalide (format UUID requis)');

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface JoinFormProps {
  initialCode?: string;
}

type JoinState = 'input' | 'loading' | 'success' | 'error';

interface JoinResult {
  team: TeamResponse;
  session: GameSessionResponse;
}

export function JoinForm({ initialCode = '' }: JoinFormProps) {
  const router = useRouter();
  const { user, setTeamContext, token } = useAuthStore();
  
  const [code, setCode] = React.useState(initialCode);
  const [state, setState] = React.useState<JoinState>('input');
  const [error, setError] = React.useState<string | null>(null);
  const [joinResult, setJoinResult] = React.useState<JoinResult | null>(null);

  // Check if user is authenticated
  React.useEffect(() => {
    if (!token || !user) {
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [token, user, router]);

  const handleVerify = async () => {
    // Validate code format
    const validationResult = joinCodeSchema.safeParse(code);
    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setState('loading');
    setError(null);

    try {
      // Call join endpoint - this does the actual join
      const team = await apiPost<TeamResponse>(`/api/v1/teams/${code}/join`);

      // Get session info
      const session = await apiGet<GameSessionResponse>(
        `/api/v1/sessions/${team.session_id}`
      );

      setJoinResult({ team, session });
      setState('success');

      // Update auth store with team context
      setTeamContext(team.id, team.session_id);

      toast.success(`Vous avez rejoint l'équipe "${team.name}" !`);
    } catch (err) {
      setState('error');
      const message = err instanceof Error ? err.message : 'Impossible de rejoindre l\'équipe';
      setError(message);
      toast.error(message);
    }
  };

  const handleContinue = () => {
    router.push('/game');
  };

  const handleReset = () => {
    setState('input');
    setError(null);
    setJoinResult(null);
    setCode('');
  };

  // Loading state
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-sm text-gray-500">Vérification du code...</p>
      </div>
    );
  }

  // Success state
  if (state === 'success' && joinResult) {
    return (
      <div className="space-y-6">
        {/* Success Card */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Vous avez rejoint l'équipe avec succès !
              </p>
            </div>
          </div>
        </div>

        {/* Team & Session Info */}
        <div className="space-y-3">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Équipe</p>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: joinResult.team.color_hex || '#3B82F6' }}
              />
              <p className="font-medium text-gray-900">{joinResult.team.name}</p>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Session</p>
            <div className="flex items-center justify-between">
              <p className="font-medium text-gray-900">{joinResult.session.name}</p>
              <SessionStatusBadge status={joinResult.session.status} />
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700"
        >
          Continuer vers le tableau de bord
          <span className="ml-2">→</span>
        </Button>
      </div>
    );
  }

  // Input state (default)
  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && state === 'error' && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Code Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Code de l'équipe
        </Label>
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
          className={cn(
            'h-12 text-center font-mono text-lg tracking-widest',
            state === 'error' && 'border-red-500'
          )}
        />
        <p className="text-xs text-gray-500 text-center">
          Entrez l'identifiant unique de l'équipe (UUID)
        </p>
      </div>

      {/* Verify Button */}
      <Button
        onClick={handleVerify}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700"
        disabled={!code}
      >
        Vérifier et rejoindre
      </Button>

      {/* Reset Button (shown on error) */}
      {state === 'error' && (
        <Button
          variant="ghost"
          onClick={handleReset}
          className="w-full"
        >
          Réessayer avec un autre code
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------
// Join Form Wrapper (with back link)
// ------------------------------------------------------------

interface JoinFormWrapperProps {
  initialCode?: string;
}

export function JoinFormWrapper({ initialCode }: JoinFormWrapperProps) {
  const router = useRouter();

  return (
    <div className="w-full max-w-md">
      {/* Back Link */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour
      </button>

      {/* Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Rejoindre une équipe
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Entrez le code fourni par votre enseignant pour rejoindre votre équipe.
        </p>

        <JoinForm initialCode={initialCode} />
      </div>
    </div>
  );
}
