import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { BaseViewModel } from '@/core/ui/BaseViewModel';
import { MetricsModuleKeys } from '../../di/MetricsModuleKeys';
import type { MetricsRepository } from '../../domain/repository/MetricsRepository';
import type { HealthStatus, MetricsSummary, ModelStatusEntry } from '../../domain/entities/MetricsEntity';
import { initialMetricsDashboardState, type MetricsDashboardState } from '../state/MetricsDashboardState';

@injectable()
export class MetricsDashboardViewModel extends BaseViewModel<MetricsDashboardState> {
  constructor(
    @inject(MetricsModuleKeys.MetricsRepository)
    private readonly repository: MetricsRepository,
  ) {
    super(initialMetricsDashboardState);
  }

  load(): void {
    // Fire all three requests concurrently
    this.collectResult<HealthStatus>(
      'health',
      this.repository.getHealth(),
      (s, asyncState) => {
        s.healthState = asyncState;
        if (asyncState.type === 'Success' || asyncState.type === 'Error') {
          s.lastRefreshedAt = new Date().toISOString();
        }
      },
    );

    this.collectResult<ModelStatusEntry[]>(
      'model_statuses',
      this.repository.getModelStatuses(),
      (s, asyncState) => {
        s.modelStatusState = asyncState;
      },
    );

    this.collectResult<MetricsSummary>(
      'metrics_summary',
      this.repository.getMetricsSummary(),
      (s, asyncState) => {
        s.metricsState = asyncState;
      },
    );
  }

  refresh(): void {
    this.load();
  }
}
