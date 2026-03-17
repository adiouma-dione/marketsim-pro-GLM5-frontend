// ============================================================
// MarketSim Pro - Profile Form Component
// ============================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfileUpdate } from '@/lib/hooks/use-settings';
import type { UserResponse } from '@/lib/types';

// ------------------------------------------------------------
// Schema
// ------------------------------------------------------------

const profileSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// ------------------------------------------------------------
// Props
// ------------------------------------------------------------

interface ProfileFormProps {
  user: UserResponse;
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function ProfileForm({ user }: ProfileFormProps) {
  const { mutate: updateProfile, isPending } = useProfileUpdate();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user.full_name || '',
      username: user.username || '',
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };

  // Get initials for avatar
  const initials = React.useMemo(() => {
    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    }
    return user.email[0].toUpperCase();
  }, [user]);

  // Role badge config
  const roleConfig = {
    TEACHER: { label: 'Enseignant', className: 'bg-purple-100 text-purple-700' },
    STUDENT: { label: 'Étudiant', className: 'bg-blue-100 text-blue-700' },
    ADMIN: { label: 'Administrateur', className: 'bg-red-100 text-red-700' },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Profil</CardTitle>
        <CardDescription>
          Gérez les informations de votre profil
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#1E2A3A] flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.full_name || 'Utilisateur'}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Rôle :</span>
            <Badge className={roleConfig[user.role]?.className}>
              {roleConfig[user.role]?.label || user.role}
            </Badge>
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-400">
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input
              id="full_name"
              type="text"
              {...register('full_name')}
              placeholder="Votre nom complet"
            />
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Nom d&apos;utilisateur</Label>
            <Input
              id="username"
              type="text"
              {...register('username')}
              placeholder="Votre pseudo"
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={!isDirty || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
