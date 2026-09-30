import { inject, injectable } from 'inversify';
import { safeRequest } from '@/core/network/HttpClient';
import type { HttpClient } from '@/core/network/HttpClient';
import type { ApiResult, ErrorResponse } from '@/core/types';
import type { ProviderDto } from '../../entities/ProviderDto';
import type { ProviderRemoteDataSource } from '../ProviderRemoteDataSource';
import { CoreModuleKeys } from '@/core/di/keys';

@injectable()
export class ProviderRemoteDataSourceImpl implements ProviderRemoteDataSource {
  constructor(
    @inject(CoreModuleKeys.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  listProviders(): Promise<ApiResult<ProviderDto[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ProviderDto[]>('/admin/v1/providers'));
  }
}
