// ============================================================
// MarketSim Pro - Password Form Component
// ============================================================

'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { usePasswordChange } from '@/lib/hooks/use-settings';

// ------------------------------------------------------------
// Schema
// ------------------------------------------------------------

const passwordSchema = z
  .object({
    old_password: z.string().min(8, 'Le mot de passe actuel est requis'),
    new_password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirm_password: z.string().min(8, 'La confirmation est requise'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export function PasswordForm() {
  const { mutate: changePassword, isPending } = usePasswordChange();
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = (data: PasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sécurité</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="old_password">Mot de passe actuel</Label>
            <div className="relative">
              <Input
                id="old_password"
                type={showOldPassword ? 'text' : 'password'}
                {...register('old_password')}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.old_password && (
              <p className="text-xs text-red-500">{errors.old_password.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new_password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                id="new_password"
                type={showNewPassword ? 'text' : 'password'}
                {...register('new_password')}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.new_password && (
              <p className="text-xs text-red-500">{errors.new_password.message}</p>
            )}
            <p className="text-xs text-gray-400">
              Minimum 8 caractères
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirm_password')}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-xs text-red-500">{errors.confirm_password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button type="submit" disabled={!isDirty || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Modification...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
