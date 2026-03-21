'use client';

import * as React from 'react';
import { Loader2, Network, Crown, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyTeam } from '@/lib/hooks/use-team-dashboard';
import { useTeamDetail } from '@/lib/hooks/use-decisions';
import {
  useTeamOrgChart,
  useUpdateTeamOrgChart,
} from '@/lib/hooks/use-team-org-chart';

const ORG_SECTIONS = [
  {
    key: 'production_user_ids',
    title: 'Responsable production',
    description: 'Pilote le volume de production et le budget maintenance.',
  },
  {
    key: 'finance_user_ids',
    title: 'Responsable finance',
    description: 'Pilote l’emprunt et les arbitrages financiers.',
  },
  {
    key: 'marketing_user_ids',
    title: 'Responsable marketing',
    description: 'Pilote le prix et le budget marketing.',
  },
  {
    key: 'quality_hr_user_ids',
    title: 'Responsable Qualité & RH',
    description: 'Pilote QHSE, RH, R&D et salaire moyen.',
  },
] as const;

type OrgSectionKey = (typeof ORG_SECTIONS)[number]['key'];

type SelectionState = Record<OrgSectionKey, string[]>;

const emptySelection: SelectionState = {
  production_user_ids: [],
  finance_user_ids: [],
  marketing_user_ids: [],
  quality_hr_user_ids: [],
};

export default function StudentOrgChartPage() {
  const { data: team, isLoading: isTeamLoading } = useMyTeam();
  const teamId = team?.id ?? '';
  const isDirector = team?.current_user_roles?.includes('dg') ?? false;

  const teamDetailQuery = useTeamDetail(teamId);
  const orgChartQuery = useTeamOrgChart(teamId);
  const updateOrgChart = useUpdateTeamOrgChart(teamId);

  const [selection, setSelection] = React.useState<SelectionState>(emptySelection);

  React.useEffect(() => {
    if (!orgChartQuery.data) return;
    setSelection({
      production_user_ids: orgChartQuery.data.production_user_ids ?? [],
      finance_user_ids: orgChartQuery.data.finance_user_ids ?? [],
      marketing_user_ids: orgChartQuery.data.marketing_user_ids ?? [],
      quality_hr_user_ids: orgChartQuery.data.quality_hr_user_ids ?? [],
    });
  }, [orgChartQuery.data]);

  const toggleMember = (section: OrgSectionKey, memberId: string, checked: boolean) => {
    setSelection((current) => ({
      ...current,
      [section]: checked
        ? [...current[section], memberId]
        : current[section].filter((id) => id !== memberId),
    }));
  };

  const handleSave = async () => {
    if (!orgChartQuery.data) return;
    await updateOrgChart.mutateAsync({
      director_user_id: orgChartQuery.data.director_user_id ?? null,
      ...selection,
    });
  };

  if (isTeamLoading || (teamId && (teamDetailQuery.isLoading || orgChartQuery.isLoading))) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <Alert>
        <AlertDescription>
          Vous devez d’abord être assigné à une équipe.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isDirector) {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertDescription className="text-amber-900">
          Cette page est réservée au DG de l’équipe. Le professeur doit d’abord vous désigner comme DG.
        </AlertDescription>
      </Alert>
    );
  }

  const members = teamDetailQuery.data?.members ?? [];
  const orgChart = orgChartQuery.data;

  if (!orgChart) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Impossible de charger l’organigramme de l’équipe.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Organigramme de l’équipe</h1>
          <p className="mt-1 text-sm text-gray-500">
            Répartissez les responsabilités. Un même membre peut tenir plusieurs rôles si nécessaire.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="border border-blue-200 bg-blue-50 text-blue-700">
            <Crown className="mr-1 h-3.5 w-3.5" />
            DG désigné par le professeur
          </Badge>
          <Badge
            className={
              orgChart.complete
                ? 'border border-green-200 bg-green-50 text-green-700'
                : orgChart.required
                  ? 'border border-amber-200 bg-amber-50 text-amber-800'
                  : 'border border-slate-200 bg-slate-50 text-slate-700'
            }
          >
            {orgChart.complete
              ? 'Organigramme complet'
              : orgChart.required
                ? 'Organigramme requis'
                : 'Organigramme optionnel'}
          </Badge>
        </div>
      </div>

      <Alert className="border-slate-200 bg-slate-50">
        <ShieldCheck className="h-4 w-4 text-slate-700" />
        <AlertDescription className="text-slate-800">
          Le DG conserve le pilotage global, l’achat de machines et la soumission finale. Les responsables métiers modifient uniquement leur périmètre dans l’écran Décisions.
        </AlertDescription>
      </Alert>

      {!orgChart.complete && orgChart.missing_roles.length > 0 ? (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertDescription className="text-amber-900">
            Rôles encore manquants : {orgChart.missing_roles.join(', ')}.
          </AlertDescription>
        </Alert>
      ) : null}

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Network className="h-4 w-4 text-blue-600" />
            Répartition des responsabilités
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {ORG_SECTIONS.map((section) => (
            <div key={section.key} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3">
                <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
                <p className="text-sm text-slate-500">{section.description}</p>
              </div>
              <div className="space-y-3">
                {members.map((member) => (
                  <label
                    key={`${section.key}-${member.id}`}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {member.full_name || member.email}
                      </p>
                      <p className="truncate text-xs text-slate-500">{member.email}</p>
                    </div>
                    <Checkbox
                      checked={selection[section.key].includes(member.id)}
                      onCheckedChange={(checked) =>
                        toggleMember(section.key, member.id, checked === true)
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={updateOrgChart.isPending}
            >
              {updateOrgChart.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                'Enregistrer l’organigramme'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
