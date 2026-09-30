/** Domain model for a configured AI model entry. */
export interface AdminModel { readonly id: string; readonly revision: number; readonly displayName: string; readonly provider: string; readonly modelName: string; readonly providerKeyId: string | null; readonly raw: Record<string, unknown>; }
