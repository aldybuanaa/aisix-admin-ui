import type { DiscoveredModel } from '../../domain/entities/DiscoveredModel';
import type { DiscoveredModelDto } from '../../data/remote/entities/DiscoveryDto';

/** Maps a discovered-model DTO (snake_case) to the domain entity (camelCase). */
export function mapDiscoveredModelDtoToDomain(
  dto: DiscoveredModelDto,
): DiscoveredModel {
  return {
    id: dto.id,
    object: typeof dto.object === 'string' ? dto.object : null,
    ownedBy: typeof dto.owned_by === 'string' ? dto.owned_by : null,
  };
}
