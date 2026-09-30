import type { Container } from 'inversify';
import { MetricsModuleKeys } from './MetricsModuleKeys';
import type { MetricsRemoteDataSource } from '../data/remote/data-sources/MetricsRemoteDataSource';
import { MetricsRemoteDataSourceImpl } from '../data/remote/data-sources/implementation/MetricsRemoteDataSourceImpl';
import type { MetricsRepository } from '../domain/repository/MetricsRepository';
import { MetricsRepositoryImpl } from '../data/repository/MetricsRepositoryImpl';
import { MetricsDashboardViewModel } from '../presentation/viewmodel/MetricsDashboardViewModel';

export function registerMetricsModules(container: Container): void {
  container
    .bind<MetricsRemoteDataSource>(MetricsModuleKeys.MetricsRemoteDataSource)
    .to(MetricsRemoteDataSourceImpl)
    .inSingletonScope();
  container
    .bind<MetricsRepository>(MetricsModuleKeys.MetricsRepository)
    .to(MetricsRepositoryImpl)
    .inSingletonScope();
  container
    .bind<MetricsDashboardViewModel>(MetricsModuleKeys.MetricsDashboardViewModel)
    .to(MetricsDashboardViewModel);
}
