import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type {
  HealthStatus,
  MetricsSummary,
  ModelStatusEntry,
} from '../entities/MetricsEntity';

export interface MetricsRepository {
  getHealth(): Observable<Result<HealthStatus, string>>;
  getModelStatuses(): Observable<Result<ModelStatusEntry[], string>>;
  getMetricsSummary(): Observable<Result<MetricsSummary, string>>;
}
