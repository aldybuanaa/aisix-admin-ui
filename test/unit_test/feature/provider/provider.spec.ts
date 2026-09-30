import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import 'reflect-metadata';
import { Container } from 'inversify';
import type { Result } from '@/core/types';
import { Result as ResultFactory } from '@/core/types';
import { CoreModuleKeys } from '@/core/di/keys';
import type { HttpClient } from '@/core/network/HttpClient';
import { ProviderModuleKeys } from '@/feature/provider/di/ProviderModuleKeys';
import { registerProviderModules } from '@/feature/provider/di/ProviderModules';
import type { Provider } from '@/feature/provider/domain/entities/Provider';
import { mapProviderDtoToDomain } from '@/feature/provider/utils/mapper/mapProviderDto';
import { GetProvidersUseCaseImpl } from '@/feature/provider/domain/use-case/implementation/GetProvidersUseCaseImpl';
import type { ProviderRepository } from '@/feature/provider/domain/repository/ProviderRepository';
import { ProviderListViewModel } from '@/feature/provider/viewmodel/ProviderListViewModel';
import type { GetProvidersUseCase } from '@/feature/provider/domain/use-case/GetProvidersUseCase';

const dto = {
  id: 'prov-1',
  name: 'Provider Satu',
  base_url: 'https://api.provider-satu.test',
  enabled: true,
};

const domainProvider: Provider = {
  id: 'prov-1',
  name: 'Provider Satu',
  baseUrl: 'https://api.provider-satu.test',
  enabled: true,
};

function createRepository(result: Result<Provider[], string>): ProviderRepository {
  return {
    listProviders: () => of(result),
  };
}

describe('mapProviderDtoToDomain', () => {
  it('maps snake_case payload onto camelCase domain fields', () => {
    expect(mapProviderDtoToDomain(dto)).toEqual(domainProvider);
  });

  it('keeps disabled providers disabled', () => {
    expect(mapProviderDtoToDomain({ ...dto, enabled: false }).enabled).toBe(false);
  });
});

describe('GetProvidersUseCaseImpl', () => {
  it('delegates execute to the repository observable', () => {
    const repository = createRepository(ResultFactory.Success([domainProvider]));
    const useCase = new GetProvidersUseCaseImpl(repository);

    let observed: Result<Provider[], string> | undefined;
    useCase.execute().subscribe((result) => {
      observed = result;
    });

    expect(observed).toEqual(ResultFactory.Success([domainProvider]));
  });
});

describe('provider DI modules', () => {
  it('resolves a working ViewModel graph with a bound HttpClient', async () => {
    const httpClient: HttpClient = {
      get: vi.fn().mockResolvedValue({ status: 200, data: [dto], headers: new Headers() }),
      getText: vi.fn().mockResolvedValue({ status: 200, data: '', headers: new Headers() }),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    const container = new Container();
    container.bind<HttpClient>(CoreModuleKeys.HttpClient).toConstantValue(httpClient);
    registerProviderModules(container);

    const viewModel = container.get<ProviderListViewModel>(ProviderModuleKeys.ProviderListViewModel);
    viewModel.load();
    await new Promise<void>((resolve) => queueMicrotask(resolve));

    expect(httpClient.get).toHaveBeenCalledWith('/admin/v1/providers');
    expect(viewModel.uiState.providers).toEqual([domainProvider]);
  });
});

describe('ProviderListViewModel', () => {
  function createViewModel(useCase: GetProvidersUseCase) {
    return new ProviderListViewModel(useCase);
  }

  it('starts idle with no providers', () => {
    const viewModel = createViewModel({ execute: () => of(ResultFactory.Loading<Provider[]>()) });

    expect(viewModel.uiState.status.type).toBe('Idle');
    expect(viewModel.uiState.providers).toEqual([]);
  });

  it('reports Loading before the providers arrive', () => {
    const viewModel = createViewModel({ execute: () => of(ResultFactory.Loading<Provider[]>()) });

    viewModel.load();

    expect(viewModel.uiState.status.type).toBe('Loading');
  });

  it('exposes providers on success', () => {
    const viewModel = createViewModel({
      execute: () => of(ResultFactory.Success([domainProvider])),
    });

    viewModel.load();

    expect(viewModel.uiState.status.type).toBe('Success');
    expect(viewModel.uiState.providers).toEqual([domainProvider]);
  });

  it('exposes an empty list when the backend returns none', () => {
    const viewModel = createViewModel({ execute: () => of(ResultFactory.Success<Provider[]>([])) });

    viewModel.load();

    expect(viewModel.uiState.status.type).toBe('Success');
    expect(viewModel.uiState.providers).toEqual([]);
  });

  it('drops stale providers and exposes the message on failure', () => {
    const viewModel = createViewModel({
      execute: () => of(ResultFactory.Failure('Gagal memuat daftar provider')),
    });

    viewModel.load();

    expect(viewModel.uiState.status.type).toBe('Error');
    expect(viewModel.uiState.status.type === 'Error' && viewModel.uiState.status.message).toBe(
      'Gagal memuat daftar provider'
    );
    expect(viewModel.uiState.providers).toEqual([]);
  });

  it('maps a transport failure to the error state', () => {
    const viewModel = createViewModel({
      execute: () => of(ResultFactory.GenericError<Provider[]>(new Error('jaringan putus'))),
    });

    viewModel.load();

    expect(viewModel.uiState.status.type).toBe('Error');
    expect(viewModel.uiState.providers).toEqual([]);
  });

  it('cancels the in-flight request when disposed', () => {
    const viewModel = createViewModel({ execute: () => of(ResultFactory.Loading<Provider[]>()) });
    const disposeSpy = vi.spyOn(viewModel, 'dispose');

    viewModel.load();
    viewModel.dispose();

    expect(disposeSpy).toHaveBeenCalled();
  });
});
