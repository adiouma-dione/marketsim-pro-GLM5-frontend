// ============================================================
// MarketSim Pro - Final Report Page
// ============================================================

'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  Download,
  FileText,
  Loader2,
  Trophy,
  Award,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useSession } from '@/lib/hooks/use-sessions';
import { useFinalReport, useBadges } from '@/lib/hooks/use-analytics';
import {
  ScoringWeightsComponent,
  type ScoringWeights,
} from '@/components/final/scoring-weights';
import { RadarChart, createTeamRadarData } from '@/components/charts/radar-chart';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

// ------------------------------------------------------------
// Page Component
// ------------------------------------------------------------

export default function FinalReportPage() {
  const params = useParams();
  const sessionId = params.id as string;

  // Fetch data
  const { data: session, isLoading: sessionLoading } = useSession(sessionId);
  const { data: finalReport, isLoading: reportLoading } =
    useFinalReport(sessionId);
  const { data: badges, isLoading: badgesLoading } = useBadges(sessionId);

  const isLoading = sessionLoading || reportLoading || badgesLoading;

  // State for weights
  const [weights, setWeights] = React.useState<ScoringWeights>({
    roi: 0.2,
    market_share: 0.2,
    financial_health: 0.2,
    customer_satisfaction: 0.2,
    rse_score: 0.2,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // No data state
  if (!session || !finalReport) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Rapport non disponible
        </h2>
        <p className="text-muted-foreground">
          Le rapport final sera disponible à la fin de la simulation.
        </p>
      </div>
    );
  }

  // Extract teams data from final report
  const teams = (finalReport.teams as FinalReportTeam[]) || [];
  const sessionName = session.name;

  // Build radar data
  const radarData = teams.map((team) => ({
    teamId: team.team_id,
    teamName: team.team_name,
    teamColor: team.team_color || '#3B82F6',
    metrics: {
      ROI: team.metrics?.roi || 0,
      PDM: team.metrics?.market_share || 0,
      Finance: team.metrics?.financial_health || 0,
      Satisfaction: team.metrics?.customer_satisfaction || 0,
      RSE: team.metrics?.rse_score || 0,
    },
  }));

  // Available badges
  const availableBadges: BadgeDefinition[] = Array.isArray(badges)
    ? (badges as unknown as BadgeDefinition[])
    : [];

  // Export handlers
  const handleExportCSV = () => {
    const csvContent = generateCSV(teams);
    downloadFile(csvContent, `resultats-${sessionId}.csv`, 'text/csv');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Rapport Final
          </h1>
          <p className="text-sm text-gray-500 mt-1">{sessionName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer PDF
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-center">
          Rapport Final - {sessionName}
        </h1>
        <p className="text-center text-gray-600 mt-2">
          Généré le {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Scoring Weights */}
        <div className="lg:col-span-1 print:hidden">
          <ScoringWeightsComponent
            sessionId={sessionId}
            initialWeights={weights}
            onWeightsChange={setWeights}
          />
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Classement final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FinalResultsTable teams={teams} />
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <RadarChart
            teamsData={radarData}
            title="Profils finaux des équipes"
            showToggle
          />
        </div>
      </div>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges obtenus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BadgesGrid teams={teams} availableBadges={availableBadges} />
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface FinalReportTeam {
  team_id: string;
  team_name: string;
  team_color?: string;
  final_score?: number;
  badge_points?: number;
  metrics?: {
    cash?: number;
    market_share?: number;
    satisfaction?: number;
    rse?: number;
    roi?: number;
    financial_health?: number;
    customer_satisfaction?: number;
    rse_score?: number;
  };
  badges?: string[];
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon?: string;
  condition?: string;
}

// ------------------------------------------------------------
// Final Results Table Component
// ------------------------------------------------------------

function FinalResultsTable({ teams }: { teams: FinalReportTeam[] }) {
  // Sort by final score
  const sortedTeams = [...teams].sort(
    (a, b) => (b.final_score || 0) - (a.final_score || 0)
  );

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rang</TableHead>
            <TableHead>Équipe</TableHead>
            <TableHead className="text-right">Score /100</TableHead>
            <TableHead className="text-right">Trésorerie</TableHead>
            <TableHead className="text-right">PDM</TableHead>
            <TableHead className="text-right">Satisfaction</TableHead>
            <TableHead className="text-right">RSE</TableHead>
            <TableHead className="text-right">Badges</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTeams.map((team, index) => (
            <TableRow key={team.team_id}>
              <TableCell>
                {index === 0 ? (
                  <Trophy className="h-5 w-5 text-yellow-500" />
                ) : index === 1 ? (
                  <Badge className="bg-gray-300 text-gray-800">2</Badge>
                ) : index === 2 ? (
                  <Badge className="bg-amber-600 text-white">3</Badge>
                ) : (
                  <Badge variant="outline">{index + 1}</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {team.team_color && (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: team.team_color }}
                    />
                  )}
                  <span className="font-medium">{team.team_name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-lg">
                {team.final_score?.toFixed(1) || '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.cash !== undefined
                  ? formatCurrency(team.metrics.cash)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.market_share !== undefined
                  ? formatPercent(team.metrics.market_share)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.satisfaction !== undefined
                  ? team.metrics.satisfaction.toFixed(1)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.metrics?.rse !== undefined
                  ? team.metrics.rse.toFixed(1)
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                {team.badge_points !== undefined ? (
                  <Badge variant="secondary">
                    <Award className="h-3 w-3 mr-1" />
                    {team.badge_points} pts
                  </Badge>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ------------------------------------------------------------
// Badges Grid Component
// ------------------------------------------------------------

function BadgesGrid({
  teams,
  availableBadges,
}: {
  teams: FinalReportTeam[];
  availableBadges: BadgeDefinition[];
}) {
  // If no badge definitions, show earned badges from teams
  const earnedBadgesByTeam = new Map<string, string[]>();
  teams.forEach((team) => {
    if (team.badges && team.badges.length > 0) {
      earnedBadgesByTeam.set(team.team_id, team.badges);
    }
  });

  // Flatten all earned badges
  const allEarnedBadges = new Set<string>();
  teams.forEach((team) => {
    team.badges?.forEach((badge) => allEarnedBadges.add(badge));
  });

  // If we have badge definitions
  if (availableBadges.length > 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {availableBadges.map((badge) => {
          const earnedTeams = teams.filter((team) =>
            team.badges?.includes(badge.id)
          );
          const isEarned = earnedTeams.length > 0;

          return (
            <Tooltip key={badge.id}>
              <TooltipTrigger asChild>
                <div
                  className={`p-4 rounded-lg border text-center transition-all ${
                    isEarned
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
                      : 'bg-gray-50 border-gray-200 opacity-30 grayscale'
                  }`}
                >
                  <Award
                    className={`h-8 w-8 mx-auto mb-2 ${
                      isEarned ? 'text-amber-500' : 'text-gray-400'
                    }`}
                  />
                  <p className="text-sm font-medium truncate">{badge.name}</p>
                  {isEarned && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {earnedTeams.map((t) => t.team_name).join(', ')}
                    </p>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{badge.name}</p>
                <p className="text-xs text-muted-foreground">
                  {badge.description}
                </p>
                {badge.condition && (
                  <p className="text-xs mt-1 italic">
                    Condition: {badge.condition}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  // Fallback: show earned badges without definitions
  if (allEarnedBadges.size === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Aucun badge n'a été attribué.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Array.from(allEarnedBadges).map((badgeId) => (
        <Badge key={badgeId} variant="secondary" className="gap-1">
          <Award className="h-3 w-3" />
          {badgeId}
        </Badge>
      ))}
    </div>
  );
}

// ------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------

function generateCSV(teams: FinalReportTeam[]): string {
  const headers = [
    'Rang',
    'Équipe',
    'Score',
    'Trésorerie',
    'Part de marché',
    'Satisfaction',
    'RSE',
    'Points badges',
  ];

  const sortedTeams = [...teams].sort(
    (a, b) => (b.final_score || 0) - (a.final_score || 0)
  );

  const rows = sortedTeams.map((team, index) => [
    index + 1,
    team.team_name,
    team.final_score?.toFixed(1) || '',
    team.metrics?.cash?.toFixed(2) || '',
    team.metrics?.market_share?.toFixed(2) || '',
    team.metrics?.satisfaction?.toFixed(1) || '',
    team.metrics?.rse?.toFixed(1) || '',
    team.badge_points?.toString() || '',
  ]);

  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');

  return csv;
}

function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
