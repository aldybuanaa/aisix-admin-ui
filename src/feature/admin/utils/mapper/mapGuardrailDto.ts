import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { Guardrail } from '../../domain/entities/Guardrail';
import type { GuardrailDto } from '../../data/remote/entities/GuardrailDto';

/** Maps a guardrail entry DTO (snake_case) to the domain entity (camelCase). */
export function mapGuardrailDtoToDomain(
  entry: ResourceEntry<GuardrailDto>,
): Guardrail {
  const value = entry.value;
  return {
    id: entry.id,
    revision: entry.revision,
    name: value.name,
    kind: typeof value.kind === 'string' ? value.kind : '',
    raw: { ...(value as Record<string, unknown>) },
  };
}
