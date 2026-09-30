import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { of } from 'rxjs';
import { Result } from '@/core/types';
import { MetricsDashboardViewModel } from '@/feature/metrics/presentation/viewmodel/MetricsDashboardViewModel';
import type { HealthStatus, MetricsSummary, ModelStatusEntry } from '@/feature/metrics/domain/entities/MetricsEntity';
import { parsePrometheusText } from '@/feature/metrics/domain/utils/parsePrometheusText';
import { MetricsRemoteDataSourceImpl } from '@/feature/metrics/data/remote/data-sources/implementation/MetricsRemoteDataSourceImpl';
import type { HttpClient, HttpResponse } from '@/core/network/HttpClient';
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs';

// ---------------------------------------------------------------------------
// Prometheus parser unit tests
// ---------------------------------------------------------------------------

const SAMPLE_PROM = `
# HELP aisix_requests_total Total request count
# TYPE aisix_requests_total counter
aisix_requests_total{provider="openai",model="gpt-4o",status="200"} 450
aisix_requests_total{provider="anthropic",model="claude-3-5",status="200"} 120
aisix_requests_total{provider="openai",model="gpt-4o",status="429"} 30
# HELP aisix_tokens_consumed_total Total tokens
# TYPE aisix_tokens_consumed_total counter
aisix_tokens_consumed_total{provider="openai",model="gpt-4o",type="prompt"} 100000
aisix_tokens_consumed_total{provider="openai",model="gpt-4o",type="completion"} 50000
aisix_tokens_consumed_total{provider="anthropic",model="claude-3-5",type="prompt"} 40000
# HELP aisix_request_duration_seconds_sum Duration sum
aisix_request_duration_seconds_sum{provider="openai",model="gpt-4o"} 900
aisix_request_duration_seconds_count{provider="openai",model="gpt-4o"} 480
aisix_request_duration_seconds_sum{provider="anthropic",model="claude-3-5"} 240
aisix_request_duration_seconds_count{provider="anthropic",model="claude-3-5"} 120
process_start_time_seconds 1720000000
`.trim();

describe('parsePrometheusText', () => {
  it('counts total requests across all series', () => {
    const summary = parsePrometheusText(SAMPLE_PROM);
    expect(summary.total_requests).toBe(600);
  });

  it('counts total tokens across all series', () => {
    const summary = parsePrometheusText(SAMPLE_PROM);
    expect(summary.total_tokens).toBe(190000);
  });

  it('computes average latency from sum and count across all providers', () => {
    const summary = parsePrometheusText(SAMPLE_PROM);
    // sum = 900 + 240 = 1140 seconds, count = 480 + 120 = 600
    const expectedMs = (1140 / 600) * 1000;
    expect(summary.avg_latency_ms).toBeCloseTo(expectedMs, 1);
  });

  it('breaks requests down by provider', () => {
    const summary = parsePrometheusText(SAMPLE_PROM);
    expect(summary.provider_breakdown['openai'].requests).toBe(480);
    expect(summary.provider_breakdown['anthropic'].requests).toBe(120);
  });

  it('breaks tokens down by provider', () => {
    const summary = parsePrometheusText(SAMPLE_PROM);
    expect(summary.provider_breakdown['openai'].tokens).toBe(150000);
    expect(summary.provider_breakdown['anthropic'].tokens).toBe(40000);
  });

  it('ignores comment lines and unknown series without errors', () => {
    const summary = parsePrometheusText(SAMPLE_PROM);
    expect(summary).not.toHaveProperty('process_start_time_seconds');
    expect(typeof summary.total_requests).toBe('number');
  });

  it('returns zero totals for empty input', () => {
    const summary = parsePrometheusText('');
    expect(summary.total_requests).toBe(0);
    expect(summary.total_tokens).toBe(0);
    expect(summary.avg_latency_ms).toBe(0);
    expect(summary.provider_breakdown).toEqual({});
  });

  it('returns zero latency when duration count series is missing', () => {
    const text = `aisix_request_duration_seconds_sum{provider="openai"} 100`;
    const summary = parsePrometheusText(text);
    expect(summary.avg_latency_ms).toBe(0);
  });

  it('handles label values with escaped quotes without crashing', () => {
    const text = `aisix_requests_total{provider="open\\"ai",status="200"} 10`;
    const summary = parsePrometheusText(text);
    expect(summary.total_requests).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// MetricsRemoteDataSourceImpl tests
// ---------------------------------------------------------------------------

function makeTextHttpClient(prometheusText: string): HttpClient {
  return {
    get: vi.fn().mockImplementation((path: string) => {
      if (path === '/admin/v1/health') {
        return Promise.resolve<HttpResponse<unknown>>({
          status: 200,
          data: {
            status: 'ok',
            models: [{ id: 'uuid-1', name: 'my-gpt4', health: 0 }],
            config: { snapshot_revision: 42, snapshot_age_seconds: 10 },
          },
          headers: new Headers(),
        });
      }
      if (path === '/admin/v1/models/status') {
        return Promise.resolve<HttpResponse<unknown>>({
          status: 200,
          data: [
            {
              id: 'uuid-1',
              display_name: 'gpt-4o',
              kind: 'direct',
              status: 'healthy',
              cooldown_until: null,
              last_checked_at: { secs_since_epoch: 1720000000, nanos_since_epoch: 123000000 },
              last_check_status: 200,
              status_reason: null,
            },
            {
              id: 'uuid-2',
              display_name: 'claude-3-5',
              kind: 'routing',
              status: 'not_applicable',
              cooldown_until: null,
              last_checked_at: null,
              last_check_status: null,
              status_reason: null,
            },
          ],
          headers: new Headers(),
        });
      }
      return Promise.resolve({ status: 404, data: null, headers: new Headers() });
    }),
    getText: vi.fn().mockResolvedValue({
      status: 200,
      data: prometheusText,
      headers: new Headers(),
    }),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };
}

describe('MetricsRemoteDataSourceImpl', () => {
  describe('getHealth()', () => {
    it('maps the backend health DTO to HealthStatus', async () => {
      const ds = new MetricsRemoteDataSourceImpl(makeTextHttpClient(''));
      const result = await lastValueFrom(ds.getHealth());
      expect(result.type).toBe('Success');
      if (result.type === 'Success') {
        expect(result.data.status).toBe('ok');
        expect(result.data.models[0].name).toBe('my-gpt4');
        expect(result.data.models[0].health).toBe(0);
        expect(result.data.config.snapshot_revision).toBe(42);
      }
    });

    it('emits Loading first, then Success', async () => {
      const ds = new MetricsRemoteDataSourceImpl(makeTextHttpClient(''));
      const emissions = await firstValueFrom(ds.getHealth().pipe(toArray()));
      expect(emissions[0].type).toBe('Loading');
      expect(emissions[1].type).toBe('Success');
    });

    it('falls back to unhealthy for an unrecognised status value', async () => {
      const httpClient = makeTextHttpClient('');
      (httpClient.get as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        data: { status: 'totally_fine', models: [], config: { snapshot_revision: 0, snapshot_age_seconds: 0 } },
        headers: new Headers(),
      });
      const ds = new MetricsRemoteDataSourceImpl(httpClient);
      const result = await lastValueFrom(ds.getHealth());
      if (result.type === 'Success') {
        expect(result.data.status).toBe('unhealthy');
      }
    });
  });

  describe('getModelStatuses()', () => {
    it('maps a model status array matching real ModelStatusView payload', async () => {
      const ds = new MetricsRemoteDataSourceImpl(makeTextHttpClient(''));
      const result = await lastValueFrom(ds.getModelStatuses());
      expect(result.type).toBe('Success');
      if (result.type === 'Success') {
        expect(result.data).toHaveLength(2);
        const entry = result.data[0];
        expect(entry.id).toBe('uuid-1');
        expect(entry.display_name).toBe('gpt-4o');
        expect(entry.kind).toBe('direct');
        expect(entry.status).toBe('healthy');
        expect(entry.last_checked_at).toBe(1720000000);
        expect(entry.last_check_status).toBe(200);
        expect(entry.status_reason).toBeNull();
      }
    });

    it('returns an empty array when the response is not an array', async () => {
      const httpClient = makeTextHttpClient('');
      (httpClient.get as ReturnType<typeof vi.fn>).mockImplementation((path: string) =>
        path === '/admin/v1/models/status'
          ? Promise.resolve({ status: 200, data: null, headers: new Headers() })
          : Promise.resolve({ status: 200, data: {}, headers: new Headers() }),
      );
      const ds = new MetricsRemoteDataSourceImpl(httpClient);
      const result = await lastValueFrom(ds.getModelStatuses());
      if (result.type === 'Success') {
        expect(result.data).toEqual([]);
      }
    });
  });

  describe('getMetricsSummary()', () => {
    it('calls getText on /admin/v1/metrics', async () => {
      const httpClient = makeTextHttpClient(SAMPLE_PROM);
      const ds = new MetricsRemoteDataSourceImpl(httpClient);
      await lastValueFrom(ds.getMetricsSummary());
      expect(httpClient.getText).toHaveBeenCalledWith('/admin/v1/metrics');
    });

    it('parses Prometheus text into a MetricsSummary', async () => {
      const ds = new MetricsRemoteDataSourceImpl(makeTextHttpClient(SAMPLE_PROM));
      const result = await lastValueFrom(ds.getMetricsSummary());
      expect(result.type).toBe('Success');
      if (result.type === 'Success') {
        expect(result.data.total_requests).toBe(600);
        expect(result.data.total_tokens).toBe(190000);
        expect(result.data.avg_latency_ms).toBeGreaterThan(0);
        expect(result.data.provider_breakdown['openai'].requests).toBe(480);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// MetricsDashboardViewModel tests
// ---------------------------------------------------------------------------

function makeVm() {
  const mockHealth: HealthStatus = {
    status: 'ok',
    models: [
      { id: 'uuid-1', name: 'my-gpt4', health: 0 },
      { id: 'uuid-2', name: 'my-claude', health: 1 },
    ],
    config: { snapshot_revision: 42, snapshot_age_seconds: 10 },
  };
  const mockModels: ModelStatusEntry[] = [
    {
      id: 'uuid-1',
      display_name: 'gpt-4o',
      kind: 'direct',
      status: 'healthy',
      cooldown_until: null,
      last_checked_at: 1720000000,
      last_check_status: 200,
      status_reason: null,
    },
    {
      id: 'uuid-2',
      display_name: 'claude-3-5',
      kind: 'routing',
      status: 'not_applicable',
      cooldown_until: null,
      last_checked_at: null,
      last_check_status: null,
      status_reason: null,
    },
  ];
  const mockMetrics: MetricsSummary = {
    total_requests: 600,
    total_tokens: 190000,
    avg_latency_ms: 1900,
    provider_breakdown: {
      openai: { requests: 480, tokens: 150000 },
      anthropic: { requests: 120, tokens: 40000 },
    },
  };

  const repo = {
    getHealth: vi.fn().mockReturnValue(of(Result.Success(mockHealth))),
    getModelStatuses: vi.fn().mockReturnValue(of(Result.Success(mockModels))),
    getMetricsSummary: vi.fn().mockReturnValue(of(Result.Success(mockMetrics))),
  };

  const vm = new MetricsDashboardViewModel(repo as any);
  return { vm, repo, mockHealth, mockModels, mockMetrics };
}

describe('MetricsDashboardViewModel', () => {
  it('starts with all states Idle', () => {
    const { vm } = makeVm();
    expect(vm.uiState.healthState.type).toBe('Idle');
    expect(vm.uiState.modelStatusState.type).toBe('Idle');
    expect(vm.uiState.metricsState.type).toBe('Idle');
    expect(vm.uiState.lastRefreshedAt).toBeNull();
    vm.dispose();
  });

  it('calls all three repository methods on load()', () => {
    const { vm, repo } = makeVm();
    vm.load();
    expect(repo.getHealth).toHaveBeenCalledOnce();
    expect(repo.getModelStatuses).toHaveBeenCalledOnce();
    expect(repo.getMetricsSummary).toHaveBeenCalledOnce();
    vm.dispose();
  });

  it('populates healthState with gateway health data', () => {
    const { vm, mockHealth } = makeVm();
    vm.load();
    expect(vm.uiState.healthState.type).toBe('Success');
    if (vm.uiState.healthState.type === 'Success') {
      expect(vm.uiState.healthState.data.status).toBe('ok');
      expect(vm.uiState.healthState.data.models).toHaveLength(mockHealth.models.length);
      expect(vm.uiState.healthState.data.config.snapshot_revision).toBe(42);
    }
    vm.dispose();
  });

  it('populates modelStatusState with model entries', () => {
    const { vm, mockModels } = makeVm();
    vm.load();
    expect(vm.uiState.modelStatusState.type).toBe('Success');
    if (vm.uiState.modelStatusState.type === 'Success') {
      expect(vm.uiState.modelStatusState.data).toHaveLength(mockModels.length);
      expect(vm.uiState.modelStatusState.data[0].id).toBe('uuid-1');
      expect(vm.uiState.modelStatusState.data[1].status).toBe('not_applicable');
    }
    vm.dispose();
  });

  it('populates metricsState with parsed Prometheus summary values', () => {
    const { vm } = makeVm();
    vm.load();
    expect(vm.uiState.metricsState.type).toBe('Success');
    if (vm.uiState.metricsState.type === 'Success') {
      expect(vm.uiState.metricsState.data.total_requests).toBe(600);
      expect(vm.uiState.metricsState.data.avg_latency_ms).toBe(1900);
      expect(vm.uiState.metricsState.data.provider_breakdown['openai'].requests).toBe(480);
    }
    vm.dispose();
  });

  it('surfaces error state when health call fails', () => {
    const repo = {
      getHealth: vi.fn().mockReturnValue(of(Result.Failure('Connection refused'))),
      getModelStatuses: vi.fn().mockReturnValue(of(Result.Success([]))),
      getMetricsSummary: vi.fn().mockReturnValue(
        of(Result.Success({ total_requests: 0, total_tokens: 0, avg_latency_ms: 0, provider_breakdown: {} })),
      ),
    };
    const vm = new MetricsDashboardViewModel(repo as any);
    vm.load();
    expect(vm.uiState.healthState.type).toBe('Error');
    if (vm.uiState.healthState.type === 'Error') {
      expect(vm.uiState.healthState.message).toBe('Connection refused');
    }
    vm.dispose();
  });

  it('refresh() re-calls all repository methods', () => {
    const { vm, repo } = makeVm();
    vm.load();
    vm.refresh();
    expect(repo.getHealth).toHaveBeenCalledTimes(2);
    expect(repo.getModelStatuses).toHaveBeenCalledTimes(2);
    expect(repo.getMetricsSummary).toHaveBeenCalledTimes(2);
    vm.dispose();
  });

  it('sets lastRefreshedAt after successful health fetch', () => {
    const { vm } = makeVm();
    expect(vm.uiState.lastRefreshedAt).toBeNull();
    vm.load();
    expect(vm.uiState.lastRefreshedAt).not.toBeNull();
    vm.dispose();
  });
});
