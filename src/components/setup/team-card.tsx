// ============================================================
// MarketSim Pro - Team Card Component
// ============================================================

'use client';

import * as React from 'react';
import { Copy, Trash2, Users, Check, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
}

interface TeamCardData {
  id: string;
  name: string;
  color_hex: string;
  director_user_id?: string | null;
  org_chart_required?: boolean;
  org_chart_complete?: boolean;
  members?: TeamMember[];
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface TeamCardProps {
  team: TeamCardData;
  onCopyCode?: (code: string) => void;
  onDelete?: (teamId: string) => void;
  onChangeDirector?: (teamId: string, directorUserId: string | null) => void;
  isDeleting?: boolean;
  isSavingDirector?: boolean;
  isLocked?: boolean;
  className?: string;
}

export function TeamCard({
  team,
  onCopyCode,
  onDelete,
  onChangeDirector,
  isDeleting = false,
  isSavingDirector = false,
  isLocked = false,
  className,
}: TeamCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  const memberCount = team.members?.length || 0;
  const selectedMemberName = selectedMember?.full_name || selectedMember?.email || 'Membre';
  const selectedMemberInitial =
    selectedMemberName.trim().charAt(0).toUpperCase() || '?';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(team.id);
      setCopied(true);
      toast.success('Code copié !');
      onCopyCode?.(team.id);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier');
    }
  };

  const handleDelete = () => {
    onDelete?.(team.id);
  };

  const openMemberProfile = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const orgStatusBadge = team.org_chart_required ? (
    <Badge
      className={cn(
        'border',
        team.org_chart_complete
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-amber-200 bg-amber-50 text-amber-800'
      )}
    >
      {team.org_chart_complete ? 'Organigramme complet' : 'Organigramme requis'}
    </Badge>
  ) : (
    <Badge className="border border-slate-200 bg-slate-50 text-slate-700">
      Organigramme optionnel
    </Badge>
  );

  return (
    <Card
      className={cn(
        'shadow-sm border-l-4 transition-all hover:shadow-md',
        className
      )}
      style={{ borderLeftColor: team.color_hex || '#3B82F6' }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: team.color_hex || '#3B82F6' }}
            />
            <CardTitle className="text-base font-semibold text-gray-900">
              {team.name}
            </CardTitle>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
              disabled={isDeleting || isLocked}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">{orgStatusBadge}</div>

        {/* Invitation Code */}
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Code:</span>
            <code className="text-xs font-mono text-gray-700 truncate max-w-[150px]">
              {team.id.slice(0, 8)}...
            </code>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>

        {/* Members Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>
              {memberCount} membre{memberCount !== 1 ? 's' : ''}
            </span>
          </div>
          {memberCount > 0 && team.members && (
            <div className="flex -space-x-2">
              {team.members.slice(0, 3).map((member, i) => (
                <div
                  key={member.id}
                  className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                  title={member.full_name || member.email}
                >
                  {(member.full_name || member.email)?.[0]?.toUpperCase() || '?'}
                </div>
              ))}
              {memberCount > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                  +{memberCount - 3}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
            <Crown className="h-4 w-4 text-amber-500" />
            Directeur général
          </div>
          <Select
            value={team.director_user_id ?? '__none__'}
            onValueChange={(value) =>
              onChangeDirector?.(team.id, value === '__none__' ? null : value)
            }
            disabled={isLocked || isSavingDirector || memberCount === 0}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Choisir le DG" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Aucun DG</SelectItem>
              {(team.members ?? []).map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.full_name || member.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500">
            Le DG pilote l’équipe, achète les machines et soumet la décision finale.
          </p>
        </div>

        {/* Member List */}
        {memberCount > 0 && team.members && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Membres:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                      {(member.full_name || member.email)?.[0]?.toUpperCase() || '?'}
                    </div>
                    <button
                      type="button"
                      onClick={() => openMemberProfile(member)}
                      className="truncate text-left text-gray-700 transition-colors hover:text-blue-700 hover:underline"
                    >
                      {member.full_name || member.email}
                    </button>
                  </div>
                  {team.director_user_id === member.id ? (
                    <Badge className="border border-amber-200 bg-amber-50 text-amber-700">
                      DG
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil du membre</DialogTitle>
            <DialogDescription>
              Informations utiles pour la configuration de l&apos;équipe.
            </DialogDescription>
          </DialogHeader>

          {selectedMember ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-semibold text-white"
                  style={{ backgroundColor: team.color_hex || '#3B82F6' }}
                >
                  {selectedMemberInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-slate-900">
                    {selectedMemberName}
                  </p>
                  <p className="truncate text-sm text-slate-500">
                    {selectedMember.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Équipe</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{team.name}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Rôle</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {team.director_user_id === selectedMember.id ? 'Directeur général' : 'Membre'}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                {team.director_user_id === selectedMember.id
                  ? 'Ce membre est le DG. Il pilote l’équipe, gère l’organigramme, achète les machines et soumet la décision finale.'
                  : 'Ce membre participe aux décisions de l’équipe. Son rôle opérationnel détaillé peut être défini dans l’organigramme.'}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ------------------------------------------------------------
// Team Card Skeleton
// ------------------------------------------------------------

export function TeamCardSkeleton() {
  return (
    <Card className="shadow-sm border-l-4 border-l-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse" />
            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-8 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
