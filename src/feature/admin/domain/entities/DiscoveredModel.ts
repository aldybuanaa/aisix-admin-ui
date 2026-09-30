/** A model discovered from an upstream provider. */
export interface DiscoveredModel { readonly id: string; readonly object: string | null; readonly ownedBy: string | null; }
export type DiscoverAdapter = 'openai' | 'anthropic' | 'ollama';
