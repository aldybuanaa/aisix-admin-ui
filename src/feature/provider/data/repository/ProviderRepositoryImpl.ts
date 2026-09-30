import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import { toResultObservable } from '@/core/network/resultObservable';
import type { Provider } from '../../domain/entities/Provider';
import type { ProviderRepository } from '../../domain/repository/ProviderRepository';
import type { ProviderRemoteDataSource } from '../remote/data-sources/ProviderRemoteDataSource';
import { ProviderModuleKeys } from '../../di/ProviderModuleKeys';
import { mapProviderDtoToDomain } from '../../utils/mapper/mapProviderDto';

@injectable()
export class ProviderRepositoryImpl implements ProviderRepository {
  constructor(
    @inject(ProviderModuleKeys.ProviderRemoteDataSource)
    private readonly remoteDataSource: ProviderRemoteDataSource
  ) {}

  listProviders(): Observable<Result<Provider[], string>> {
    return toResultObservable(
      this.remoteDataSource.listProviders(),
      (dtos) => dtos.map(mapProviderDtoToDomain),
      'Gagal memuat daftar provider'
    );
  }
}
