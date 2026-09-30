import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import { AdminModuleKeys } from '../../../di/AdminModuleKeys';
import type { AdminRepository } from '../../repository/AdminRepository';
import type { DiscoveredModel } from '../../entities/DiscoveredModel';
import type { DiscoverModelsParams, DiscoverModelsUseCase } from '../DiscoverModelsUseCase';

@injectable()
export class DiscoverModelsUseCaseImpl implements DiscoverModelsUseCase {
  constructor(
    @inject(AdminModuleKeys.AdminRepository)
    private readonly repository: AdminRepository,
  ) {}

  execute(params: DiscoverModelsParams): Observable<Result<DiscoveredModel[], string>> {
    return this.repository.discoverModels(
      params.adapter,
      params.apiBase,
      params.apiKey,
      params.providerKeyId,
    );
  }
}
