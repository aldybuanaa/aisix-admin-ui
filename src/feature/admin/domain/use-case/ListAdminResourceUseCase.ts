import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { AdminResource, AdminResourceKey } from '../entities/AdminResource';

export interface ListAdminResourceUseCase {
  execute(resourceKey: AdminResourceKey): Observable<Result<AdminResource[], string>>;
}
