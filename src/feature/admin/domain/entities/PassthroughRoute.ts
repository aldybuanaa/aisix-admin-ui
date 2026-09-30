/** Domain model for a passthrough route. */
export interface PassthroughRoute { readonly id: string; readonly revision: number; readonly name: string; readonly targetUrl: string | null; readonly pathPrefix: string | null; readonly raw: Record<string, unknown>; }
