import type { ApiResult, ErrorResponse } from '@/core/types';
import type { ResourceEntryDto } from '../entities/AdminResourceDto';
import type { ModelDto } from '../entities/ModelDto';
import type { ProviderKeyDto } from '../entities/ProviderKeyDto';
import type { ApiKeyDto } from '../entities/ApiKeyDto';
import type { GuardrailDto } from '../entities/GuardrailDto';
import type { CachePolicyDto } from '../entities/CachePolicyDto';
import type { McpServerDto } from '../entities/McpServerDto';
import type { A2aAgentDto } from '../entities/A2aAgentDto';
import type { PassthroughRouteDto } from '../entities/PassthroughRouteDto';
import type { ObservabilityExporterDto } from '../entities/ObservabilityExporterDto';
import type {
  DiscoverModelsRequestDto,
  DiscoverModelsResponseDto,
} from '../entities/DiscoveryDto';

export interface AdminRemoteDataSource {
  // Models
  listModels(): Promise<ApiResult<ResourceEntryDto<ModelDto>[], ErrorResponse>>;
  getModel(id: string): Promise<ApiResult<ResourceEntryDto<ModelDto>, ErrorResponse>>;
  createModel(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ModelDto>, ErrorResponse>>;
  updateModel(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ModelDto>, ErrorResponse>>;
  deleteModel(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // Provider keys
  listProviderKeys(): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>[], ErrorResponse>>;
  getProviderKey(id: string): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>, ErrorResponse>>;
  createProviderKey(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>, ErrorResponse>>;
  updateProviderKey(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ProviderKeyDto>, ErrorResponse>>;
  deleteProviderKey(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // API keys (canonical api_keys; alias apikeys served by same backend handlers)
  listApiKeys(): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>[], ErrorResponse>>;
  getApiKey(id: string): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>, ErrorResponse>>;
  createApiKey(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>, ErrorResponse>>;
  updateApiKey(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ApiKeyDto>, ErrorResponse>>;
  deleteApiKey(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // Guardrails
  listGuardrails(): Promise<ApiResult<ResourceEntryDto<GuardrailDto>[], ErrorResponse>>;
  getGuardrail(id: string): Promise<ApiResult<ResourceEntryDto<GuardrailDto>, ErrorResponse>>;
  createGuardrail(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<GuardrailDto>, ErrorResponse>>;
  updateGuardrail(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<GuardrailDto>, ErrorResponse>>;
  deleteGuardrail(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // Cache policies
  listCachePolicies(): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>[], ErrorResponse>>;
  getCachePolicy(id: string): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>, ErrorResponse>>;
  createCachePolicy(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>, ErrorResponse>>;
  updateCachePolicy(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<CachePolicyDto>, ErrorResponse>>;
  deleteCachePolicy(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // MCP servers
  listMcpServers(): Promise<ApiResult<ResourceEntryDto<McpServerDto>[], ErrorResponse>>;
  getMcpServer(id: string): Promise<ApiResult<ResourceEntryDto<McpServerDto>, ErrorResponse>>;
  createMcpServer(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<McpServerDto>, ErrorResponse>>;
  updateMcpServer(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<McpServerDto>, ErrorResponse>>;
  deleteMcpServer(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // A2A agents
  listA2aAgents(): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>[], ErrorResponse>>;
  getA2aAgent(id: string): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>, ErrorResponse>>;
  createA2aAgent(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>, ErrorResponse>>;
  updateA2aAgent(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<A2aAgentDto>, ErrorResponse>>;
  deleteA2aAgent(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // Passthrough routes
  listPassthroughRoutes(): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>[], ErrorResponse>>;
  getPassthroughRoute(id: string): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>, ErrorResponse>>;
  createPassthroughRoute(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>, ErrorResponse>>;
  updatePassthroughRoute(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<PassthroughRouteDto>, ErrorResponse>>;
  deletePassthroughRoute(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // Observability exporters (Writable)
  listObservabilityExporters(): Promise<ApiResult<ResourceEntryDto<ObservabilityExporterDto>[], ErrorResponse>>;
  getObservabilityExporter(id: string): Promise<ApiResult<ResourceEntryDto<ObservabilityExporterDto>, ErrorResponse>>;
  createObservabilityExporter(body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ObservabilityExporterDto>, ErrorResponse>>;
  updateObservabilityExporter(id: string, body: Record<string, unknown>): Promise<ApiResult<ResourceEntryDto<ObservabilityExporterDto>, ErrorResponse>>;
  deleteObservabilityExporter(id: string): Promise<ApiResult<{ deleted: boolean; id: string }, ErrorResponse>>;
  // Model auto-discovery (SSRF-safe on backend)
  discoverModels(body: DiscoverModelsRequestDto): Promise<ApiResult<DiscoverModelsResponseDto, ErrorResponse>>;
}
