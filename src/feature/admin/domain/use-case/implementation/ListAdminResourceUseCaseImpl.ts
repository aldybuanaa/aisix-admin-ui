import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { Result } from '@/core/types';
import { Result as ResultFactory } from '@/core/types';
import { AdminModuleKeys } from '../../../di/AdminModuleKeys';
import type { AdminRepository } from '../../repository/AdminRepository';
import type { AdminResource, AdminResourceKey } from '../../entities/AdminResource';
import type { ListAdminResourceUseCase } from '../ListAdminResourceUseCase';

@injectable()
export class ListAdminResourceUseCaseImpl implements ListAdminResourceUseCase {
  constructor(
    @inject(AdminModuleKeys.AdminRepository)
    private readonly repository: AdminRepository,
  ) {}

  execute(resourceKey: AdminResourceKey): Observable<Result<AdminResource[], string>> {
    switch (resourceKey) {
      case 'models':
        return this.repository.listModels() as Observable<Result<AdminResource[], string>>;
      case 'provider_keys':
        return this.repository.listProviderKeys() as Observable<Result<AdminResource[], string>>;
      case 'api_keys':
        return this.repository.listApiKeys() as Observable<Result<AdminResource[], string>>;
      case 'guardrails':
        return this.repository.listGuardrails() as Observable<Result<AdminResource[], string>>;
      case 'cache_policies':
        return this.repository.listCachePolicies() as Observable<Result<AdminResource[], string>>;
      case 'mcp_servers':
        return this.repository.listMcpServers() as Observable<Result<AdminResource[], string>>;
      case 'a2a_agents':
        return this.repository.listA2aAgents() as Observable<Result<AdminResource[], string>>;
      case 'passthrough_routes':
        return this.repository.listPassthroughRoutes() as Observable<Result<AdminResource[], string>>;
      case 'observability_exporters':
        return this.repository.listObservabilityExporters() as Observable<Result<AdminResource[], string>>;
      default:
        return of(ResultFactory.Failure(`Tipe resource tidak valid: ${String(resourceKey)}`));
    }
  }
}
