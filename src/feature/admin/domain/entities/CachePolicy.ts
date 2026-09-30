/** Domain model for a cache policy. */
export interface CachePolicy { readonly id: string; readonly revision: number; readonly name: string; readonly backend: string; readonly enabled: boolean; readonly ttlSeconds: number; readonly raw: Record<string, unknown>; }
