import type { ApiResult, ErrorResponse } from '@/core/types';
import type { ProviderDto } from '../entities/ProviderDto';

export interface ProviderRemoteDataSource {
  listProviders(): Promise<ApiResult<ProviderDto[], ErrorResponse>>;
}
