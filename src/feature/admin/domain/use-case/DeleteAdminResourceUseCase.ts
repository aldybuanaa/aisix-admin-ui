import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { AdminResourceKey } from '../entities/AdminResource';

export interface DeleteAdminResourceUseCase {
  execute(resourceKey: AdminResourceKey, id: string): Observable<Result<void, string>>;
}
