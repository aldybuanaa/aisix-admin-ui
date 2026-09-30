export interface ModelDto {
  readonly display_name: string;
  readonly provider?: string | null;
  readonly model_name?: string | null;
  readonly provider_key_id?: string | null;
  readonly [key: string]: unknown;
}
