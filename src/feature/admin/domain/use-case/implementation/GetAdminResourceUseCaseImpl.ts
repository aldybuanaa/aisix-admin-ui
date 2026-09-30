import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { Result } from '@/core/types';
import { Result as ResultFactory } from '@/core/types';
import { AdminModuleKeys } from '../../../di/AdminModuleKeys';
import type { AdminRepository } from '../../repository/AdminRepository';
import type { AdminResource, AdminResourceKey } from '../../entities/AdminResource';
import type { GetAdminResourceUseCase } from '../GetAdminResourceUseCase';

@injectable()
export class GetAdminResourceUseCaseImpl implements GetAdminResourceUseCase {
  constructor(
    @inject(AdminModuleKeys.AdminRepository)
    private readonly repository: AdminRepository,
  ) {}

  execute(resourceKey: AdminResourceKey, id: string): Observable<Result<AdminResource, string>> {
    switch (resourceKey) {
      case 'models':
        return this.repository.getModel(id) as Observable<Result<AdminResource, string>>;
      case 'provider_keys':
        return this.repository.getProviderKey(id) as Observable<Result<AdminResource, string>>;
      case 'api_keys':
        return this.repository.getApiKey(id) as Observable<Result<AdminResource, string>>;
      case 'guardrails':
        return this.repository.getGuardrail(id) as Observable<Result<AdminResource, string>>;
      case 'cache_policies':
        return this.repository.getCachePolicy(id) as Observable<Result<AdminResource, string>>;
      case 'mcp_servers':
        return this.repository.getMcpServer(id) as Observable<Result<AdminResource, string>>;
      case 'a2a_agents':
        return this.repository.getA2aAgent(id) as Observable<Result<AdminResource, string>>;
      case 'passthrough_routes':
        return this.repository.getPassthroughRoute(id) as Observable<Result<AdminResource, string>>;
      case 'observability_exporters':
        return this.repository.getObservabilityExporter(id) as Observable<Result<AdminResource, string>>;
      default:
        return of(ResultFactory.Failure(`Tipe resource tidak valid: ${String(resourceKey)}`));
    }
  }
}
