// ============================================================
// MarketSim Pro - Game Constants
// ============================================================

import type { MachineType } from './types';
import {
  Cog,
  Settings2,
  Star,
  Zap,
  Truck,
  Receipt,
  Leaf,
  TrendingUp,
  TrendingDown,
  FileText,
  Cpu,
  type LucideIcon,
} from 'lucide-react';

// ------------------------------------------------------------
// Machine Configuration
// ------------------------------------------------------------

export interface MachineConfigItem {
  label: string;
  price: number;
  capacity: number;
  quality: number;
  energy: string;
  defectRate: string;
  icon: typeof Cog;
}

export const MACHINE_CONFIG: Record<MachineType, MachineConfigItem> = {
  basic: {
    label: 'Basique',
    price: 50000,
    capacity: 1000,
    quality: 0.4,
    energy: 'Élevée',
    defectRate: '8%',
    icon: Cog,
  },
  standard: {
    label: 'Standard',
    price: 120000,
    capacity: 700,
    quality: 0.7,
    energy: 'Moyenne',
    defectRate: '4%',
    icon: Settings2,
  },
  premium: {
    label: 'Premium',
    price: 250000,
    capacity: 400,
    quality: 0.95,
    energy: 'Faible',
    defectRate: '1%',
    icon: Star,
  },
};

export const MACHINE_DELIVERY_DELAY: Record<MachineType, number> = {
  basic: 0,
  standard: 2,
  premium: 3,
};

// ------------------------------------------------------------
// Event Labels Configuration
// ------------------------------------------------------------

export interface EventLabelItem {
  label: string;
  icon: typeof Zap;
  color: 'amber' | 'orange' | 'red' | 'green' | 'blue' | 'purple';
}

export const EVENT_LABELS: Record<string, EventLabelItem> = {
  energy_crisis: {
    label: 'Crise énergétique',
    icon: Zap,
    color: 'amber',
  },
  supplier_shortage: {
    label: 'Rupture fournisseur',
    icon: Truck,
    color: 'orange',
  },
  tax_change: {
    label: 'Hausse de taxe',
    icon: Receipt,
    color: 'red',
  },
  eco_subsidy: {
    label: 'Subvention écologique',
    icon: Leaf,
    color: 'green',
  },
  economic_boom: {
    label: 'Boom économique',
    icon: TrendingUp,
    color: 'green',
  },
  recession: {
    label: 'Récession',
    icon: TrendingDown,
    color: 'red',
  },
  new_regulation: {
    label: 'Nouvelle réglementation',
    icon: FileText,
    color: 'blue',
  },
  tech_disruption: {
    label: 'Disruption technologique',
    icon: Cpu,
    color: 'purple',
  },
};

// ------------------------------------------------------------
// Status Badge Configuration
// ------------------------------------------------------------

export interface StatusBadgeConfig {
  bg: string;
  text: string;
  icon: LucideIcon;
  label: string;
}

import {
  Clock,
  Play,
  Pause,
  CheckCircle,
  GraduationCap,
  User,
  CheckCircle2,
  Lock,
  Award,
} from 'lucide-react';

export const SESSION_STATUS_CONFIG: Record<string, StatusBadgeConfig> = {
  draft: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: Clock,
    label: 'Brouillon',
  },
  active: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: Play,
    label: 'En cours',
  },
  paused: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: Pause,
    label: 'En pause',
  },
  finished: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: CheckCircle,
    label: 'Terminée',
  },
};

export const USER_ROLE_CONFIG: Record<string, StatusBadgeConfig> = {
  TEACHER: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: GraduationCap,
    label: 'Enseignant',
  },
  STUDENT: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: User,
    label: 'Étudiant',
  },
  ADMIN: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: User,
    label: 'Administrateur',
  },
};

export const MACHINE_BADGE_CONFIG: Record<MachineType, StatusBadgeConfig> = {
  basic: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    icon: Cog,
    label: 'Basique',
  },
  standard: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    icon: Settings2,
    label: 'Standard',
  },
  premium: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    icon: Star,
    label: 'Premium',
  },
};

export const DECISION_STATUS_CONFIG: Record<string, StatusBadgeConfig> = {
  submitted: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    icon: CheckCircle2,
    label: 'Soumises',
  },
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    icon: Clock,
    label: 'En attente',
  },
  locked: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: Lock,
    label: 'Verrouillées',
  },
};

export const ISO_BADGE_CONFIG: StatusBadgeConfig = {
  bg: 'bg-green-100',
  text: 'text-green-700',
  icon: Award,
  label: 'ISO 9001 ✓',
};

// ------------------------------------------------------------
// Severity Configuration
// ------------------------------------------------------------

export interface SeverityConfig {
  bg: string;
  text: string;
}

export const SEVERITY_CONFIG: Record<number, SeverityConfig> = {
  1: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  2: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
  },
  3: {
    bg: 'bg-red-100',
    text: 'text-red-700',
  },
};

// ------------------------------------------------------------
// API Endpoints
// ------------------------------------------------------------

export const API_ENDPOINTS = {
  // Auth
  AUTH_LOGIN: '/api/v1/auth/login',
  AUTH_REGISTER: '/api/v1/auth/register',
  AUTH_REFRESH: '/api/v1/auth/refresh',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  AUTH_ME: '/api/v1/auth/me',
  AUTH_CHANGE_PASSWORD: '/api/v1/auth/change-password',

  // Sessions
  SESSIONS: '/api/v1/sessions',
  SESSION_BY_ID: (id: string) => `/api/v1/sessions/${id}`,
  SESSION_SETUP: (id: string) => `/api/v1/sessions/${id}/setup`,
  SESSION_START: (id: string) => `/api/v1/sessions/${id}/start`,
  SESSION_PAUSE: (id: string) => `/api/v1/sessions/${id}/pause`,
  SESSION_RESUME: (id: string) => `/api/v1/sessions/${id}/resume`,
  SESSION_FINISH: (id: string) => `/api/v1/sessions/${id}/finish`,
  SESSION_MONITOR: (id: string) => `/api/v1/sessions/${id}/control-monitor`,
  SESSION_NOTES: (id: string, round: number) =>
    `/api/v1/sessions/${id}/rounds/${round}/notes`,
  SESSION_PROGRESS: (id: string) => `/api/v1/sessions/${id}/progress`,
  SESSION_FORCE_SUBMIT: (id: string) => `/api/v1/sessions/${id}/force-submit`,
  SESSION_REPLAY_ROUND: (id: string) => `/api/v1/sessions/${id}/replay-round`,
  SESSION_MANUAL_EVENT: (id: string) => `/api/v1/sessions/${id}/events/manual`,
  SESSION_SURPRISE_AUDIT: (id: string) =>
    `/api/v1/sessions/${id}/qhse/surprise-audit`,
  SESSION_SIMULATE_ROUND: (id: string) => `/api/v1/sessions/${id}/simulate-round`,
  SESSION_SIMULATION_STATUS: (id: string) => `/api/v1/sessions/${id}/simulation-status`,
  SESSION_TASK_STATUS: (id: string, taskId: string) =>
    `/api/v1/sessions/${id}/task-status/${taskId}`,

  // Teams
  TEAMS: (sessionId: string) => `/api/v1/sessions/${sessionId}/teams`,
  TEAM_BY_ID: (sessionId: string, teamId: string) =>
    `/api/v1/sessions/${sessionId}/teams/${teamId}`,
  TEAM_DASHBOARD: (_sessionId: string, teamId: string) =>
    `/api/v1/teams/${teamId}/dashboard`,
  TEAM_MACHINES: (_sessionId: string, teamId: string) =>
    `/api/v1/teams/${teamId}/machines`,
  MY_TEAM: '/api/v1/teams/me',
  TEAM_DASHBOARD_HISTORY: (teamId: string) =>
    `/api/v1/results/teams/${teamId}/history`,

  // Decisions
  DECISIONS: (sessionId: string, teamId: string) =>
    `/api/v1/sessions/${sessionId}/teams/${teamId}/decisions`,
  DECISION_BY_ROUND: (sessionId: string, teamId: string, round: number) =>
    `/api/v1/sessions/${sessionId}/teams/${teamId}/decisions/${round}`,
  DECISIONS_TEAM_ROUND: (teamId: string, round: number) =>
    `/api/v1/decisions/teams/${teamId}/round/${round}`,
  DECISIONS_SUBMIT: (teamId: string) =>
    `/api/v1/decisions/teams/${teamId}`,
  DECISIONS_AUTOSAVE: (teamId: string, round: number) =>
    `/api/v1/decisions/teams/${teamId}/round/${round}`,
  TEAM_DETAIL: (teamId: string) =>
    `/api/v1/teams/${teamId}`,
  TEAM_BUY_MACHINE: (teamId: string) =>
    `/api/v1/teams/${teamId}/machines`,
  TEAM_ORG_CHART: (teamId: string) =>
    `/api/v1/teams/${teamId}/org-chart`,

  // Results
  RESULTS_ROUND: (sessionId: string, round: number) =>
    `/api/v1/results/sessions/${sessionId}/round/${round}`,
  RESULTS_TEAM: (sessionId: string, teamId: string) =>
    `/api/v1/sessions/${sessionId}/teams/${teamId}/results`,
  RESULTS_TEAM_ROUND: (teamId: string, round: number) =>
    `/api/v1/results/teams/${teamId}/round/${round}`,
  RESULTS_TEAM_HISTORY: (teamId: string) =>
    `/api/v1/results/teams/${teamId}/history`,
  RESULTS_FINANCIALS: (sessionId: string, teamId: string) =>
    `/api/v1/sessions/${sessionId}/teams/${teamId}/financials`,
  RESULTS_TEAM_FINANCIALS: (teamId: string) =>
    `/api/v1/results/teams/${teamId}/financials`,
  RESULTS_MARKET_REPORT: (sessionId: string, round: number) =>
    `/api/v1/results/sessions/${sessionId}/market-report/${round}`,

  // Notes
  ROUND_NOTES: (sessionId: string, round: number) =>
    `/api/v1/sessions/${sessionId}/round/${round}/notes`,

  // Gamification
  LEADERBOARD: (sessionId: string) =>
    `/api/v1/sessions/${sessionId}/leaderboard`,
  FINAL_REPORT: (sessionId: string) =>
    `/api/v1/sessions/${sessionId}/final-report`,
  BADGES: (sessionId: string) =>
    `/api/v1/sessions/${sessionId}/badges`,
  SCORING_WEIGHTS: (sessionId: string) =>
    `/api/v1/sessions/${sessionId}/scoring/weights`,

  // SSE
  SSE_PROGRESS: (sessionId: string) => `/api/v1/sessions/${sessionId}/sse`,
} as const;

// ------------------------------------------------------------
// Color Palette for Teams
// ------------------------------------------------------------

export const TEAM_COLOR_PALETTE = [
  '#3B82F6', // blue-500
  '#EF4444', // red-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#F97316', // orange-500
  '#84CC16', // lime-500
  '#6366F1', // indigo-500
] as const;

// ------------------------------------------------------------
// Default Game Configuration
// ------------------------------------------------------------

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  starting_cash: 500000,
  interest_rate: 0.05,
  tax_rate: 0.25,
  depreciation_rate: 0.1,
  market_growth_rate: 0.03,
};

export const DEFAULT_SESSION_SETTINGS = {
  max_rounds: 12,
  round_duration_minutes: 30,
};

// ------------------------------------------------------------
// Route Configuration
// ------------------------------------------------------------

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  JOIN: '/join',
  TEACHER_DASHBOARD: '/teacher',
  TEACHER_SESSIONS: '/teacher/sessions',
  TEACHER_SESSION: (id: string) => `/teacher/sessions/${id}`,
  TEACHER_SETUP: (id: string) => `/teacher/sessions/${id}/setup`,
  TEACHER_MONITOR: (id: string) => `/teacher/sessions/${id}/monitor`,
  TEACHER_RESULTS: (id: string, round: number) => `/teacher/sessions/${id}/results/${round}`,
  TEACHER_ANALYTICS: (id: string) => `/teacher/sessions/${id}/analytics`,
  TEACHER_FINAL: (id: string) => `/teacher/sessions/${id}/final`,
  STUDENT_DASHBOARD: '/game/dashboard',
  STUDENT_DECISIONS: '/game/decisions',
  STUDENT_ORG_CHART: '/game/org-chart',
  STUDENT_RESULTS: '/game/results',
  STUDENT_FINANCES: '/game/finances',
  STUDENT_RANKING: '/game/ranking',
  STUDENT_FINAL_REPORT: '/game/final',
  GAME_DASHBOARD: '/game',
  GAME_DECISIONS: '/game/decisions',
  GAME_RESULTS: '/game/results',
  GAME_MARKET: '/game/market',
  GAME_TEAM: '/game/team',
  SETTINGS: '/settings',
} as const;

import type { SessionConfig } from './types';
