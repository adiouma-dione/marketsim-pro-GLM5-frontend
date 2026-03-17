// ============================================================
// MarketSim Pro - Auth Store (Zustand with Persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse, Token, LoginRequest, UserCreate } from '../types';
import { setCookie, deleteCookie } from '../utils';

// ------------------------------------------------------------
// Auth State Interface
// ------------------------------------------------------------

interface AuthState {
  user: UserResponse | null;
  token: string | null;
  refreshToken: string | null;
  teamId: string | null;
  sessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  setTeamContext: (teamId: string, sessionId: string) => void;
  setTokens: (token: Token) => void;
  setUser: (user: UserResponse) => void;
  refreshAccessToken: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

type AuthStore = AuthState & AuthActions;

// ------------------------------------------------------------
// Initial State
// ------------------------------------------------------------

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  teamId: null,
  sessionId: null,
  isLoading: false,
  error: null,
};

// ------------------------------------------------------------
// API Base URL
// ------------------------------------------------------------

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ------------------------------------------------------------
// Auth Store
// ------------------------------------------------------------

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          // Step 1: Login to get tokens
          const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (!loginResponse.ok) {
            const errorData = await loginResponse.json().catch(() => ({}));
            throw new Error(
              errorData.detail || 'Échec de la connexion. Vérifiez vos identifiants.'
            );
          }

          const tokens: Token = await loginResponse.json();

          // Store tokens in state and cookie
          set({
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });
          setCookie('auth-token', tokens.access_token, 1); // 1 day

          // Step 2: Fetch user profile
          const meResponse = await fetch(`${API_URL}/api/v1/auth/me`, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          });

          if (!meResponse.ok) {
            throw new Error('Impossible de récupérer le profil utilisateur.');
          }

          const user: UserResponse = await meResponse.json();
          set({ user, isLoading: false });
          setCookie('auth-role', user.role, 1);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Une erreur est survenue';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data: UserCreate) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_URL}/api/v1/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.detail || "Échec de l'inscription. Veuillez réessayer."
            );
          }

          // After successful registration, login automatically
          await get().login(data.email, data.password);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Une erreur est survenue';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        const { token } = get();
        try {
          // Call logout endpoint to invalidate token on server
          if (token) {
            await fetch(`${API_URL}/api/v1/auth/logout`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }
        } catch {
          // Ignore logout API errors
        } finally {
          // Clear all auth state
          deleteCookie('auth-token');
          deleteCookie('auth-role');
          set(initialState);
        }
      },

      setTeamContext: (teamId: string, sessionId: string) => {
        set({ teamId, sessionId });
      },

      setTokens: (tokens: Token) => {
        set({
          token: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });
        setCookie('auth-token', tokens.access_token, 1);
      },

      setUser: (user: UserResponse) => {
        set({ user });
        setCookie('auth-role', user.role, 1);
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        try {
          const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!response.ok) {
            // Refresh failed, logout user
            get().logout();
            throw new Error('Session expired');
          }

          const tokens: Token = await response.json();
          set({
            token: tokens.access_token,
            refreshToken: tokens.refresh_token,
          });
          setCookie('auth-token', tokens.access_token, 1);
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        deleteCookie('auth-token');
        deleteCookie('auth-role');
        set(initialState);
      },
    }),
    {
      name: 'marketsim-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        teamId: state.teamId,
        sessionId: state.sessionId,
      }),
    }
  )
);

// ------------------------------------------------------------
// Selectors
// ------------------------------------------------------------

export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => !!state.token && !!state.user;
export const selectUserRole = (state: AuthStore) => state.user?.role;
export const selectIsTeacher = (state: AuthStore) => state.user?.role === 'TEACHER';
export const selectIsStudent = (state: AuthStore) => state.user?.role === 'STUDENT';
export const selectIsAdmin = (state: AuthStore) => state.user?.role === 'ADMIN';
export const selectTeamContext = (state: AuthStore) => ({
  teamId: state.teamId,
  sessionId: state.sessionId,
});
