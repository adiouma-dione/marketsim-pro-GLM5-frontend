// ============================================================
// MarketSim Pro - Team Card Component
// ============================================================

'use client';

import * as React from 'react';
import { Copy, Trash2, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  members?: TeamMember[];
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface TeamCardProps {
  team: TeamCardData;
  onCopyCode?: (code: string) => void;
  onDelete?: (teamId: string) => void;
  isDeleting?: boolean;
  className?: string;
}

export function TeamCard({
  team,
  onCopyCode,
  onDelete,
  isDeleting = false,
  className,
}: TeamCardProps) {
  const [copied, setCopied] = React.useState(false);

  const memberCount = team.members?.length || 0;

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
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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

        {/* Member List */}
        {memberCount > 0 && team.members && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Membres:</p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {team.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {(member.full_name || member.email)?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className="text-gray-700 truncate">
                    {member.full_name || member.email}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
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
