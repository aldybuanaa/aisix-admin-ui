export interface A2aAgentDto {
  readonly name?: string | null;
  readonly display_name?: string | null;
  readonly url: string;
  readonly protocol_version?: string | null;
  readonly auth_type?: string | null;
  readonly [key: string]: unknown;
}
