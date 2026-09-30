/** Domain model for a provider key (credential). */
export interface ProviderKey { readonly id: string; readonly revision: number; readonly displayName: string; readonly provider: string; readonly adapter: string | null; readonly apiBase: string | null; readonly raw: Record<string, unknown>; }
