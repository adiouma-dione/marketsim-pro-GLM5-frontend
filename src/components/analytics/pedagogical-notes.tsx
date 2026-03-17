// ============================================================
// MarketSim Pro - Pedagogical Notes Component
// ============================================================

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Check, Loader2 } from 'lucide-react';
import { useRoundNotes, useSaveRoundNotes } from '@/lib/hooks/use-round-results';

interface PedagogicalNotesProps {
  sessionId: string;
  round: number;
  editable?: boolean;
  title?: string;
}

export function PedagogicalNotes({
  sessionId,
  round,
  editable = true,
  title = 'Notes pédagogiques',
}: PedagogicalNotesProps) {
  const [localNotes, setLocalNotes] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: notesData, isLoading } = useRoundNotes(sessionId, round);
  const saveMutation = useSaveRoundNotes(sessionId, round);

  // Use local notes if edited, otherwise server data
  const notes = localNotes !== null ? localNotes : (notesData?.notes || '');
  
  // Track changes based on original server data
  const originalNotes = notesData?.notes || '';

  const handleNotesChange = (value: string) => {
    setLocalNotes(value);
    setHasChanges(value !== originalNotes);
  };

  const handleSave = () => {
    saveMutation.mutate(notes, {
      onSuccess: () => {
        setHasChanges(false);
        setLocalNotes(null);
      },
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          {title}
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300">
              Non enregistré
            </Badge>
          )}
        </CardTitle>
        {editable && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Enregistrement...
              </>
            ) : saveMutation.isSuccess && !hasChanges ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Enregistré
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-1" />
                Enregistrer
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 bg-muted animate-pulse rounded-md" />
        ) : (
          <Textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Ajoutez vos observations pédagogiques pour ce tour..."
            className="min-h-[120px] resize-none"
            disabled={!editable}
          />
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Ces notes sont privées et visibles uniquement par l'enseignant.
        </p>
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------
// Compact Notes Component for Side Panels
// ------------------------------------------------------------

interface CompactNotesProps {
  sessionId: string;
  round: number;
  initialNotes?: string;
  onSave?: (notes: string) => void;
}

export function CompactNotes({
  sessionId,
  round,
  initialNotes = '',
  onSave,
}: CompactNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave?.(notes);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {notes ? (
          <p className="text-sm whitespace-pre-wrap">{notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Cliquer pour ajouter des notes...
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes pédagogiques..."
        className="min-h-[80px] resize-none"
        autoFocus
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          Enregistrer
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setNotes(initialNotes);
            setIsEditing(false);
          }}
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
