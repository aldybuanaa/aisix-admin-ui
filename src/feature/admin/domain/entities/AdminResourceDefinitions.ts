import type {
  AdminResourceDefinition,
  AdminResourceKey,
} from './AdminResource';

const definitions: Record<AdminResourceKey, AdminResourceDefinition> = {
  models: {
    key: 'models', titleKey: 'resources.models', singularKey: 'resource.model',
    descriptionKey: 'descriptions.models', writable: true,
    columns: [
      { key: 'displayName', labelKey: 'columns.displayName', alwaysVisible: true },
      { key: 'provider', labelKey: 'columns.provider' },
      { key: 'modelName', labelKey: 'columns.modelName' },
      { key: 'providerKeyId', labelKey: 'columns.providerKeyId' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { display_name: '', provider: '', model_name: '', provider_key_id: '' },
    secretField: null,
  },
  provider_keys: {
    key: 'provider_keys', titleKey: 'resources.provider_keys', singularKey: 'resource.provider_key',
    descriptionKey: 'descriptions.provider_keys', writable: true,
    columns: [
      { key: 'displayName', labelKey: 'columns.displayName', alwaysVisible: true },
      { key: 'provider', labelKey: 'columns.provider' },
      { key: 'adapter', labelKey: 'columns.adapter' },
      { key: 'apiBase', labelKey: 'columns.apiBase' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { display_name: '', provider: '', adapter: 'openai', api_base: '' },
    secretField: 'api_key',
  },
  api_keys: {
    key: 'api_keys', titleKey: 'resources.api_keys', singularKey: 'resource.api_key',
    descriptionKey: 'descriptions.api_keys', writable: true,
    columns: [
      { key: 'keyHashPrefix', labelKey: 'columns.keyHashPrefix', alwaysVisible: true },
      { key: 'allowedModels', labelKey: 'columns.allowedModels' },
      { key: 'disabled', labelKey: 'columns.status' },
      { key: 'expiresAt', labelKey: 'columns.expiresAt' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { allowed_models: [], disabled: false },
    secretField: 'key',
  },
  guardrails: {
    key: 'guardrails', titleKey: 'resources.guardrails', singularKey: 'resource.guardrail',
    descriptionKey: 'descriptions.guardrails', writable: true,
    columns: [
      { key: 'name', labelKey: 'columns.name', alwaysVisible: true },
      { key: 'kind', labelKey: 'columns.kind' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { name: '', kind: '' },
    secretField: null,
  },
  cache_policies: {
    key: 'cache_policies', titleKey: 'resources.cache_policies', singularKey: 'resource.cache_policy',
    descriptionKey: 'descriptions.cache_policies', writable: true,
    columns: [
      { key: 'name', labelKey: 'columns.name', alwaysVisible: true },
      { key: 'backend', labelKey: 'columns.backend' },
      { key: 'enabled', labelKey: 'columns.status' },
      { key: 'ttlSeconds', labelKey: 'columns.ttlSeconds' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { name: '', backend: 'memory', enabled: true, ttl_seconds: 3600, scope: 'api_key' },
    secretField: null,
  },
  mcp_servers: {
    key: 'mcp_servers', titleKey: 'resources.mcp_servers', singularKey: 'resource.mcp_server',
    descriptionKey: 'descriptions.mcp_servers', writable: true,
    columns: [
      { key: 'name', labelKey: 'columns.name', alwaysVisible: true },
      { key: 'authType', labelKey: 'columns.authType' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { name: '', url: '', auth_type: 'none' },
    secretField: 'secret',
  },
  a2a_agents: {
    key: 'a2a_agents', titleKey: 'resources.a2a_agents', singularKey: 'resource.a2a_agent',
    descriptionKey: 'descriptions.a2a_agents', writable: true,
    columns: [
      { key: 'name', labelKey: 'columns.name', alwaysVisible: true },
      { key: 'url', labelKey: 'columns.url' },
      { key: 'protocolVersion', labelKey: 'columns.protocolVersion' },
      { key: 'authType', labelKey: 'columns.authType' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { name: '', url: '', protocol_version: '1.0', auth_type: 'none', enabled: true },
    secretField: 'secret',
  },
  passthrough_routes: {
    key: 'passthrough_routes', titleKey: 'resources.passthrough_routes', singularKey: 'resource.passthrough_route',
    descriptionKey: 'descriptions.passthrough_routes', writable: true,
    columns: [
      { key: 'name', labelKey: 'columns.name', alwaysVisible: true },
      { key: 'pathPrefix', labelKey: 'columns.pathPrefix' },
      { key: 'targetUrl', labelKey: 'columns.targetUrl' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: { name: '', path_prefix: '', target_url: '' },
    secretField: null,
  },
  observability_exporters: {
    key: 'observability_exporters', titleKey: 'resources.observability_exporters', singularKey: 'resource.observability_exporter',
    descriptionKey: 'descriptions.observability_exporters', writable: false,
    columns: [
      { key: 'name', labelKey: 'columns.name', alwaysVisible: true },
      { key: 'kind', labelKey: 'columns.kind' },
      { key: 'enabled', labelKey: 'columns.status' },
      { key: 'revision', labelKey: 'columns.revision' },
    ],
    initialPayload: {},
    secretField: null,
  },
};

export function getAdminResourceDefinition(key: AdminResourceKey): AdminResourceDefinition {
  return definitions[key];
}

export function isAdminResourceKey(value: unknown): value is AdminResourceKey {
  return typeof value === 'string' && value in definitions;
}

export const adminResourceDefinitions = Object.values(definitions);
