/** Domain model for a caller API key. */
export interface ApiKey {
  readonly id: string;
  readonly revision: number;
  readonly keyHashPrefix: string;
  readonly allowedModels: readonly string[];
  readonly disabled: boolean;
  readonly expiresAt: string | null;
  readonly raw: Record<string, unknown>;
}
