import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { Provider } from '../../entities/Provider';
import type { ProviderRepository } from '../../repository/ProviderRepository';
import type { GetProvidersUseCase } from '../GetProvidersUseCase';
import { ProviderModuleKeys } from '../../../di/ProviderModuleKeys';
@injectable()
export class GetProvidersUseCaseImpl implements GetProvidersUseCase {
  constructor(@inject(ProviderModuleKeys.ProviderRepository) private readonly repository: ProviderRepository) {}
  execute(): Observable<Result<Provider[], string>> { return this.repository.listProviders(); }
}
