import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { AdminResource, AdminResourceKey } from '../entities/AdminResource';

export interface SaveAdminResourceUseCase {
  execute(
    resourceKey: AdminResourceKey,
    payload: Record<string, unknown>,
    id?: string,
  ): Observable<Result<AdminResource, string>>;
}
