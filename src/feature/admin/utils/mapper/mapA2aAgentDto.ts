import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { A2aAgent } from '../../domain/entities/A2aAgent';
import type { A2aAgentDto } from '../../data/remote/entities/A2aAgentDto';

/** Maps an A2A-agent entry DTO (snake_case) to the domain entity (camelCase). */
export function mapA2aAgentDtoToDomain(
  entry: ResourceEntry<A2aAgentDto>,
): A2aAgent {
  const value = entry.value;
  const name =
    (typeof value.name === 'string' && value.name.length > 0 ? value.name : null) ??
    (typeof value.display_name === 'string' ? value.display_name : '');
  return {
    id: entry.id,
    revision: entry.revision,
    name,
    url: value.url,
    protocolVersion:
      typeof value.protocol_version === 'string' ? value.protocol_version : '1.0',
    authType: typeof value.auth_type === 'string' ? value.auth_type : 'none',
    raw: { ...(value as Record<string, unknown>) },
  };
}
