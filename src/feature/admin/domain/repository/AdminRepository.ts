import type { Observable } from 'rxjs';
import type { Result } from '@/core/types';
import type { AdminModel } from '../entities/AdminModel';
import type { ProviderKey } from '../entities/ProviderKey';
import type { ApiKey } from '../entities/ApiKey';
import type { Guardrail } from '../entities/Guardrail';
import type { CachePolicy } from '../entities/CachePolicy';
import type { McpServer } from '../entities/McpServer';
import type { A2aAgent } from '../entities/A2aAgent';
import type { PassthroughRoute } from '../entities/PassthroughRoute';
import type { ObservabilityExporter } from '../entities/ObservabilityExporter';
import type { DiscoveredModel, DiscoverAdapter } from '../entities/DiscoveredModel';

export interface AdminRepository {
  // Models
  listModels(): Observable<Result<AdminModel[], string>>;
  getModel(id: string): Observable<Result<AdminModel, string>>;
  createModel(body: Record<string, unknown>): Observable<Result<AdminModel, string>>;
  updateModel(id: string, body: Record<string, unknown>): Observable<Result<AdminModel, string>>;
  deleteModel(id: string): Observable<Result<void, string>>;
  // Provider keys
  listProviderKeys(): Observable<Result<ProviderKey[], string>>;
  getProviderKey(id: string): Observable<Result<ProviderKey, string>>;
  createProviderKey(body: Record<string, unknown>): Observable<Result<ProviderKey, string>>;
  updateProviderKey(id: string, body: Record<string, unknown>): Observable<Result<ProviderKey, string>>;
  deleteProviderKey(id: string): Observable<Result<void, string>>;
  // API keys
  listApiKeys(): Observable<Result<ApiKey[], string>>;
  getApiKey(id: string): Observable<Result<ApiKey, string>>;
  createApiKey(body: Record<string, unknown>): Observable<Result<ApiKey, string>>;
  updateApiKey(id: string, body: Record<string, unknown>): Observable<Result<ApiKey, string>>;
  deleteApiKey(id: string): Observable<Result<void, string>>;
  // Guardrails
  listGuardrails(): Observable<Result<Guardrail[], string>>;
  getGuardrail(id: string): Observable<Result<Guardrail, string>>;
  createGuardrail(body: Record<string, unknown>): Observable<Result<Guardrail, string>>;
  updateGuardrail(id: string, body: Record<string, unknown>): Observable<Result<Guardrail, string>>;
  deleteGuardrail(id: string): Observable<Result<void, string>>;
  // Cache policies
  listCachePolicies(): Observable<Result<CachePolicy[], string>>;
  getCachePolicy(id: string): Observable<Result<CachePolicy, string>>;
  createCachePolicy(body: Record<string, unknown>): Observable<Result<CachePolicy, string>>;
  updateCachePolicy(id: string, body: Record<string, unknown>): Observable<Result<CachePolicy, string>>;
  deleteCachePolicy(id: string): Observable<Result<void, string>>;
  // MCP servers
  listMcpServers(): Observable<Result<McpServer[], string>>;
  getMcpServer(id: string): Observable<Result<McpServer, string>>;
  createMcpServer(body: Record<string, unknown>): Observable<Result<McpServer, string>>;
  updateMcpServer(id: string, body: Record<string, unknown>): Observable<Result<McpServer, string>>;
  deleteMcpServer(id: string): Observable<Result<void, string>>;
  // A2A agents
  listA2aAgents(): Observable<Result<A2aAgent[], string>>;
  getA2aAgent(id: string): Observable<Result<A2aAgent, string>>;
  createA2aAgent(body: Record<string, unknown>): Observable<Result<A2aAgent, string>>;
  updateA2aAgent(id: string, body: Record<string, unknown>): Observable<Result<A2aAgent, string>>;
  deleteA2aAgent(id: string): Observable<Result<void, string>>;
  // Passthrough routes
  listPassthroughRoutes(): Observable<Result<PassthroughRoute[], string>>;
  getPassthroughRoute(id: string): Observable<Result<PassthroughRoute, string>>;
  createPassthroughRoute(body: Record<string, unknown>): Observable<Result<PassthroughRoute, string>>;
  updatePassthroughRoute(id: string, body: Record<string, unknown>): Observable<Result<PassthroughRoute, string>>;
  deletePassthroughRoute(id: string): Observable<Result<void, string>>;
  // Observability exporters (Writable - backend supports PUT/POST/DELETE)
  listObservabilityExporters(): Observable<Result<ObservabilityExporter[], string>>;
  getObservabilityExporter(id: string): Observable<Result<ObservabilityExporter, string>>;
  createObservabilityExporter(body: Record<string, unknown>): Observable<Result<ObservabilityExporter, string>>;
  updateObservabilityExporter(id: string, body: Record<string, unknown>): Observable<Result<ObservabilityExporter, string>>;
  deleteObservabilityExporter(id: string): Observable<Result<void, string>>;
  // Model discovery
  discoverModels(
    adapter: DiscoverAdapter,
    apiBase?: string,
    apiKey?: string,
    providerKeyId?: string,
  ): Observable<Result<DiscoveredModel[], string>>;
}
