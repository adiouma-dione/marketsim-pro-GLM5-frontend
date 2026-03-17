// ============================================================
// MarketSim Pro - Login Form Component
// ============================================================

'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/lib/stores/auth-store';
import { cn } from '@/lib/utils';

// ------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'email est requis')
    .email('Email invalide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

interface LoginFormProps {
  onSwitchToRegister?: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Clear errors on mount
  React.useEffect(() => {
    clearError();
    setApiError(null);
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie !');
      
      // Get redirect URL from query params or default based on role
      const redirectTo = searchParams.get('redirect') || searchParams.get('next');
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      
      // Redirect based on user role
      const user = useAuthStore.getState().user;
      if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
        router.push('/teacher');
      } else {
        router.push('/game');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de la connexion';
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

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
          onClick={() => toast.info('Fonctionnalité à venir')}
        >
          Mot de passe oublié ?
        </button>
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
        Se connecter
      </Button>

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <p className="text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
          >
            Créer un compte
          </button>
        </p>
      )}
    </form>
  );
}
