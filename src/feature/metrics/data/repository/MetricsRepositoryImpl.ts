import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { MetricsModuleKeys } from '../../di/MetricsModuleKeys';
import type { MetricsRemoteDataSource } from '../remote/data-sources/MetricsRemoteDataSource';
import type { MetricsRepository } from '../../domain/repository/MetricsRepository';
import type { HealthStatus, MetricsSummary, ModelStatusEntry } from '../../domain/entities/MetricsEntity';
import type { Result } from '@/core/types';

@injectable()
export class MetricsRepositoryImpl implements MetricsRepository {
  constructor(
    @inject(MetricsModuleKeys.MetricsRemoteDataSource)
    private readonly ds: MetricsRemoteDataSource,
  ) {}

  getHealth(): Observable<Result<HealthStatus, string>> {
    return this.ds.getHealth();
  }

  getModelStatuses(): Observable<Result<ModelStatusEntry[], string>> {
    return this.ds.getModelStatuses();
  }

  getMetricsSummary(): Observable<Result<MetricsSummary, string>> {
    return this.ds.getMetricsSummary();
  }
}
