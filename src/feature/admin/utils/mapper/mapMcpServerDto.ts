import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { McpServer } from '../../domain/entities/McpServer';
import type { McpServerDto } from '../../data/remote/entities/McpServerDto';

/** Maps an MCP-server entry DTO (snake_case) to the domain entity (camelCase). */
export function mapMcpServerDtoToDomain(
  entry: ResourceEntry<McpServerDto>,
): McpServer {
  const value = entry.value;
  const name =
    (typeof value.name === 'string' && value.name.length > 0 ? value.name : null) ??
    (typeof value.display_name === 'string' ? value.display_name : '');
  return {
    id: entry.id,
    revision: entry.revision,
    name,
    authType: typeof value.auth_type === 'string' ? value.auth_type : 'none',
    raw: { ...(value as Record<string, unknown>) },
  };
}
