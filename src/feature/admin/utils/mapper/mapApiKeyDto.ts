import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { ApiKey } from '../../domain/entities/ApiKey';
import type { ApiKeyDto } from '../../data/remote/entities/ApiKeyDto';

/**
 * Maps a caller API-key projection to the domain entity.
 * Only a truncated hash prefix is kept — the full hash is never retained.
 */
export function mapApiKeyDtoToDomain(entry: ResourceEntry<ApiKeyDto>): ApiKey {
  const value = entry.value;
  const hash = value.key_hash ?? '';
  return {
    id: entry.id,
    revision: entry.revision,
    keyHashPrefix: hash.length > 12 ? `${hash.slice(0, 12)}...` : hash,
    allowedModels: Array.isArray(value.allowed_models) ? value.allowed_models : [],
    disabled: value.disabled === true,
    expiresAt: typeof value.expires_at === 'string' ? value.expires_at : null,
    raw: { ...(value as Record<string, unknown>) },
  };
}
