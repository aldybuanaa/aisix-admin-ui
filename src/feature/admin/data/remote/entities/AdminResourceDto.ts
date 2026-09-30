import type { ResourceEntry } from '@/core/types/ResourceEntry';

/** Generic resource entry envelope returned by all admin list/detail endpoints. */
export interface ResourceEntryDto<T> {
  readonly id: string;
  readonly value: T;
  readonly revision: number;
}

export type { ResourceEntry };
