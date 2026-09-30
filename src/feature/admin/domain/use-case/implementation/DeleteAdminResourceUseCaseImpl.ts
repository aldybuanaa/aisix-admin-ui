import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { Result } from '@/core/types';
import { Result as ResultFactory } from '@/core/types';
import { AdminModuleKeys } from '../../../di/AdminModuleKeys';
import type { AdminRepository } from '../../repository/AdminRepository';
import type { AdminResourceKey } from '../../entities/AdminResource';
import type { DeleteAdminResourceUseCase } from '../DeleteAdminResourceUseCase';

@injectable()
export class DeleteAdminResourceUseCaseImpl implements DeleteAdminResourceUseCase {
  constructor(
    @inject(AdminModuleKeys.AdminRepository)
    private readonly repository: AdminRepository,
  ) {}

  execute(resourceKey: AdminResourceKey, id: string): Observable<Result<void, string>> {
    switch (resourceKey) {
      case 'models':
        return this.repository.deleteModel(id);
      case 'provider_keys':
        return this.repository.deleteProviderKey(id);
      case 'api_keys':
        return this.repository.deleteApiKey(id);
      case 'guardrails':
        return this.repository.deleteGuardrail(id);
      case 'cache_policies':
        return this.repository.deleteCachePolicy(id);
      case 'mcp_servers':
        return this.repository.deleteMcpServer(id);
      case 'a2a_agents':
        return this.repository.deleteA2aAgent(id);
      case 'passthrough_routes':
        return this.repository.deletePassthroughRoute(id);
      case 'observability_exporters':
        return of(ResultFactory.Failure('Observability exporter tidak dapat dihapus'));
      default:
        return of(ResultFactory.Failure(`Tipe resource tidak valid: ${String(resourceKey)}`));
    }
  }
}
