import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import type { Result } from '@/core/types';
import { Result as ResultFactory } from '@/core/types';
import { AdminModuleKeys } from '../../../di/AdminModuleKeys';
import type { AdminRepository } from '../../repository/AdminRepository';
import type { AdminResource, AdminResourceKey } from '../../entities/AdminResource';
import type { SaveAdminResourceUseCase } from '../SaveAdminResourceUseCase';

@injectable()
export class SaveAdminResourceUseCaseImpl implements SaveAdminResourceUseCase {
  constructor(
    @inject(AdminModuleKeys.AdminRepository)
    private readonly repository: AdminRepository,
  ) {}

  execute(
    resourceKey: AdminResourceKey,
    payload: Record<string, unknown>,
    id?: string,
  ): Observable<Result<AdminResource, string>> {
    const isUpdate = typeof id === 'string' && id.length > 0;

    switch (resourceKey) {
      case 'models':
        return (isUpdate
          ? this.repository.updateModel(id, payload)
          : this.repository.createModel(payload)) as Observable<Result<AdminResource, string>>;
      case 'provider_keys':
        return (isUpdate
          ? this.repository.updateProviderKey(id, payload)
          : this.repository.createProviderKey(payload)) as Observable<Result<AdminResource, string>>;
      case 'api_keys':
        return (isUpdate
          ? this.repository.updateApiKey(id, payload)
          : this.repository.createApiKey(payload)) as Observable<Result<AdminResource, string>>;
      case 'guardrails':
        return (isUpdate
          ? this.repository.updateGuardrail(id, payload)
          : this.repository.createGuardrail(payload)) as Observable<Result<AdminResource, string>>;
      case 'cache_policies':
        return (isUpdate
          ? this.repository.updateCachePolicy(id, payload)
          : this.repository.createCachePolicy(payload)) as Observable<Result<AdminResource, string>>;
      case 'mcp_servers':
        return (isUpdate
          ? this.repository.updateMcpServer(id, payload)
          : this.repository.createMcpServer(payload)) as Observable<Result<AdminResource, string>>;
      case 'a2a_agents':
        return (isUpdate
          ? this.repository.updateA2aAgent(id, payload)
          : this.repository.createA2aAgent(payload)) as Observable<Result<AdminResource, string>>;
      case 'passthrough_routes':
        return (isUpdate
          ? this.repository.updatePassthroughRoute(id, payload)
          : this.repository.createPassthroughRoute(payload)) as Observable<Result<AdminResource, string>>;
      case 'observability_exporters':
        return (isUpdate
          ? this.repository.updateObservabilityExporter(id, payload)
          : this.repository.createObservabilityExporter(payload)) as Observable<Result<AdminResource, string>>;
      default:
        return of(ResultFactory.Failure(`Tipe resource tidak valid: ${String(resourceKey)}`));
    }
  }
}
