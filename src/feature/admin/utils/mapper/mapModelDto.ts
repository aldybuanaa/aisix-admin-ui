import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { AdminModel } from '../../domain/entities/AdminModel';
import type { ModelDto } from '../../data/remote/entities/ModelDto';

/** Maps an admin model entry DTO (snake_case) to the domain entity (camelCase). */
export function mapModelDtoToDomain(entry: ResourceEntry<ModelDto>): AdminModel {
  const value = entry.value;
  return {
    id: entry.id,
    revision: entry.revision,
    displayName: value.display_name,
    provider: typeof value.provider === 'string' ? value.provider : '',
    modelName: typeof value.model_name === 'string' ? value.model_name : '',
    providerKeyId:
      typeof value.provider_key_id === 'string' ? value.provider_key_id : null,
    raw: { ...(value as Record<string, unknown>) },
  };
}
