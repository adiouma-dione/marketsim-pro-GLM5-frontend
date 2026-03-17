// ============================================================
// MarketSim Pro - Teams Step Component (Step 1)
// ============================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Users, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TeamCard, TeamCardSkeleton } from '@/components/setup/team-card';
import {
  useSessionSetup,
  useCreateTeam,
  useDeleteTeam,
  useAssignStudent,
} from '@/lib/hooks/use-session-setup';
import { useSession } from '@/lib/hooks/use-sessions';
import { TEAM_COLOR_PALETTE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const createTeamSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').min(2, 'Minimum 2 caractères'),
  color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur invalide'),
});

type CreateTeamFormData = z.infer<typeof createTeamSchema>;

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface TeamsStepProps {
  sessionId: string;
  onNext: () => void;
}

export function TeamsStep({ sessionId, onNext }: TeamsStepProps) {
  const { data: setup, isLoading, error } = useSessionSetup(sessionId);
  const { data: session } = useSession(sessionId);
  const createTeam = useCreateTeam(sessionId);
  const deleteTeam = useDeleteTeam(sessionId);
  const assignStudent = useAssignStudent(sessionId);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState<typeof TEAM_COLOR_PALETTE[number]>(TEAM_COLOR_PALETTE[0]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamFormData>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      color_hex: TEAM_COLOR_PALETTE[0],
    },
  });

  const isLocked = !!session && session.status !== 'draft';

  // Get used colors
  const usedColors = new Set(setup?.teams?.map((t) => t.color_hex) || []);

  // Get available colors
  const availableColors = TEAM_COLOR_PALETTE.filter((c) => !usedColors.has(c));

  // Get unassigned students - compute directly without useMemo
  const getUnassignedStudents = () => {
    if (!setup?.students || !setup?.student_assignments) return [];

    const assignedIds = new Set<string>();
    Object.values(setup.student_assignments).forEach((studentIds) => {
      studentIds.forEach((id) => assignedIds.add(id));
    });

    return setup.students.filter((s) => !assignedIds.has(s.id));
  };

  const unassignedStudents = getUnassignedStudents();

  const teamsWithMembers = React.useMemo(() => {
    if (!setup?.teams) return [];
    const studentsById = new Map(setup.students?.map((s) => [s.id, s]) || []);
    const assignments = setup.student_assignments || {};
    return setup.teams.map((team) => ({
      ...team,
      members: (assignments[team.id] || [])
        .map((id) => studentsById.get(id))
        .filter((member): member is NonNullable<typeof member> => Boolean(member)),
    }));
  }, [setup]);

  // Handle team creation
  const onCreateTeam = async (data: CreateTeamFormData) => {
    await createTeam.mutateAsync(data);
    reset();
    setSelectedColor(TEAM_COLOR_PALETTE[0]);
    setDialogOpen(false);
  };

  // Handle team deletion
  const handleDeleteTeam = (teamId: string) => {
    deleteTeam.mutate(teamId);
  };

  // Handle student assignment
  const handleAssignStudent = (studentId: string, teamId: string) => {
    assignStudent.mutate({ teamId, studentId });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <TeamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erreur lors du chargement des données. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Gestion des équipes
            </h2>
            {isLocked && (
              <Badge className="bg-amber-100 text-amber-900 border border-amber-200">
                Lecture seule
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Créez des équipes et assignez les étudiants
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              disabled={isLocked}
            >
              <Plus className="h-4 w-4" />
              Ajouter une équipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une équipe</DialogTitle>
              <DialogDescription>
                Ajoutez une nouvelle équipe à la session
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onCreateTeam)} className="space-y-4">
              {/* Team Name */}
              <div className="space-y-2">
                <Label htmlFor="teamName">Nom de l'équipe</Label>
                <Input
                  id="teamName"
                  placeholder="Ex: Alpha Team"
                  {...register('name')}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Color Picker */}
              <div className="space-y-2">
                <Label>Couleur</Label>
                <div className="flex gap-2 flex-wrap">
                  {TEAM_COLOR_PALETTE.map((color) => {
                    const isUsed = usedColors.has(color);
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        disabled={isUsed}
                        onClick={() => {
                          setSelectedColor(color);
                          setValue('color_hex', color);
                        }}
                        className={cn(
                          'w-8 h-8 rounded-full transition-all',
                          isUsed && 'opacity-30 cursor-not-allowed',
                          isSelected && !isUsed && 'ring-2 ring-offset-2 ring-blue-500'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || availableColors.length === 0}
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Créer
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLocked && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            La session est démarrée. Les modifications d’équipes sont désactivées.
          </AlertDescription>
        </Alert>
      )}

      {/* Teams Grid */}
      {setup?.teams && setup.teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamsWithMembers.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onDelete={handleDeleteTeam}
              isDeleting={deleteTeam.isPending}
              isLocked={isLocked}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-4 mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            Aucune équipe
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Créez votre première équipe pour commencer
          </p>
        </div>
      )}

      {/* Unassigned Students */}
      {unassignedStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {unassignedStudents.length} étudiant
              {unassignedStudents.length > 1 ? 's' : ''} en attente d'assignation
            </span>
          </div>
          <div className="space-y-2">
            {unassignedStudents.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between bg-white rounded-md p-2"
              >
                <span className="text-sm text-gray-700">
                  {student.full_name || student.email}
                </span>
                <Select
                  onValueChange={(teamId) =>
                    handleAssignStudent(student.id, teamId)
                  }
                  disabled={assignStudent.isPending || isLocked}
                >
                  <SelectTrigger className="w-[180px] h-8">
                    <SelectValue placeholder="Assigner à..." />
                  </SelectTrigger>
                  <SelectContent>
                    {setup?.teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: team.color_hex }}
                          />
                          {team.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      {!isLocked && (
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onNext} className="gap-2 bg-blue-600 hover:bg-blue-700">
            Suivant
            <span>→</span>
          </Button>
        </div>
      )}
    </div>
  );
}
