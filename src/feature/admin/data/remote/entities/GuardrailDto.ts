export interface GuardrailDto {
  readonly name: string;
  readonly kind?: string | null;
  readonly [key: string]: unknown;
}
