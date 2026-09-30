import type { AdminModel } from './AdminModel';
import type { ProviderKey } from './ProviderKey';
import type { ApiKey } from './ApiKey';
import type { Guardrail } from './Guardrail';
import type { CachePolicy } from './CachePolicy';
import type { McpServer } from './McpServer';
import type { A2aAgent } from './A2aAgent';
import type { PassthroughRoute } from './PassthroughRoute';
import type { ObservabilityExporter } from './ObservabilityExporter';

export type AdminResourceKey =
  | 'models'
  | 'provider_keys'
  | 'api_keys'
  | 'guardrails'
  | 'cache_policies'
  | 'mcp_servers'
  | 'a2a_agents'
  | 'passthrough_routes'
  | 'observability_exporters';

export type AdminResource =
  | AdminModel
  | ProviderKey
  | ApiKey
  | Guardrail
  | CachePolicy
  | McpServer
  | A2aAgent
  | PassthroughRoute
  | ObservabilityExporter;

export interface AdminColumn {
  readonly key: string;
  readonly labelKey: string;
  readonly alwaysVisible?: boolean;
}

export interface AdminResourceDefinition {
  readonly key: AdminResourceKey;
  readonly titleKey: string;
  readonly singularKey: string;
  readonly descriptionKey: string;
  readonly writable: boolean;
  readonly columns: readonly AdminColumn[];
  readonly initialPayload: Record<string, unknown>;
  readonly secretField: string | null;
}
