import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { AdminResource, AdminResourceKey } from '../entities/AdminResource';

export interface GetAdminResourceUseCase {
  execute(resourceKey: AdminResourceKey, id: string): Observable<Result<AdminResource, string>>;
}
