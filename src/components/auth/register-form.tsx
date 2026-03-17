// ============================================================
// MarketSim Pro - Register Form Component
// ============================================================

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, Eye, EyeOff, AlertCircle, User, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/types';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Le nom est requis')
      .min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z
      .string()
      .min(1, 'L\'email est requis')
      .email('Email invalide'),
    password: z
      .string()
      .min(1, 'Le mot de passe est requis')
      .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    confirm_password: z
      .string()
      .min(1, 'La confirmation est requise'),
    role: z.enum(['STUDENT', 'TEACHER'], {
      message: 'Veuillez sélectionner un rôle',
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface RegisterFormProps {
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const router = useRouter();
  const { register: registerUser, isLoading, clearError } = useAuthStore();
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | ''>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
      role: undefined,
    },
  });

  // Clear errors on mount
  React.useEffect(() => {
    clearError();
    setApiError(null);
  }, [clearError]);

  // Handle role selection
  const handleRoleChange = (value: 'STUDENT' | 'TEACHER') => {
    setSelectedRole(value);
    setValue('role', value);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role,
      });
      toast.success('Compte créé avec succès !');
      
      // Redirect based on user role
      const user = useAuthStore.getState().user;
      if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
        router.push('/teacher');
      } else {
        router.push('/game');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de l\'inscription';
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* API Error Alert */}
      {apiError && (
        <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        </div>
      )}

      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
          Prénom et nom
        </Label>
        <Input
          id="full_name"
          type="text"
          placeholder="Jean Dupont"
          className={cn(
            'h-11',
            errors.full_name && 'border-red-500 focus-visible:ring-red-500'
          )}
          {...register('full_name')}
          disabled={isSubmitting || isLoading}
        />
        {errors.full_name && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.full_name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            className={cn(
              'pl-10 h-11',
              errors.email && 'border-red-500 focus-visible:ring-red-500'
            )}
            {...register('email')}
            disabled={isSubmitting || isLoading}
          />
        </div>
        {errors.email && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Role Select */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Rôle</Label>
        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger
            className={cn(
              'h-auto',
              errors.role && 'border-red-500 focus:ring-red-500'
            )}
            disabled={isSubmitting || isLoading}
          >
            <SelectValue placeholder="Sélectionnez votre rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STUDENT">
              <div className="flex items-center gap-3 py-1">
                <div className="p-1.5 bg-blue-100 rounded">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Étudiant</div>
                  <div className="text-xs text-gray-500">Participez à des simulations</div>
                </div>
              </div>
            </SelectItem>
            <SelectItem value="TEACHER">
              <div className="flex items-center gap-3 py-1">
                <div className="p-1.5 bg-purple-100 rounded">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Professeur</div>
                  <div className="text-xs text-gray-500">Créez et gérez vos sessions</div>
                </div>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Mot de passe
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={cn(
              'pr-10 h-11',
              errors.password && 'border-red-500 focus-visible:ring-red-500'
            )}
            {...register('password')}
            disabled={isSubmitting || isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">
          Confirmer le mot de passe
        </Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={cn(
              'pr-10 h-11',
              errors.confirm_password && 'border-red-500 focus-visible:ring-red-500'
            )}
            {...register('confirm_password')}
            disabled={isSubmitting || isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="h-3.5 w-3.5" />
            {errors.confirm_password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-11 bg-blue-600 hover:bg-blue-700"
        disabled={isSubmitting || isLoading}
      >
        {(isSubmitting || isLoading) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Créer mon compte
      </Button>

      {/* Switch to Login */}
      {onSwitchToLogin && (
        <p className="text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Se connecter
          </button>
        </p>
      )}
    </form>
  );
}
