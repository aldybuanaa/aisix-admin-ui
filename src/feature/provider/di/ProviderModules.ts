import type { Container } from 'inversify';
import { ProviderModuleKeys } from './ProviderModuleKeys';
import type { ProviderRemoteDataSource } from '../data/remote/data-sources/ProviderRemoteDataSource';
import { ProviderRemoteDataSourceImpl } from '../data/remote/data-sources/implementation/ProviderRemoteDataSourceImpl';
import type { ProviderRepository } from '../domain/repository/ProviderRepository';
import { ProviderRepositoryImpl } from '../data/repository/ProviderRepositoryImpl';
import type { GetProvidersUseCase } from '../domain/use-case/GetProvidersUseCase';
import { GetProvidersUseCaseImpl } from '../domain/use-case/implementation/GetProvidersUseCaseImpl';
import { ProviderListViewModel } from '../viewmodel/ProviderListViewModel';

export function registerProviderModules(container: Container) {
  // Data
  container
    .bind<ProviderRemoteDataSource>(ProviderModuleKeys.ProviderRemoteDataSource)
    .to(ProviderRemoteDataSourceImpl)
    .inSingletonScope();

  container
    .bind<ProviderRepository>(ProviderModuleKeys.ProviderRepository)
    .to(ProviderRepositoryImpl)
    .inSingletonScope();

  // Domain
  container
    .bind<GetProvidersUseCase>(ProviderModuleKeys.GetProvidersUseCase)
    .to(GetProvidersUseCaseImpl);

  // Presentation
  container
    .bind<ProviderListViewModel>(ProviderModuleKeys.ProviderListViewModel)
    .to(ProviderListViewModel);
}
