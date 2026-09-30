/** Public projection — backend never returns plaintext secrets here. */
export interface ApiKeyDto {
  readonly key_hash: string;
  readonly allowed_models?: string[] | null;
  readonly allowed_model_ids?: string[] | null;
  readonly rate_limit?: unknown;
  readonly mcp_access?: unknown;
  readonly allowed_agents?: string[] | null;
  readonly expires_at?: string | null;
  readonly disabled?: boolean;
  readonly [key: string]: unknown;
}
