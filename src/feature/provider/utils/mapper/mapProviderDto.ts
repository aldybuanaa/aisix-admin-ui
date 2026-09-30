import type { Provider } from '../../domain/entities/Provider';
import type { ProviderDto } from '../../data/remote/entities/ProviderDto';

export function mapProviderDtoToDomain(dto: ProviderDto): Provider {
  return {
    id: dto.id,
    name: dto.name,
    baseUrl: dto.base_url,
    enabled: dto.enabled,
  };
}
