import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { CachePolicy } from '../../domain/entities/CachePolicy';
import type { CachePolicyDto } from '../../data/remote/entities/CachePolicyDto';

/** Maps a cache-policy entry DTO (snake_case) to the domain entity (camelCase). */
export function mapCachePolicyDtoToDomain(
  entry: ResourceEntry<CachePolicyDto>,
): CachePolicy {
  const value = entry.value;
  return {
    id: entry.id,
    revision: entry.revision,
    name: value.name,
    backend: typeof value.backend === 'string' ? value.backend : 'memory',
    enabled: value.enabled !== false,
    ttlSeconds: typeof value.ttl_seconds === 'number' ? value.ttl_seconds : 3600,
    raw: { ...(value as Record<string, unknown>) },
  };
}
