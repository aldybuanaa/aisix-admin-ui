export interface CachePolicyDto {
  readonly name: string;
  readonly backend?: string | null;
  readonly enabled?: boolean | null;
  readonly ttl_seconds?: number | null;
  readonly [key: string]: unknown;
}
