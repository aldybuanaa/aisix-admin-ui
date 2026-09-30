import type { ResourceEntry } from '@/core/types/ResourceEntry';
import type { ObservabilityExporter } from '../../domain/entities/ObservabilityExporter';
import type { ObservabilityExporterDto } from '../../data/remote/entities/ObservabilityExporterDto';

/** Maps an observability-exporter entry DTO to the domain entity (camelCase). */
export function mapObservabilityExporterDtoToDomain(
  entry: ResourceEntry<ObservabilityExporterDto>,
): ObservabilityExporter {
  const value = entry.value;
  return {
    id: entry.id,
    revision: entry.revision,
    name: value.name,
    kind: value.kind,
    enabled: value.enabled !== false,
    raw: { ...(value as Record<string, unknown>) },
  };
}
