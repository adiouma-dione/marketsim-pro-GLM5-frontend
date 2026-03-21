// ============================================================
// MarketSim Pro - TypeScript Types from OpenAPI Schemas
// ============================================================

// ------------------------------------------------------------
// Auth Types
// ------------------------------------------------------------

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserCreate {
  email: string;
  password: string;
  role?: UserRole;
  username?: string;
  full_name?: string;
}

export interface UserUpdate {
  email?: string;
  username?: string;
  full_name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  school_id?: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ChangePasswordResponse {
  success?: boolean;
  message?: string;
}

export interface MessageResponse {
  message: string;
  detail?: string;
}

// ------------------------------------------------------------
// Session Types
// ------------------------------------------------------------

export type GameSessionStatus = 'draft' | 'active' | 'paused' | 'finished';

export interface SessionConfig {
  starting_cash: number;
  interest_rate: number;
  tax_rate: number;
  depreciation_rate: number;
  market_growth_rate: number;
}

export interface GameSessionCreate {
  name: string;
  max_rounds?: number;
  round_duration_minutes?: number;
  config?: SessionConfig;
}

export interface GameSessionResponse {
  id: string;
  name: string;
  teacher_id: string;
  status: GameSessionStatus;
  current_round: number;
  max_rounds: number;
  round_duration_minutes: number;
  config?: Record<string, unknown> | null;
  created_at: string;
  teams_count?: number;
  teacher?: UserResponse;
}

export interface TeacherSetupTeam {
  id: string;
  name: string;
  color_hex: string;
}

export interface TeacherSetupStudent {
  id: string;
  email: string;
  full_name?: string;
}

export interface TeacherSetupAdvanced {
  starting_cash: number;
  interest_rate: number;
  energy_price: number;
  base_market_demand: number;
}

export interface TeacherSetupResponse {
  session_id: string;
  teams: TeacherSetupTeam[];
  students: TeacherSetupStudent[];
  student_assignments: Record<string, string[]>;
  team_directors: Record<string, string | null>;
  team_org_required: Record<string, boolean>;
  team_org_complete: Record<string, boolean>;
  advanced: TeacherSetupAdvanced;
}

export interface TeacherSetupUpdateResponse {
  session_id: string;
  message: string;
}

export interface RoundNotesResponse {
  session_id: string;
  round_number: number;
  notes: string;
}

export interface SimulationStartResponse {
  task_id: string;
  session_id: string;
  round_number: number;
  status: string;
  message: string;
}

export interface SimulationProgress {
  state: 'running' | 'waiting' | 'results';
  progress_percent?: number;
  estimated_completion?: string;
  countdown_seconds?: number;
  current_round: number;
}

export interface TaskStatusResponse {
  task_id: string;
  state: string;
  celery_state: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ForceSubmitCreatedTeam {
  team_id: string;
  team_name: string;
}

export interface ForceSubmitResponse {
  session_id: string;
  round_number: number;
  created_count: number;
  created: ForceSubmitCreatedTeam[];
}

export interface ReplayRoundResponse {
  session_id: string;
  reopened_round: number;
  message: string;
}

export interface ManualEventResponse {
  id: string;
  session_id: string;
  round_number: number;
  event_type: string;
  severity: number;
  description: string;
}

export interface SurpriseAuditResponse {
  session_id: string;
  round_number: number;
  scheduled_targets: string[];
  message: string;
}

export interface DecisionStatus {
  round_number: number;
  total_teams: number;
  submitted_teams: number;
  pending_teams: number;
  all_submitted: boolean;
}

export interface ControlMonitorRow {
  team_id: string;
  team_name: string;
  team_color?: string;
  decisions_submitted: boolean;
  decision_status?: 'pending' | 'draft' | 'submitted';
  cash: number;
  market_share: number;
  rank: number;
  qhse_score: number;
  rse_score: number;
  iso_certified: boolean;
  iso_badge: string;
}

export interface ControlMonitorIncident {
  team_id: string;
  team_name: string;
  round_number: number;
  audit_triggered: boolean;
  accident: boolean;
  non_conformity: boolean;
  penalty: number;
  subsidy: number;
}

export interface ControlMonitorResponse {
  session_id: string;
  current_round: number;
  status: GameSessionStatus;
  all_submitted: boolean;
  rows: ControlMonitorRow[];
  incident_log: ControlMonitorIncident[];
}

// ------------------------------------------------------------
// Team Types
// ------------------------------------------------------------

export type MachineType = 'basic' | 'standard' | 'premium';

export interface MachineData {
  id: string;
  machine_type: MachineType;
  quantity: number;
  purchase_round: number;
  is_active: boolean;
  accumulated_depreciation: number;
  created_at: string;
}

export interface TeamCreate {
  name: string;
  color_hex?: string;
}

export interface TeamUpdate {
  name?: string;
  color_hex?: string;
  cash?: number;
  debt?: number;
  equity?: number;
  brand_score?: number;
}

export interface TeamMemberResponse {
  id: string;
  email: string;
  full_name?: string;
  org_roles?: string[];
}

export interface TeamResponse {
  id: string;
  session_id: string;
  name: string;
  color_hex: string;
  cash: number;
  debt: number;
  equity: number;
  brand_score: number;
  created_at: string;
  machines?: MachineData[];
  current_user_roles?: string[];
  director_user_id?: string | null;
  org_chart_required?: boolean;
  org_chart_complete?: boolean;
}

export interface TeamDetailResponse extends TeamResponse {
  members: TeamMemberResponse[];
}

export interface TeamOrgChartResponse {
  team_id: string;
  director_user_id?: string | null;
  production_user_ids: string[];
  finance_user_ids: string[];
  marketing_user_ids: string[];
  quality_hr_user_ids: string[];
  required: boolean;
  complete: boolean;
  missing_roles: string[];
}

export interface TeamOrgChartUpdateRequest {
  director_user_id?: string | null;
  production_user_ids: string[];
  finance_user_ids: string[];
  marketing_user_ids: string[];
  quality_hr_user_ids: string[];
}

export interface TeamDashboard {
  team: TeamDetailResponse;
  current_round: number;
  decisions_submitted: boolean;
  market_events?: Record<string, unknown>[] | null;
  last_results?: RoundResultData | null;
}

// ------------------------------------------------------------
// Decision Types
// ------------------------------------------------------------

export interface DecisionCreate {
  round_number: number;
  price_per_unit?: number;
  production_volume?: number;
  marketing_budget?: number;
  maintenance_budget?: number;
  loan_amount?: number;
  rd_investment?: number;
  qhse_investment?: number;
  hr_investment?: number;
  avg_salary?: number;
}

export interface DecisionUpdate {
  price_per_unit?: number;
  production_volume?: number;
  marketing_budget?: number;
  maintenance_budget?: number;
  loan_amount?: number;
  rd_investment?: number;
  qhse_investment?: number;
  hr_investment?: number;
  avg_salary?: number;
}

export interface DecisionResponse extends DecisionCreate {
  id: string;
  team_id: string;
  submitted_at: string;
  is_locked: boolean;
}

// ------------------------------------------------------------
// Result Types
// ------------------------------------------------------------

export interface RoundResultData {
  id: string;
  team_id: string;
  round_number: number;
  units_sold: number;
  units_produced: number;
  revenue: number;
  cogs: number;
  gross_margin: number;
  marketing_expense: number;
  admin_expense: number;
  maintenance_expense: number;
  rd_expense: number;
  qhse_expense: number;
  hr_expense: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest_expense: number;
  net_income: number;
  cash_flow: number;
  inventory_value: number;
  accounts_receivable: number;
  accounts_payable: number;
  market_share_pct: number;
  customer_satisfaction: number;
  quality_score: number;
  qhse_score: number;
  rse_score: number;
  brand_score_delta: number;
  motivation: number;
  turnover_rate: number;
  productivity: number;
  strike_days: number;
  cumulative_rd_investment: number;
  innovation_bonus: number;
  patent_active_turns: number;
  new_market_unlocked: boolean;
  qhse_financial_penalty: number;
  qhse_eco_subsidy: number;
  qhse_audit_triggered: boolean;
  qhse_accident_occurred: boolean;
  qhse_non_conformity: boolean;
  iso_certified: boolean;
  iso_badge: string;
  ending_cash: number;
  ending_debt: number;
  created_at: string;
}

export interface RoundResultResponse {
  result: RoundResultData;
  team_name: string;
  team_color: string;
}

export interface SessionResults {
  round_number: number;
  results: RoundResultResponse[];
  total_market_demand: number;
  average_price: number;
  average_quality: number;
}

export interface IncomeStatement {
  round_number: number;
  revenue: number;
  cogs: number;
  gross_margin: number;
  marketing_expense: number;
  admin_expense: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  interest_expense: number;
  net_income: number;
}

export interface BalanceSheetAssets {
  cash: number;
  accounts_receivable: number;
  inventory: number;
  fixed_assets: number;
  total: number;
}

export interface BalanceSheetLiabilities {
  accounts_payable: number;
  debt: number;
  total: number;
}

export interface BalanceSheet {
  round_number: number;
  assets: BalanceSheetAssets;
  liabilities: BalanceSheetLiabilities;
  equity: number;
}

export interface CashFlowStatement {
  round_number: number;
  operating_cash_flow: number;
  investing_cash_flow: number;
  financing_cash_flow: number;
  net_cash_flow: number;
  beginning_cash: number;
  ending_cash: number;
}

export interface TeamFinancials {
  team_id: string;
  income_statements: IncomeStatement[];
  balance_sheets: BalanceSheet[];
  cash_flows: CashFlowStatement[];
}

export interface TeamResultsHistory {
  team_id: string;
  team_name: string;
  results: RoundResultData[];
  summary: Record<string, unknown>;
}

export interface MarketReport {
  round_number: number;
  total_demand: number;
  total_supply: number;
  average_price: number;
  price_range: Record<string, number>;
  total_marketing: number;
  economic_index: number;
  active_events: Record<string, unknown>[];
  team_rankings: Record<string, unknown>[];
  qhse?: Record<string, unknown> | null;
}

// ------------------------------------------------------------
// Gamification Types (responses untyped in OpenAPI)
// ------------------------------------------------------------

export type LeaderboardResponse = Record<string, unknown>;
export type FinalReportResponse = Record<string, unknown>;
export type BadgesResponse = Record<string, unknown>[];

// ------------------------------------------------------------
// API Error Types
// ------------------------------------------------------------

export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
}

export interface ApiValidationError {
  detail: Array<{
    loc: string[];
    msg: string;
    type: string;
  }>;
}

// ------------------------------------------------------------
// SSE Event Types
// ------------------------------------------------------------

export interface SSESimulationProgressEvent {
  type: 'progress';
  data: SimulationProgress;
}

export interface SSESimulationCompleteEvent {
  type: 'complete';
  data: SessionResults;
}

export interface SSEDecisionSubmittedEvent {
  type: 'decision_submitted';
  data: { team_id: string; round_number: number };
}

export type SSEEvent =
  | SSESimulationProgressEvent
  | SSESimulationCompleteEvent
  | SSEDecisionSubmittedEvent;
