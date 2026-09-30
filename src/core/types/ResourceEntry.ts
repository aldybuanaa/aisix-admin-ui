/** Wraps any resource value returned by the admin API. */
export interface ResourceEntry<T> { readonly id: string; readonly value: T; readonly revision: number; }
