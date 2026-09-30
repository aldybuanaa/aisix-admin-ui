import { describe, expect, it } from 'vitest';
import { mapModelDtoToDomain } from '@/feature/admin/utils/mapper/mapModelDto';
import { mapProviderKeyDtoToDomain } from '@/feature/admin/utils/mapper/mapProviderKeyDto';
import { mapApiKeyDtoToDomain } from '@/feature/admin/utils/mapper/mapApiKeyDto';
import { mapGuardrailDtoToDomain } from '@/feature/admin/utils/mapper/mapGuardrailDto';
import { mapCachePolicyDtoToDomain } from '@/feature/admin/utils/mapper/mapCachePolicyDto';
import { mapMcpServerDtoToDomain } from '@/feature/admin/utils/mapper/mapMcpServerDto';
import { mapA2aAgentDtoToDomain } from '@/feature/admin/utils/mapper/mapA2aAgentDto';
import { mapPassthroughRouteDtoToDomain } from '@/feature/admin/utils/mapper/mapPassthroughRouteDto';
import { mapObservabilityExporterDtoToDomain } from '@/feature/admin/utils/mapper/mapObservabilityExporterDto';
import { mapDiscoveredModelDtoToDomain } from '@/feature/admin/utils/mapper/mapDiscoveryDto';

describe('admin mappers — snake_case DTO to camelCase domain', () => {
  it('maps a model entry', () => {
    const result = mapModelDtoToDomain({
      id: 'm-1',
      revision: 3,
      value: {
        display_name: 'GPT-4o',
        provider: 'openai',
        model_name: 'gpt-4o',
        provider_key_id: 'pk-1',
      },
    });

    expect(result).toMatchObject({
      id: 'm-1',
      revision: 3,
      displayName: 'GPT-4o',
      provider: 'openai',
      modelName: 'gpt-4o',
      providerKeyId: 'pk-1',
    });
  });

  it('maps a provider key entry without retaining the secret', () => {
    const result = mapProviderKeyDtoToDomain({
      id: 'pk-1',
      revision: 1,
      value: { display_name: 'OpenAI Prod', provider: 'openai', api_base: 'https://api.openai.com' },
    });

    expect(result.displayName).toBe('OpenAI Prod');
    expect(result.apiBase).toBe('https://api.openai.com');
    expect(result.adapter).toBeNull();
  });

  it('truncates the API key hash and never exposes the full value', () => {
    const fullHash = 'abcdef0123456789abcdef0123456789';
    const result = mapApiKeyDtoToDomain({
      id: 'k-1',
      revision: 1,
      value: { key_hash: fullHash, allowed_models: ['gpt-4o'], disabled: true },
    });

    expect(result.keyHashPrefix).toBe('abcdef012345...');
    expect(result.keyHashPrefix).not.toBe(fullHash);
    expect(result.allowedModels).toEqual(['gpt-4o']);
    expect(result.disabled).toBe(true);
  });

  it('maps a guardrail entry', () => {
    const result = mapGuardrailDtoToDomain({
      id: 'g-1',
      revision: 2,
      value: { name: 'PII Filter', kind: 'pii' },
    });

    expect(result.name).toBe('PII Filter');
    expect(result.kind).toBe('pii');
  });

  it('maps a cache policy entry with a default ttl', () => {
    const result = mapCachePolicyDtoToDomain({
      id: 'c-1',
      revision: 1,
      value: { name: 'Default Cache', backend: 'redis', ttl_seconds: 120 },
    });

    expect(result.backend).toBe('redis');
    expect(result.ttlSeconds).toBe(120);
    expect(result.enabled).toBe(true);
  });

  it('maps an MCP server entry falling back to display_name', () => {
    const result = mapMcpServerDtoToDomain({
      id: 'srv-1',
      revision: 1,
      value: { display_name: 'Filesystem MCP', auth_type: 'bearer' },
    });

    expect(result.name).toBe('Filesystem MCP');
    expect(result.authType).toBe('bearer');
  });

  it('maps an A2A agent entry', () => {
    const result = mapA2aAgentDtoToDomain({
      id: 'a-1',
      revision: 1,
      value: { name: 'Weather Agent', url: 'https://agent.test', protocol_version: '0.2', auth_type: 'none' },
    });

    expect(result.url).toBe('https://agent.test');
    expect(result.protocolVersion).toBe('0.2');
  });

  it('maps a passthrough route entry', () => {
    const result = mapPassthroughRouteDtoToDomain({
      id: 'r-1',
      revision: 1,
      value: { name: 'Legacy API', path_prefix: '/legacy', target_url: 'https://internal.test' },
    });

    expect(result.pathPrefix).toBe('/legacy');
    expect(result.targetUrl).toBe('https://internal.test');
  });

  it('maps an observability exporter entry', () => {
    const result = mapObservabilityExporterDtoToDomain({
      id: 'e-1',
      revision: 1,
      value: { name: 'OTLP Collector', kind: 'otlp', enabled: false },
    });

    expect(result.kind).toBe('otlp');
    expect(result.enabled).toBe(false);
  });

  it('maps a discovered model DTO', () => {
    const result = mapDiscoveredModelDtoToDomain({
      id: 'gpt-4o-mini',
      object: 'model',
      owned_by: 'openai',
    });

    expect(result).toEqual({ id: 'gpt-4o-mini', object: 'model', ownedBy: 'openai' });
  });
});
