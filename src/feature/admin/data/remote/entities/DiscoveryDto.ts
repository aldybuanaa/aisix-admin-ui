export interface DiscoverModelsRequestDto {
  readonly provider_key_id?: string;
  readonly api_base?: string;
  readonly api_key?: string;
  readonly adapter: string;
}

export interface DiscoveredModelDto {
  readonly id: string;
  readonly object?: string | null;
  readonly owned_by?: string | null;
}

export interface DiscoverModelsResponseDto {
  readonly models: DiscoveredModelDto[];
}
