import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { toResultObservable } from '@/core/network/resultObservable';
import { safeRequest } from '@/core/network/HttpClient';
import type { HttpClient } from '@/core/network/HttpClient';
import type { Result } from '@/core/types';
import { CoreModuleKeys } from '@/core/di/keys';
import type { MetricsRemoteDataSource } from '../MetricsRemoteDataSource';
import type {
  HealthStatus,
  MetricsSummary,
  ModelStatusEntry,
} from '../../../../domain/entities/MetricsEntity';

@injectable()
export class MetricsRemoteDataSourceImpl implements MetricsRemoteDataSource {
  constructor(
    @inject(CoreModuleKeys.HttpClient)
    private readonly http: HttpClient,
  ) {}

  getHealth(): Observable<Result<HealthStatus, string>> {
    return toResultObservable(
      safeRequest<HealthStatus, { message: string | null }>(() => this.http.get('/admin/v1/health')),
      (body) => {
        if (body && typeof body === 'object' && 'status' in body) return body;
        return { status: 'ok' } as HealthStatus;
      },
      'Failed to fetch health status',
    );
  }

  getModelStatuses(): Observable<Result<ModelStatusEntry[], string>> {
    return toResultObservable(
      safeRequest<unknown, { message: string | null }>(() => this.http.get('/admin/v1/models/status')),
      (raw): ModelStatusEntry[] => {
        if (Array.isArray(raw)) return raw as ModelStatusEntry[];
        if (raw && typeof raw === 'object') {
          return Object.entries(raw as Record<string, unknown>).map(([id, val]) => {
            if (typeof val === 'object' && val !== null) {
              const v = val as Record<string, unknown>;
              return {
                id,
                provider: typeof v.provider === 'string' ? v.provider : 'unknown',
                status: typeof v.status === 'string' ? (v.status as ModelStatusEntry['status']) : 'active',
                display_name: typeof v.display_name === 'string' ? v.display_name : undefined,
                last_used_at: typeof v.last_used_at === 'string' ? v.last_used_at : undefined,
                request_count_1h: typeof v.request_count_1h === 'number' ? v.request_count_1h : undefined,
                error_rate_1h: typeof v.error_rate_1h === 'number' ? v.error_rate_1h : undefined,
              };
            }
            return { id, provider: 'unknown', status: 'active' as const };
          });
        }
        return [];
      },
      'Failed to fetch model statuses',
    );
  }

  getMetricsSummary(): Observable<Result<MetricsSummary, string>> {
    return toResultObservable(
      safeRequest<MetricsSummary, { message: string | null }>(() =>
        this.http.get('/admin/v1/metrics/summary'),
      ),
      (body) => {
        if (body && typeof body === 'object') return body;
        return { total_requests_1h: 0 };
      },
      'Failed to fetch metrics summary',
    );
  }
}
