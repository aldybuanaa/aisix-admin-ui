import 'reflect-metadata';
import { Container } from 'inversify';
import { CoreModuleKeys } from './keys';
import type { HttpClient } from '@/core/network/HttpClient';
import { FetchHttpClient } from '@/core/network/HttpClient';
import { registerAdminModules } from '@/feature/admin/di/AdminModules';

export const coreContainer = new Container();

// Base HTTP Client bound to window.location.origin or relative root
const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8080';
const httpClient = new FetchHttpClient(baseUrl);

coreContainer
  .bind<HttpClient>(CoreModuleKeys.HttpClient)
  .toConstantValue(httpClient);

// Register feature modules
registerAdminModules(coreContainer);
