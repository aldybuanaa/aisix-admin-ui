import { inject, injectable } from 'inversify';
import { safeRequest } from '@/core/network/HttpClient';
import type { HttpClient } from '@/core/network/HttpClient';
import type { ApiResult, ErrorResponse } from '@/core/types';
import { CoreModuleKeys } from '@/core/di/keys';
import type { AdminRemoteDataSource } from '../AdminRemoteDataSource';
import type { ResourceEntryDto } from '../../entities/AdminResourceDto';
import type { ModelDto } from '../../entities/ModelDto';
import type { ProviderKeyDto } from '../../entities/ProviderKeyDto';
import type { ApiKeyDto } from '../../entities/ApiKeyDto';
import type { GuardrailDto } from '../../entities/GuardrailDto';
import type { CachePolicyDto } from '../../entities/CachePolicyDto';
import type { McpServerDto } from '../../entities/McpServerDto';
import type { A2aAgentDto } from '../../entities/A2aAgentDto';
import type { PassthroughRouteDto } from '../../entities/PassthroughRouteDto';
import type { ObservabilityExporterDto } from '../../entities/ObservabilityExporterDto';
import type {
  DiscoverModelsRequestDto,
  DiscoverModelsResponseDto,
} from '../../entities/DiscoveryDto';

type DeleteResponse = { deleted: boolean; id: string };

@injectable()
export class AdminRemoteDataSourceImpl implements AdminRemoteDataSource {
  constructor(
    @inject(CoreModuleKeys.HttpClient)
    private readonly httpClient: HttpClient
  ) {}

  listModels(): Promise<ApiResult<ResourceEntryDto<ModelDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ModelDto>[]>('/admin/v1/models'));
  }
  getModel(id: string): Promise<ApiResult<ResourceEntryDto<ModelDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ModelDto>>(`/admin/v1/models/${encodeURIComponent(id)}`));
  }
  createModel(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ModelDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<ModelDto>>('/admin/v1/models', { body }));
  }
  updateModel(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ModelDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<ModelDto>>(`/admin/v1/models/${encodeURIComponent(id)}`, { body }));
  }
  deleteModel(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/models/${encodeURIComponent(id)}`));
  }

  listProviderKeys(): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ProviderKeyDto>[]>('/admin/v1/provider_keys'));
  }
  getProviderKey(id: string): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ProviderKeyDto>>(`/admin/v1/provider_keys/${encodeURIComponent(id)}`));
  }
  createProviderKey(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<ProviderKeyDto>>('/admin/v1/provider_keys', { body }));
  }
  updateProviderKey(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<ProviderKeyDto>>(`/admin/v1/provider_keys/${encodeURIComponent(id)}`, { body }));
  }
  deleteProviderKey(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/provider_keys/${encodeURIComponent(id)}`));
  }

  listApiKeys(): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ApiKeyDto>[]>('/admin/v1/api_keys'));
  }
  getApiKey(id: string): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ApiKeyDto>>(`/admin/v1/api_keys/${encodeURIComponent(id)}`));
  }
  createApiKey(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<ApiKeyDto>>('/admin/v1/api_keys', { body }));
  }
  updateApiKey(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<ApiKeyDto>>(`/admin/v1/api_keys/${encodeURIComponent(id)}`, { body }));
  }
  deleteApiKey(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/api_keys/${encodeURIComponent(id)}`));
  }

  listGuardrails(): Promise<ApiResult<ResourceEntryDto<GuardrailDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<GuardrailDto>[]>('/admin/v1/guardrails'));
  }
  getGuardrail(id: string): Promise<ApiResult<ResourceEntryDto<GuardrailDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<GuardrailDto>>(`/admin/v1/guardrails/${encodeURIComponent(id)}`));
  }
  createGuardrail(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<GuardrailDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<GuardrailDto>>('/admin/v1/guardrails', { body }));
  }
  updateGuardrail(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<GuardrailDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<GuardrailDto>>(`/admin/v1/guardrails/${encodeURIComponent(id)}`, { body }));
  }
  deleteGuardrail(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/guardrails/${encodeURIComponent(id)}`));
  }

  listCachePolicies(): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<CachePolicyDto>[]>('/admin/v1/cache_policies'));
  }
  getCachePolicy(id: string): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<CachePolicyDto>>(`/admin/v1/cache_policies/${encodeURIComponent(id)}`));
  }
  createCachePolicy(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<CachePolicyDto>>('/admin/v1/cache_policies', { body }));
  }
  updateCachePolicy(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<CachePolicyDto>>(`/admin/v1/cache_policies/${encodeURIComponent(id)}`, { body }));
  }
  deleteCachePolicy(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/cache_policies/${encodeURIComponent(id)}`));
  }

  listMcpServers(): Promise<ApiResult<ResourceEntryDto<McpServerDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<McpServerDto>[]>('/admin/v1/mcp_servers'));
  }
  getMcpServer(id: string): Promise<ApiResult<ResourceEntryDto<McpServerDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<McpServerDto>>(`/admin/v1/mcp_servers/${encodeURIComponent(id)}`));
  }
  createMcpServer(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<McpServerDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<McpServerDto>>('/admin/v1/mcp_servers', { body }));
  }
  updateMcpServer(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<McpServerDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<McpServerDto>>(`/admin/v1/mcp_servers/${encodeURIComponent(id)}`, { body }));
  }
  deleteMcpServer(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/mcp_servers/${encodeURIComponent(id)}`));
  }

  listA2aAgents(): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<A2aAgentDto>[]>('/admin/v1/a2a_agents'));
  }
  getA2aAgent(id: string): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<A2aAgentDto>>(`/admin/v1/a2a_agents/${encodeURIComponent(id)}`));
  }
  createA2aAgent(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<A2aAgentDto>>('/admin/v1/a2a_agents', { body }));
  }
  updateA2aAgent(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<A2aAgentDto>>(`/admin/v1/a2a_agents/${encodeURIComponent(id)}`, { body }));
  }
  deleteA2aAgent(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/a2a_agents/${encodeURIComponent(id)}`));
  }

  listPassthroughRoutes(): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<PassthroughRouteDto>[]>('/admin/v1/passthrough_routes'));
  }
  getPassthroughRoute(id: string): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<PassthroughRouteDto>>(`/admin/v1/passthrough_routes/${encodeURIComponent(id)}`));
  }
  createPassthroughRoute(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<ResourceEntryDto<PassthroughRouteDto>>('/admin/v1/passthrough_routes', { body }));
  }
  updatePassthroughRoute(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.put<ResourceEntryDto<PassthroughRouteDto>>(`/admin/v1/passthrough_routes/${encodeURIComponent(id)}`, { body }));
  }
  deletePassthroughRoute(id: string): Promise<ApiResult<DeleteResponse, ErrorResponse>> {
    return safeRequest(() => this.httpClient.delete<DeleteResponse>(`/admin/v1/passthrough_routes/${encodeURIComponent(id)}`));
  }

  listObservabilityExporters(): Promise<ApiResult<ResourceEntryDto<ObservabilityExporterDto>[], ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ObservabilityExporterDto>[]>('/admin/v1/observability_exporters'));
  }
  getObservabilityExporter(id: string): Promise<ApiResult<ResourceEntryDto<ObservabilityExporterDto>, ErrorResponse>> {
    return safeRequest(() => this.httpClient.get<ResourceEntryDto<ObservabilityExporterDto>>(`/admin/v1/observability_exporters/${encodeURIComponent(id)}`));
  }

  discoverModels(body: DiscoverModelsRequestDto): Promise<ApiResult<DiscoverModelsResponseDto, ErrorResponse>> {
    return safeRequest(() => this.httpClient.post<DiscoverModelsResponseDto>('/admin/v1/models/discover', { body }));
  }
}
