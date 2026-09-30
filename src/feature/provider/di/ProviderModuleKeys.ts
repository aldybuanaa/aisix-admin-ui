import type { InjectionKey } from 'vue';
import type { ProviderRemoteDataSource } from '../data/remote/data-sources/ProviderRemoteDataSource';
import type { ProviderRepository } from '../domain/repository/ProviderRepository';
import type { GetProvidersUseCase } from '../domain/use-case/GetProvidersUseCase';
import type { ProviderListViewModel } from '../viewmodel/ProviderListViewModel';

export const ProviderModuleKeys = {
  ProviderRemoteDataSource: Symbol('ProviderRemoteDataSource') as InjectionKey<ProviderRemoteDataSource>,
  ProviderRepository: Symbol('ProviderRepository') as InjectionKey<ProviderRepository>,
  GetProvidersUseCase: Symbol('GetProvidersUseCase') as InjectionKey<GetProvidersUseCase>,
  ProviderListViewModel: Symbol('ProviderListViewModel') as InjectionKey<ProviderListViewModel>,
};
