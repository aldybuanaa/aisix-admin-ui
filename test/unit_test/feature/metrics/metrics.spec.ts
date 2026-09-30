import { describe, expect, it, vi } from 'vitest';
import 'reflect-metadata';
import { of } from 'rxjs';
import { Result } from '@/core/types';
import { MetricsDashboardViewModel } from '@/feature/metrics/presentation/viewmodel/MetricsDashboardViewModel';
import type { HealthStatus, MetricsSummary, ModelStatusEntry } from '@/feature/metrics/domain/entities/MetricsEntity';

function makeVm() {
  const mockHealth: HealthStatus = {
    status: 'ok',
    version: '1.2.3',
    uptime_seconds: 7200,
    checks: { db: { status: 'ok' }, redis: { status: 'ok' } },
  };
  const mockModels: ModelStatusEntry[] = [
    { id: 'models:gpt-4o', provider: 'openai', status: 'active', request_count_1h: 500, error_rate_1h: 0.01 },
    { id: 'models:claude-3-5', provider: 'anthropic', status: 'rate_limited', request_count_1h: 20, error_rate_1h: 0 },
  ];
  const mockMetrics: MetricsSummary = {
    total_requests_1h: 520,
    avg_latency_ms: 340,
    p99_latency_ms: 1200,
    error_rate: 0.009,
    active_models: 2,
    provider_breakdown: {
      openai: { requests: 500 },
      anthropic: { requests: 20 },
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
      expect(vm.uiState.healthState.data.version).toBe(mockHealth.version);
    }
    vm.dispose();
  });

  it('populates modelStatusState with model entries', () => {
    const { vm, mockModels } = makeVm();
    vm.load();
    expect(vm.uiState.modelStatusState.type).toBe('Success');
    if (vm.uiState.modelStatusState.type === 'Success') {
      expect(vm.uiState.modelStatusState.data).toHaveLength(mockModels.length);
      expect(vm.uiState.modelStatusState.data[0].id).toBe('models:gpt-4o');
      expect(vm.uiState.modelStatusState.data[1].status).toBe('rate_limited');
    }
    vm.dispose();
  });

  it('populates metricsState with summary values', () => {
    const { vm } = makeVm();
    vm.load();
    expect(vm.uiState.metricsState.type).toBe('Success');
    if (vm.uiState.metricsState.type === 'Success') {
      expect(vm.uiState.metricsState.data.total_requests_1h).toBe(520);
      expect(vm.uiState.metricsState.data.avg_latency_ms).toBe(340);
      expect(vm.uiState.metricsState.data.error_rate).toBe(0.009);
    }
    vm.dispose();
  });

  it('surfaces error state when health call fails', () => {
    const repo = {
      getHealth: vi.fn().mockReturnValue(of(Result.Failure('Connection refused'))),
      getModelStatuses: vi.fn().mockReturnValue(of(Result.Success([]))),
      getMetricsSummary: vi.fn().mockReturnValue(of(Result.Success({ total_requests_1h: 0 }))),
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
