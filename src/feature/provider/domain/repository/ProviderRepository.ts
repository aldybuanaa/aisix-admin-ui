import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { Provider } from '../entities/Provider';

export interface ProviderRepository {
  listProviders(): Observable<Result<Provider[], string>>;
}
