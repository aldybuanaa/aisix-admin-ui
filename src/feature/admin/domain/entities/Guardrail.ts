/** Domain model for a guardrail rule. */
export interface Guardrail { readonly id: string; readonly revision: number; readonly name: string; readonly kind: string; readonly raw: Record<string, unknown>; }
