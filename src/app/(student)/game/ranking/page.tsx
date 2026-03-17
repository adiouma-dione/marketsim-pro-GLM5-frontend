// ============================================================
// MarketSim Pro - Student Leaderboard Page
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Podium } from '@/components/leaderboard/podium';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { useLeaderboard } from '@/lib/hooks/use-student-results';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { ROUTES } from '@/lib/constants';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function StudentLeaderboardPage() {
  const router = useRouter();
  const [secondsSinceUpdate, setSecondsSinceUpdate] = React.useState(0);

  const { data: myTeamData, isLoading: teamLoading } = useMyTeam();
  const teamId = myTeamData?.id;
  const sessionId = myTeamData?.session_id;
  const teamName = myTeamData?.name || 'Mon équipe';

  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    isError,
  } = useLeaderboard(sessionId || '');

  // Update seconds counter
  React.useEffect(() => {
    if (!leaderboard?.updated_at) return;
    
    const interval = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [leaderboard?.updated_at]);

  // Redirect if no team
  React.useEffect(() => {
    if (!teamLoading && !myTeamData) {
      router.push(ROUTES.JOIN);
    }
  }, [teamLoading, myTeamData, router]);

  // Loading state
  if (teamLoading || leaderboardLoading || !teamId) {
    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-8 w-8 text-blue-600" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-4 w-48 mt-1" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Une erreur est survenue lors du chargement du classement.
          Vérifiez que vous avez un enseignant.
        </AlertDescription>
      </Alert>
    );
  }

  // Check if we have leaderboard data
  const hasLeaderboard = leaderboard && leaderboard.rankings && leaderboard.rankings.length > 0;

  // Get updated text
  const getUpdatedText = () => {
    if (secondsSinceUpdate < 60) {
      return `Mis à jour il y a ${secondsSinceUpdate}s`;
    }
    const mins = Math.floor(secondsSinceUpdate / 60);
    return `Mis à jour il y a ${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Trophy className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900">
            Classement
          </h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Position de {teamName} par rapport aux autres équipes
        </p>
      </div>

      {/* Podium */}
      {hasLeaderboard && leaderboard.rankings.length >= 3 && (
        <Card className="bg-gradient-to-b from-amber-50 to-white shadow">
          <CardContent className="py-6">
            <Podium
              teams={leaderboard.rankings.slice(0, 3)}
              currentTeamId={teamId}
            />
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      {hasLeaderboard ? (
        <LeaderboardTable
          teams={leaderboard.rankings}
          currentTeamId={teamId}
        />
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto text-gray-300" />
            <p className="text-muted-foreground mt-2">
              Aucune donnée de classement disponible
            </p>
          </CardContent>
        </Card>
      )}

      {/* Last Updated Caption */}
      {leaderboard?.updated_at && (
        <div className="flex items-center justify-end text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>{getUpdatedText()}</span>
        </div>
      )}
    </div>
  );
}
