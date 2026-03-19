// ============================================================
// MarketSim Pro - Settings Update Hook
// ============================================================

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { toast } from 'sonner';
import { apiPost, apiPut } from '@/lib/api';
import { API_ENDPOINTS } from '@/lib/constants';
import type { UserResponse } from '@/lib/types';

// ------------------------------------------------------------
// Zod Schema for Profile Update
// ------------------------------------------------------------

const profileUpdateSchema = z.object({
  full_name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  username: z.string().min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères').optional(),
});

type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;

// ------------------------------------------------------------
// Zod Schema for Password Change
// ------------------------------------------------------------

const passwordChangeSchema = z
  .object({
    old_password: z.string().min(1, 'Le mot de passe actuel est requis'),
    new_password: z
      .string()
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
      .refine((value) => /[A-Z]/.test(value), {
        message: 'Le mot de passe doit contenir au moins une majuscule',
      })
      .refine((value) => /\d/.test(value), {
        message: 'Le mot de passe doit contenir au moins un chiffre',
      }),
    confirm_password: z.string().min(8, 'La confirmation est requise'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// ------------------------------------------------------------
// Profile Update Hook
// ------------------------------------------------------------

export function useProfileUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateFormData) => {
      return await apiPut<UserResponse>(API_ENDPOINTS.AUTH_ME, data);
    },
    onSuccess: () => {
      toast.success('Profil mis à jour avec success');
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ------------------------------------------------------------
// Password Change Hook
// ------------------------------------------------------------

export function usePasswordChange() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PasswordChangeFormData) => {
      return await apiPost<{ message: string }>(
        API_ENDPOINTS.AUTH_CHANGE_PASSWORD,
        data
      );
    },
    onSuccess: () => {
      toast.success('Mot de passe modifié avec success');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
