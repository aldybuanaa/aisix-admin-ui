export interface ProviderKeyDto {
  readonly display_name: string;
  readonly provider?: string | null;
  readonly adapter?: string | null;
  readonly api_base?: string | null;
  readonly [key: string]: unknown;
}
