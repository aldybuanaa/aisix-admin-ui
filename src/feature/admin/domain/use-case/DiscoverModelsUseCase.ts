import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { DiscoveredModel, DiscoverAdapter } from '../entities/DiscoveredModel';

export interface DiscoverModelsParams {
  adapter: DiscoverAdapter;
  apiBase?: string;
  apiKey?: string;
  providerKeyId?: string;
}

export interface DiscoverModelsUseCase {
  execute(params: DiscoverModelsParams): Observable<Result<DiscoveredModel[], string>>;
}
