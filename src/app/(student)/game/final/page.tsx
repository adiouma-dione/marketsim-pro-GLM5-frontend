// ============================================================
// MarketSim Pro - Student Final Report Page
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Download, Loader2, CheckCircle, ArrowRight, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { useFinalReport, useTeamHistoryForFinal, useBadges } from '@/lib/hooks/use-final-report';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { PersonalRadarChart } from '@/components/final/personal-radar-chart';
import { BadgeGrid } from '@/components/final/badge-grid';
import { KeyMomentsTimeline } from '@/components/final/key-moments-timeline';
import { GroupComparisonChart } from '@/components/final/group-comparison-chart';

// ------------------------------------------------------------
// Confetti Animation Component
// ------------------------------------------------------------

function Confetti() {
  const [particles, setParticles] = React.useState<
    Array<{ id: number; x: number; delay: number; size: number; color: string }>
  >([]);

  React.useEffect(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: '50%',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function StudentFinalReportPage() {
  const router = useRouter();
  const { data: myTeamData, isLoading: teamLoading } = useMyTeam();
  
  const teamId = myTeamData?.id;
  const sessionId = myTeamData?.session_id;
  const team = myTeamData;

  const {
    data: finalReport,
    isLoading: reportLoading,
    isError,
  } = useFinalReport(sessionId || '');

  const { data: badges } = useBadges(sessionId || '');
  const historyQuery = useTeamHistoryForFinal(teamId || '');
  const history = historyQuery.data?.results ?? [];

  const isLoading = teamLoading || reportLoading;

  // Get current team from report
  const teamReport = React.useMemo(() => {
    if (!finalReport?.teams || !teamId) return null;
    return finalReport.teams.find((t) => t.team_id === teamId);
  }, [finalReport?.teams, teamId]);

  // Calculate if team is champion
  const isChampion = React.useMemo(() => {
    if (!finalReport?.champion || !teamId) return false;
    return finalReport.champion.team_id === teamId;
  }, [finalReport?.champion, teamId]);

  // Calculate team stats vs averages for strengths/improvements
  const insights = React.useMemo(() => {
    if (!teamReport || !finalReport?.averages) return { strengths: [], improvements: [] };
    
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // Compare each dimension
    if (teamReport.final_stats?.cash > finalReport.averages.cash) {
      strengths.push(`Trésorerie supérieure à la moyenne (+${formatCurrency(teamReport.final_stats.cash - finalReport.averages.cash)})`);
    } else {
      improvements.push('Trésorerie à améliorer');
    }
    
    if (teamReport.final_stats?.market_share_pct > finalReport.averages.market_share_pct) {
      strengths.push(`Part de marché de ${(teamReport.final_stats.market_share_pct * 100).toFixed(1)}%`);
    }
    
    if (teamReport.final_stats?.customer_satisfaction > finalReport.averages.customer_satisfaction) {
      strengths.push('Satisfaction client élevée');
    }
    
    if (teamReport.final_stats?.rse_score > finalReport.averages.rse_score) {
      strengths.push('Score RSE excellent');
    }
    
    if (teamReport.final_stats?.debt > finalReport.averages.debt) {
      improvements.push('Dette importante à réduire');
    }

    return { strengths: strengths.slice(0, 3), improvements: improvements.slice(0, 2) };
  }, [teamReport, finalReport?.averages]);

  // Handle PDF download
  const handleDownloadPDF = () => {
    window.print();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Award className="h-8 w-8 text-blue-600" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Une erreur est survenue lors du chargement du rapport final.
          Vérifiez que la simulation est terminée.
        </AlertDescription>
      </Alert>
    );
  }

  // No report available
  if (!finalReport) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Award className="h-12 w-12 mx-auto text-gray-300" />
          <p className="text-muted-foreground mt-2">
            Aucun rapport final disponible
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Le rapport sera disponible une fois la simulation terminée.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Get total teams count
  const totalTeams = finalReport.teams?.length || 0;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Victory Banner with Confetti */}
      {isChampion && <Confetti />}
      
      {isChampion && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex items-center gap-4">
          <Trophy className="h-12 w-12 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold text-amber-900">
              Victoire !
            </h1>
            <p className="text-amber-700">
              {team?.name || 'Votre équipe'} remporte la simulation !
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Award className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-semibold text-gray-900">
              Rapport Final
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Bilan complet de votre simulation
          </p>
        </div>
        
        <Button onClick={handleDownloadPDF} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Télécharger PDF
        </Button>
      </div>

      {/* Score Card */}
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-sm text-gray-500 mb-2">Score final</p>
          <p className="text-7xl font-bold text-[#1E2A3A]">
            {teamReport?.final_score?.toFixed(0) || '--'}
          </p>
          <p className="text-lg text-gray-600 mt-2">
            sur 100 points
          </p>
          {teamReport?.rank && (
            <p className="text-sm text-gray-500 mt-4">
              {teamReport.rank === 1 ? (
                <span className="text-amber-600 font-medium">🥇 1er</span>
              ) : (
                `${teamReport.rank}ème / ${totalTeams} équipes`
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <PersonalRadarChart
        teamScores={{
          roi: teamReport?.dimension_scores?.roi || 0.5,
          pdm: teamReport?.dimension_scores?.market_share || 0.5,
          financial_stability: teamReport?.dimension_scores?.financial_solidity || 0.5,
          satisfaction: teamReport?.dimension_scores?.satisfaction || 0.5,
          rse: teamReport?.dimension_scores?.rse || 0.5,
        }}
        groupAverages={{
          roi: 0.5,
          pdm: 0.5,
          financial_stability: 0.5,
          satisfaction: 0.5,
          rse: 0.5,
        }}
        teamName={team?.name || 'Mon équipe'}
        teamColor={team?.color_hex || '#2563EB'}
      />

      {/* Badge Grid */}
      {badges && badges.length > 0 && (
        <BadgeGrid
          badges={badges}
          earnedBadges={(teamReport?.badges || []).map((id) => ({
            badge_id: id,
            earned_at: new Date().toISOString(),
          }))}
        />
      )}

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Points forts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.strengths.length > 0 ? (
              insights.strengths.map((strength, i) => (
                <div key={i} className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{strength}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Continuez vos efforts pour développer vos points forts !
              </p>
            )}
          </CardContent>
        </Card>

        {/* Improvements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Axes d&apos;amélioration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {insights.improvements.length > 0 ? (
              insights.improvements.map((improvement, i) => (
                <div key={i} className="flex items-center gap-2 text-amber-700">
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">{improvement}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                Excellent ! Vous n&apos;avez pas d&apos;axes d&apos;amélioration majeurs.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Group Comparison Chart */}
      <GroupComparisonChart
        teamStats={{
          cash: teamReport?.final_stats?.cash || 0,
          debt: teamReport?.final_stats?.debt || 0,
          market_share_pct: teamReport?.final_stats?.market_share_pct || 0,
          customer_satisfaction: teamReport?.final_stats?.customer_satisfaction || 0,
          rse_score: teamReport?.final_stats?.rse_score || 0,
        }}
        groupAverages={{
          cash: finalReport.averages?.cash || 0,
          debt: finalReport.averages?.debt || 0,
          market_share_pct: finalReport.averages?.market_share_pct || 0,
          customer_satisfaction: finalReport.averages?.customer_satisfaction || 0,
          rse_score: finalReport.averages?.rse_score || 0,
        }}
        teamName={team?.name || 'Mon équipe'}
        teamColor={team?.color_hex || '#2563EB'}
      />

      {/* Key Moments Timeline */}
      {history.length > 0 && (
        <KeyMomentsTimeline history={history} />
      )}
    </div>
  );
}
