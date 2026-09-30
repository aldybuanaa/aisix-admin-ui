import type { InjectionKey } from 'vue';
import type { HttpClient } from '@/core/network/HttpClient';

export const CoreModuleKeys = {
  HttpClient: Symbol('HttpClient') as InjectionKey<HttpClient>,
};
