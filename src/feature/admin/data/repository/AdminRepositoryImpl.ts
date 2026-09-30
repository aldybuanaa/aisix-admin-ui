import { inject, injectable } from 'inversify';
import type { Observable } from 'rxjs';
import { toResultObservable } from '@/core/network/resultObservable';
import type { Result } from '@/core/types';
import { AdminModuleKeys } from '../../di/AdminModuleKeys';
import type { AdminRemoteDataSource } from '../remote/data-sources/AdminRemoteDataSource';
import type { AdminRepository } from '../../domain/repository/AdminRepository';
import type { AdminModel } from '../../domain/entities/AdminModel';
import type { ProviderKey } from '../../domain/entities/ProviderKey';
import type { ApiKey } from '../../domain/entities/ApiKey';
import type { Guardrail } from '../../domain/entities/Guardrail';
import type { CachePolicy } from '../../domain/entities/CachePolicy';
import type { McpServer } from '../../domain/entities/McpServer';
import type { A2aAgent } from '../../domain/entities/A2aAgent';
import type { PassthroughRoute } from '../../domain/entities/PassthroughRoute';
import type { ObservabilityExporter } from '../../domain/entities/ObservabilityExporter';
import type { DiscoveredModel, DiscoverAdapter } from '../../domain/entities/DiscoveredModel';
import {
  mapModelDtoToDomain,
  mapProviderKeyDtoToDomain,
  mapApiKeyDtoToDomain,
  mapGuardrailDtoToDomain,
  mapCachePolicyDtoToDomain,
  mapMcpServerDtoToDomain,
  mapA2aAgentDtoToDomain,
  mapPassthroughRouteDtoToDomain,
  mapObservabilityExporterDtoToDomain,
  mapDiscoveredModelDtoToDomain,
} from '../../utils/mapper/AdminMapper';

@injectable()
export class AdminRepositoryImpl implements AdminRepository {
  constructor(
    @inject(AdminModuleKeys.AdminRemoteDataSource)
    private readonly ds: AdminRemoteDataSource
  ) {}

  // ─── Models ───────────────────────────────────────────────────────────────

  listModels(): Observable<Result<AdminModel[], string>> {
    return toResultObservable(
      this.ds.listModels(),
      (dtos) => dtos.map(mapModelDtoToDomain),
      'Gagal memuat daftar model',
    );
  }

  getModel(id: string): Observable<Result<AdminModel, string>> {
    return toResultObservable(
      this.ds.getModel(id),
      mapModelDtoToDomain,
      'Gagal memuat detail model',
    );
  }

  createModel(body: Record<string, unknown>): Observable<Result<AdminModel, string>> {
    return toResultObservable(
      this.ds.createModel(body),
      mapModelDtoToDomain,
      'Gagal membuat model',
    );
  }

  updateModel(id: string, body: Record<string, unknown>): Observable<Result<AdminModel, string>> {
    return toResultObservable(
      this.ds.updateModel(id, body),
      mapModelDtoToDomain,
      'Gagal memperbarui model',
    );
  }

  deleteModel(id: string): Observable<Result<void, string>> {
    return toResultObservable(
      this.ds.deleteModel(id),
      () => undefined,
      'Gagal menghapus model',
    );
  }

  // ─── Provider Keys ────────────────────────────────────────────────────────

  listProviderKeys(): Observable<Result<ProviderKey[], string>> {
    return toResultObservable(this.ds.listProviderKeys(), (d) => d.map(mapProviderKeyDtoToDomain), 'Gagal memuat provider keys');
  }
  getProviderKey(id: string): Observable<Result<ProviderKey, string>> {
    return toResultObservable(this.ds.getProviderKey(id), mapProviderKeyDtoToDomain, 'Gagal memuat provider key');
  }
  createProviderKey(body: Record<string, unknown>): Observable<Result<ProviderKey, string>> {
    return toResultObservable(this.ds.createProviderKey(body), mapProviderKeyDtoToDomain, 'Gagal membuat provider key');
  }
  updateProviderKey(id: string, body: Record<string, unknown>): Observable<Result<ProviderKey, string>> {
    return toResultObservable(this.ds.updateProviderKey(id, body), mapProviderKeyDtoToDomain, 'Gagal memperbarui provider key');
  }
  deleteProviderKey(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteProviderKey(id), () => undefined, 'Gagal menghapus provider key');
  }

  // ─── API Keys ─────────────────────────────────────────────────────────────

  listApiKeys(): Observable<Result<ApiKey[], string>> {
    return toResultObservable(this.ds.listApiKeys(), (d) => d.map(mapApiKeyDtoToDomain), 'Gagal memuat API keys');
  }
  getApiKey(id: string): Observable<Result<ApiKey, string>> {
    return toResultObservable(this.ds.getApiKey(id), mapApiKeyDtoToDomain, 'Gagal memuat API key');
  }
  createApiKey(body: Record<string, unknown>): Observable<Result<ApiKey, string>> {
    return toResultObservable(this.ds.createApiKey(body), mapApiKeyDtoToDomain, 'Gagal membuat API key');
  }
  updateApiKey(id: string, body: Record<string, unknown>): Observable<Result<ApiKey, string>> {
    return toResultObservable(this.ds.updateApiKey(id, body), mapApiKeyDtoToDomain, 'Gagal memperbarui API key');
  }
  deleteApiKey(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteApiKey(id), () => undefined, 'Gagal menghapus API key');
  }

  // ─── Guardrails ──────────────────────────────────────────────────────────

  listGuardrails(): Observable<Result<Guardrail[], string>> {
    return toResultObservable(this.ds.listGuardrails(), (d) => d.map(mapGuardrailDtoToDomain), 'Gagal memuat guardrails');
  }
  getGuardrail(id: string): Observable<Result<Guardrail, string>> {
    return toResultObservable(this.ds.getGuardrail(id), mapGuardrailDtoToDomain, 'Gagal memuat guardrail');
  }
  createGuardrail(body: Record<string, unknown>): Observable<Result<Guardrail, string>> {
    return toResultObservable(this.ds.createGuardrail(body), mapGuardrailDtoToDomain, 'Gagal membuat guardrail');
  }
  updateGuardrail(id: string, body: Record<string, unknown>): Observable<Result<Guardrail, string>> {
    return toResultObservable(this.ds.updateGuardrail(id, body), mapGuardrailDtoToDomain, 'Gagal memperbarui guardrail');
  }
  deleteGuardrail(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteGuardrail(id), () => undefined, 'Gagal menghapus guardrail');
  }

  // ─── Cache Policies ───────────────────────────────────────────────────────

  listCachePolicies(): Observable<Result<CachePolicy[], string>> {
    return toResultObservable(this.ds.listCachePolicies(), (d) => d.map(mapCachePolicyDtoToDomain), 'Gagal memuat cache policies');
  }
  getCachePolicy(id: string): Observable<Result<CachePolicy, string>> {
    return toResultObservable(this.ds.getCachePolicy(id), mapCachePolicyDtoToDomain, 'Gagal memuat cache policy');
  }
  createCachePolicy(body: Record<string, unknown>): Observable<Result<CachePolicy, string>> {
    return toResultObservable(this.ds.createCachePolicy(body), mapCachePolicyDtoToDomain, 'Gagal membuat cache policy');
  }
  updateCachePolicy(id: string, body: Record<string, unknown>): Observable<Result<CachePolicy, string>> {
    return toResultObservable(this.ds.updateCachePolicy(id, body), mapCachePolicyDtoToDomain, 'Gagal memperbarui cache policy');
  }
  deleteCachePolicy(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteCachePolicy(id), () => undefined, 'Gagal menghapus cache policy');
  }

  // ─── MCP Servers ──────────────────────────────────────────────────────────

  listMcpServers(): Observable<Result<McpServer[], string>> {
    return toResultObservable(this.ds.listMcpServers(), (d) => d.map(mapMcpServerDtoToDomain), 'Gagal memuat MCP servers');
  }
  getMcpServer(id: string): Observable<Result<McpServer, string>> {
    return toResultObservable(this.ds.getMcpServer(id), mapMcpServerDtoToDomain, 'Gagal memuat MCP server');
  }
  createMcpServer(body: Record<string, unknown>): Observable<Result<McpServer, string>> {
    return toResultObservable(this.ds.createMcpServer(body), mapMcpServerDtoToDomain, 'Gagal membuat MCP server');
  }
  updateMcpServer(id: string, body: Record<string, unknown>): Observable<Result<McpServer, string>> {
    return toResultObservable(this.ds.updateMcpServer(id, body), mapMcpServerDtoToDomain, 'Gagal memperbarui MCP server');
  }
  deleteMcpServer(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteMcpServer(id), () => undefined, 'Gagal menghapus MCP server');
  }

  // ─── A2A Agents ───────────────────────────────────────────────────────────

  listA2aAgents(): Observable<Result<A2aAgent[], string>> {
    return toResultObservable(this.ds.listA2aAgents(), (d) => d.map(mapA2aAgentDtoToDomain), 'Gagal memuat A2A agents');
  }
  getA2aAgent(id: string): Observable<Result<A2aAgent, string>> {
    return toResultObservable(this.ds.getA2aAgent(id), mapA2aAgentDtoToDomain, 'Gagal memuat A2A agent');
  }
  createA2aAgent(body: Record<string, unknown>): Observable<Result<A2aAgent, string>> {
    return toResultObservable(this.ds.createA2aAgent(body), mapA2aAgentDtoToDomain, 'Gagal membuat A2A agent');
  }
  updateA2aAgent(id: string, body: Record<string, unknown>): Observable<Result<A2aAgent, string>> {
    return toResultObservable(this.ds.updateA2aAgent(id, body), mapA2aAgentDtoToDomain, 'Gagal memperbarui A2A agent');
  }
  deleteA2aAgent(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteA2aAgent(id), () => undefined, 'Gagal menghapus A2A agent');
  }

  // ─── Passthrough Routes ───────────────────────────────────────────────────

  listPassthroughRoutes(): Observable<Result<PassthroughRoute[], string>> {
    return toResultObservable(this.ds.listPassthroughRoutes(), (d) => d.map(mapPassthroughRouteDtoToDomain), 'Gagal memuat passthrough routes');
  }
  getPassthroughRoute(id: string): Observable<Result<PassthroughRoute, string>> {
    return toResultObservable(this.ds.getPassthroughRoute(id), mapPassthroughRouteDtoToDomain, 'Gagal memuat passthrough route');
  }
  createPassthroughRoute(body: Record<string, unknown>): Observable<Result<PassthroughRoute, string>> {
    return toResultObservable(this.ds.createPassthroughRoute(body), mapPassthroughRouteDtoToDomain, 'Gagal membuat passthrough route');
  }
  updatePassthroughRoute(id: string, body: Record<string, unknown>): Observable<Result<PassthroughRoute, string>> {
    return toResultObservable(this.ds.updatePassthroughRoute(id, body), mapPassthroughRouteDtoToDomain, 'Gagal memperbarui passthrough route');
  }
  deletePassthroughRoute(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deletePassthroughRoute(id), () => undefined, 'Gagal menghapus passthrough route');
  }

  // ─── Observability Exporters ──────────────────────────────────────────────

  listObservabilityExporters(): Observable<Result<ObservabilityExporter[], string>> {
    return toResultObservable(this.ds.listObservabilityExporters(), (d) => d.map(mapObservabilityExporterDtoToDomain), 'Failed to load observability exporters');
  }
  getObservabilityExporter(id: string): Observable<Result<ObservabilityExporter, string>> {
    return toResultObservable(this.ds.getObservabilityExporter(id), mapObservabilityExporterDtoToDomain, 'Failed to load observability exporter');
  }
  createObservabilityExporter(body: Record<string, unknown>): Observable<Result<ObservabilityExporter, string>> {
    return toResultObservable(this.ds.createObservabilityExporter(body), mapObservabilityExporterDtoToDomain, 'Failed to create observability exporter');
  }
  updateObservabilityExporter(id: string, body: Record<string, unknown>): Observable<Result<ObservabilityExporter, string>> {
    return toResultObservable(this.ds.updateObservabilityExporter(id, body), mapObservabilityExporterDtoToDomain, 'Failed to update observability exporter');
  }
  deleteObservabilityExporter(id: string): Observable<Result<void, string>> {
    return toResultObservable(this.ds.deleteObservabilityExporter(id), () => undefined, 'Failed to delete observability exporter');
  }

  // ─── Model Discovery ──────────────────────────────────────────────────────

  discoverModels(
    adapter: DiscoverAdapter,
    apiBase?: string,
    apiKey?: string,
    providerKeyId?: string,
  ): Observable<Result<DiscoveredModel[], string>> {
    const body: Record<string, unknown> = { adapter };
    if (apiBase) body.api_base = apiBase;
    if (apiKey) body.api_key = apiKey;
    if (providerKeyId) body.provider_key_id = providerKeyId;
    return toResultObservable(
      this.ds.discoverModels({ adapter, api_base: apiBase, api_key: apiKey, provider_key_id: providerKeyId }),
      (dto) => dto.models.map(mapDiscoveredModelDtoToDomain),
      'Gagal melakukan discovery model',
    );
  }
}
