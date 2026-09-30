// Metrics domain entities — shaped to match real backend contracts.
//
// Endpoints:
//   GET /admin/v1/health          → HealthStatus
//   GET /admin/v1/models/status   → ModelStatusEntry[]
//   GET /admin/v1/metrics         → Prometheus text → MetricsSummary (via parser)

/** Numeric health code returned inside the health endpoint's models array. */
export type ModelHealthNumeric = 0 | 1 | 2; // 0=Healthy, 1=Degraded, 2=Down

export interface HealthModelEntry {
  id: string;
  name: string;
  health: ModelHealthNumeric;
}

export interface HealthConfig {
  snapshot_revision: number;
  snapshot_age_seconds: number;
}

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  models: HealthModelEntry[];
  config: HealthConfig;
}

export type ModelRuntimeStatus = 'healthy' | 'unhealthy' | 'cooldown' | 'not_applicable' | 'unknown';

export interface ModelStatusEntry {
  id: string;
  display_name: string;
  kind: 'direct' | 'routing' | 'ensemble' | 'semantic';
  status: ModelRuntimeStatus;
  cooldown_until: number | null;
  last_checked_at: number | null;
  last_check_status: number | null;
  status_reason: string | null;
}

export interface ProviderBreakdown {
  requests: number;
  tokens: number;
}

export interface MetricsSummary {
  total_requests: number;
  total_tokens: number;
  avg_latency_ms: number;
  provider_breakdown: Record<string, ProviderBreakdown>;
}

export interface DashboardData {
  health: HealthStatus;
  modelStatuses: ModelStatusEntry[];
  metrics: MetricsSummary;
}
