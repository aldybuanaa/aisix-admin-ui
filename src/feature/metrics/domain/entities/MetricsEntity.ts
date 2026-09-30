// -------------------------------------------------------
// Metrics data layer — typed contracts for backend endpoints
//
// Candidate endpoints (Bima to confirm):
//   GET /admin/v1/health       → HealthStatus
//   GET /livez                 → text "ok"
//   GET /admin/v1/models/status → ModelStatusMap
//   GET /admin/v1/metrics/summary → MetricsSummary
// -------------------------------------------------------

export type HealthState = 'ok' | 'degraded' | 'error' | 'unknown';

export interface HealthStatus {
  status: HealthState;
  version?: string;
  uptime_seconds?: number;
  checks?: Record<string, { status: HealthState; message?: string }>;
}

export interface ModelStatusEntry {
  id: string;
  display_name?: string;
  provider: string;
  status: 'active' | 'error' | 'rate_limited' | 'unknown';
  last_used_at?: string;
  request_count_1h?: number;
  error_rate_1h?: number;
}

export interface MetricsSummary {
  total_requests_1h: number;
  total_tokens_1h?: number;
  avg_latency_ms?: number;
  p99_latency_ms?: number;
  error_rate?: number;
  active_models?: number;
  provider_breakdown?: Record<string, { requests: number; tokens?: number }>;
}

export interface DashboardData {
  health: HealthStatus;
  modelStatuses: ModelStatusEntry[];
  metrics: MetricsSummary;
}
