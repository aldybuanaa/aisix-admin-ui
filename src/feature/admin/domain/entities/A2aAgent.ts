/** Domain model for an A2A agent registration. */
export interface A2aAgent { readonly id: string; readonly revision: number; readonly name: string; readonly url: string; readonly protocolVersion: string; readonly authType: string; readonly raw: Record<string, unknown>; }
