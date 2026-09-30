/** Domain model for an observability exporter. */
export interface ObservabilityExporter { readonly id: string; readonly revision: number; readonly name: string; readonly kind: string; readonly enabled: boolean; readonly raw: Record<string, unknown>; }
