import type { AsyncState } from '@/core/types';
import type { HealthStatus, MetricsSummary, ModelStatusEntry } from '../../domain/entities/MetricsEntity';

export interface MetricsDashboardState {
  healthState: AsyncState<HealthStatus>;
  modelStatusState: AsyncState<ModelStatusEntry[]>;
  metricsState: AsyncState<MetricsSummary>;
  lastRefreshedAt: string | null;
}

export const initialMetricsDashboardState: MetricsDashboardState = {
  healthState: { type: 'Idle' },
  modelStatusState: { type: 'Idle' },
  metricsState: { type: 'Idle' },
  lastRefreshedAt: null,
};
