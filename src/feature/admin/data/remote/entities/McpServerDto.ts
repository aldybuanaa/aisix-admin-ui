export interface McpServerDto {
  readonly name?: string | null;
  readonly display_name?: string | null;
  readonly auth_type?: string | null;
  readonly [key: string]: unknown;
}
