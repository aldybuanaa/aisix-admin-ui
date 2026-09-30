import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { ProviderKey } from '../../domain/entities/ProviderKey';
import type { ProviderKeyDto } from '../../data/remote/entities/ProviderKeyDto';

/** Maps a provider-key entry DTO (snake_case) to the domain entity (camelCase). */
export function mapProviderKeyDtoToDomain(
  entry: ResourceEntry<ProviderKeyDto>,
): ProviderKey {
  const value = entry.value;
  return {
    id: entry.id,
    revision: entry.revision,
    displayName: value.display_name,
    provider: typeof value.provider === 'string' ? value.provider : '',
    adapter: typeof value.adapter === 'string' ? value.adapter : null,
    apiBase: typeof value.api_base === 'string' ? value.api_base : null,
    raw: { ...(value as Record<string, unknown>) },
  };
}
