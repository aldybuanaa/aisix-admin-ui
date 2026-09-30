import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { Provider } from '../entities/Provider';

export interface GetProvidersUseCase {
  execute(): Observable<Result<Provider[], string>>;
}
