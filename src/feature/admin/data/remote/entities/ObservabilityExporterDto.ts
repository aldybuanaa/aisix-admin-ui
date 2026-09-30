export interface ObservabilityExporterDto {
  readonly name: string;
  readonly kind: string;
  readonly enabled?: boolean | null;
  readonly [key: string]: unknown;
}
