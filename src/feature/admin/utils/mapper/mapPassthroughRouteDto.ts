import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { PassthroughRoute } from '../../domain/entities/PassthroughRoute';
import type { PassthroughRouteDto } from '../../data/remote/entities/PassthroughRouteDto';

/** Maps a passthrough-route entry DTO (snake_case) to the domain entity (camelCase). */
export function mapPassthroughRouteDtoToDomain(
  entry: ResourceEntry<PassthroughRouteDto>,
): PassthroughRoute {
  const value = entry.value;
  return {
    id: entry.id,
    revision: entry.revision,
    name: value.name,
    targetUrl: typeof value.target_url === 'string' ? value.target_url : null,
    pathPrefix: typeof value.path_prefix === 'string' ? value.path_prefix : null,
    raw: { ...(value as Record<string, unknown>) },
  };
}
