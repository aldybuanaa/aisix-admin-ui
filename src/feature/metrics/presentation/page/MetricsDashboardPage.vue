<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { coreContainer } from '@/core/di/di';
import { MetricsModuleKeys } from '../../di/MetricsModuleKeys';
import type { MetricsDashboardViewModel } from '../viewmodel/MetricsDashboardViewModel';
import type { ModelStatusEntry } from '../../domain/entities/MetricsEntity';

const vm = coreContainer.get<MetricsDashboardViewModel>(MetricsModuleKeys.MetricsDashboardViewModel);

onMounted(() => vm.load());
onUnmounted(() => vm.dispose());

const health = computed(() => vm.uiState.healthState);
const modelStatus = computed(() => vm.uiState.modelStatusState);
const metrics = computed(() => vm.uiState.metricsState);
const lastRefreshed = computed(() => {
  if (!vm.uiState.lastRefreshedAt) return null;
  return new Date(vm.uiState.lastRefreshedAt).toLocaleTimeString();
});

const isLoading = computed(
  () =>
    health.value.type === 'Loading' ||
    modelStatus.value.type === 'Loading' ||
    metrics.value.type === 'Loading',
);

function healthColor(status: string) {
  if (status === 'ok') return 'text-emerald-600 dark:text-emerald-400';
  if (status === 'degraded') return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function healthDot(status: string) {
  if (status === 'ok') return 'bg-emerald-500';
  if (status === 'degraded') return 'bg-amber-500';
  return 'bg-red-500';
}

function statusBadgeClass(status: ModelStatusEntry['status']) {
  switch (status) {
    case 'active': return 'badge-emerald';
    case 'error': return 'badge-red';
    case 'rate_limited': return 'badge-amber';
    default: return 'badge';
  }
}

function fmtNum(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function fmtMs(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return n.toFixed(0) + ' ms';
}

function fmtPct(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return (n * 100).toFixed(1) + '%';
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Metrics Dashboard</h2>
        <p v-if="lastRefreshed" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Last refreshed at {{ lastRefreshed }}
        </p>
      </div>
      <button
        type="button"
        class="btn-secondary self-start sm:self-auto min-h-[38px] px-4 text-sm"
        :disabled="isLoading"
        @click="vm.refresh()"
        aria-label="Refresh metrics"
      >
        <span v-if="isLoading">Refreshing…</span>
        <span v-else>↻ Refresh</span>
      </button>
    </div>

    <!-- Health & Quick Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <!-- Gateway Health -->
      <div class="panel p-4 space-y-2" aria-label="Gateway health">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Gateway Status</div>

        <div v-if="health.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Checking…</div>
        <div v-else-if="health.type === 'Error'" class="text-sm text-red-600 dark:text-red-400" role="alert">
          {{ health.message }}
        </div>
        <div v-else-if="health.type === 'Success'" class="flex items-center gap-2">
          <span :class="['w-2 h-2 rounded-full', healthDot(health.data.status)]" aria-hidden="true"></span>
          <span class="text-base font-bold" :class="healthColor(health.data.status)">
            {{ health.data.status.toUpperCase() }}
          </span>
        </div>
        <div v-else class="text-sm text-slate-400">—</div>

        <div
          v-if="health.type === 'Success' && health.data.uptime_seconds !== undefined"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          Uptime: {{ (health.data.uptime_seconds / 3600).toFixed(1) }}h
        </div>
        <div
          v-if="health.type === 'Success' && health.data.version"
          class="text-xs font-mono text-slate-400 dark:text-slate-500"
        >
          v{{ health.data.version }}
        </div>
      </div>

      <!-- Total Requests 1h -->
      <div class="panel p-4 space-y-2" aria-label="Total requests">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Requests (1h)</div>
        <div v-if="metrics.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Loading…</div>
        <div v-else-if="metrics.type === 'Success'" class="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {{ fmtNum(metrics.data.total_requests_1h) }}
        </div>
        <div v-else-if="metrics.type === 'Error'" class="text-xs text-red-500" role="alert">{{ metrics.message }}</div>
        <div v-else class="text-2xl font-bold text-slate-400">—</div>
      </div>

      <!-- Avg Latency -->
      <div class="panel p-4 space-y-2" aria-label="Average latency">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avg Latency</div>
        <div v-if="metrics.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Loading…</div>
        <div v-else-if="metrics.type === 'Success'" class="text-2xl font-bold tabular-nums"
          :class="(metrics.data.avg_latency_ms ?? 0) > 2000 ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'"
        >
          {{ fmtMs(metrics.data.avg_latency_ms) }}
        </div>
        <div v-else class="text-2xl font-bold text-slate-400">—</div>
        <div v-if="metrics.type === 'Success' && metrics.data.p99_latency_ms !== undefined" class="text-xs text-slate-500">
          p99: {{ fmtMs(metrics.data.p99_latency_ms) }}
        </div>
      </div>

      <!-- Error Rate -->
      <div class="panel p-4 space-y-2" aria-label="Error rate">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Error Rate</div>
        <div v-if="metrics.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Loading…</div>
        <div v-else-if="metrics.type === 'Success'" class="text-2xl font-bold tabular-nums"
          :class="(metrics.data.error_rate ?? 0) > 0.05 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'"
        >
          {{ fmtPct(metrics.data.error_rate) }}
        </div>
        <div v-else class="text-2xl font-bold text-slate-400">—</div>
      </div>
    </div>

    <!-- Health Checks detail -->
    <div
      v-if="health.type === 'Success' && health.data.checks && Object.keys(health.data.checks).length > 0"
      class="panel p-4 space-y-3"
    >
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Health Checks</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        <div
          v-for="(check, name) in health.data.checks"
          :key="name"
          class="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-sm"
        >
          <span class="font-mono text-xs text-slate-700 dark:text-slate-300">{{ name }}</span>
          <div class="flex items-center gap-1.5">
            <span
              :class="['w-2 h-2 rounded-full flex-shrink-0', healthDot(check.status)]"
              :aria-label="check.status"
            ></span>
            <span class="text-xs" :class="healthColor(check.status)">{{ check.status }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Model Statuses -->
    <div class="panel p-4 space-y-3">
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Model Status</h3>

      <div v-if="modelStatus.type === 'Loading'" class="py-6 text-center text-sm text-slate-500 animate-pulse">
        Loading model statuses…
      </div>

      <div
        v-else-if="modelStatus.type === 'Error'"
        class="py-4 text-sm text-red-600 dark:text-red-400 text-center"
        role="alert"
      >
        {{ modelStatus.message }}
      </div>

      <div
        v-else-if="modelStatus.type === 'Success' && modelStatus.data.length === 0"
        class="py-6 text-sm text-center text-slate-400 dark:text-slate-500"
      >
        No models found. Configure models in the Provider Wizard.
      </div>

      <div v-else-if="modelStatus.type === 'Success'" class="overflow-x-auto -mx-4 px-4">
        <table class="w-full text-sm" role="grid" aria-label="Model status table">
          <thead>
            <tr class="text-[11px] uppercase tracking-wider text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th class="pb-2 font-semibold">Model</th>
              <th class="pb-2 font-semibold hidden sm:table-cell">Provider</th>
              <th class="pb-2 font-semibold">Status</th>
              <th class="pb-2 font-semibold hidden md:table-cell text-right">Reqs/h</th>
              <th class="pb-2 font-semibold hidden md:table-cell text-right">Err Rate</th>
              <th class="pb-2 font-semibold hidden lg:table-cell">Last Used</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="m in modelStatus.data"
              :key="m.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-2.5 pr-3">
                <div class="font-mono text-xs text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{{ m.id }}</div>
                <div v-if="m.display_name" class="text-[11px] text-slate-400 truncate">{{ m.display_name }}</div>
              </td>
              <td class="py-2.5 pr-3 hidden sm:table-cell text-xs text-slate-600 dark:text-slate-400">{{ m.provider }}</td>
              <td class="py-2.5 pr-3">
                <span :class="['badge', statusBadgeClass(m.status)]">{{ m.status }}</span>
              </td>
              <td class="py-2.5 pr-3 hidden md:table-cell text-right text-xs tabular-nums text-slate-700 dark:text-slate-300">
                {{ fmtNum(m.request_count_1h) }}
              </td>
              <td class="py-2.5 pr-3 hidden md:table-cell text-right text-xs tabular-nums"
                :class="(m.error_rate_1h ?? 0) > 0.05 ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'"
              >
                {{ fmtPct(m.error_rate_1h) }}
              </td>
              <td class="py-2.5 hidden lg:table-cell text-xs text-slate-400 font-mono">
                {{ m.last_used_at ? new Date(m.last_used_at).toLocaleString() : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="py-6 text-sm text-center text-slate-400">No data available.</div>
    </div>

    <!-- Provider Breakdown -->
    <div
      v-if="metrics.type === 'Success' && metrics.data.provider_breakdown && Object.keys(metrics.data.provider_breakdown).length > 0"
      class="panel p-4 space-y-3"
    >
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Provider Breakdown (1h)</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="(breakdown, provider) in metrics.data.provider_breakdown"
          :key="provider"
          class="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1"
        >
          <div class="font-semibold text-slate-700 dark:text-slate-200 truncate">{{ provider }}</div>
          <div class="tabular-nums text-slate-600 dark:text-slate-400">Requests: <strong>{{ fmtNum(breakdown.requests) }}</strong></div>
          <div v-if="breakdown.tokens !== undefined" class="tabular-nums text-slate-500">
            Tokens: {{ fmtNum(breakdown.tokens) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
