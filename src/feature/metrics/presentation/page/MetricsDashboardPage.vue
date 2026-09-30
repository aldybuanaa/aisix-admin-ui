<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { coreContainer } from '@/core/di/di';
import { MetricsModuleKeys } from '../../di/MetricsModuleKeys';
import type { MetricsDashboardViewModel } from '../viewmodel/MetricsDashboardViewModel';
import type { ModelRuntimeStatus } from '../../domain/entities/MetricsEntity';

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

// 0=Healthy, 1=Degraded, 2=Down
function modelHealthLabel(health: 0 | 1 | 2): string {
  if (health === 0) return 'Healthy';
  if (health === 1) return 'Degraded';
  return 'Down';
}

function modelHealthBadgeClass(health: 0 | 1 | 2): string {
  if (health === 0) return 'badge-emerald';
  if (health === 1) return 'badge-amber';
  return 'badge-red';
}

function statusBadgeClass(status: ModelRuntimeStatus) {
  switch (status) {
    case 'healthy':
      return 'badge-emerald';
    case 'unhealthy':
      return 'badge-red';
    case 'cooldown':
      return 'badge-amber';
    case 'not_applicable':
      return 'badge';
    default:
      return 'badge';
  }
}

function fmtNum(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(Math.round(n));
}

function fmtMs(n: number | undefined): string {
  if (n === undefined || n === null) return '—';
  return n.toFixed(0) + ' ms';
}

function fmtTimestamp(ts: number | null): string {
  if (ts === null) return '—';
  return new Date(ts * 1000).toLocaleString();
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
          v-if="health.type === 'Success' && health.data.config"
          class="text-xs text-slate-500 dark:text-slate-400"
        >
          Config rev: {{ health.data.config.snapshot_revision }}
        </div>
      </div>

      <!-- Total Requests -->
      <div class="panel p-4 space-y-2" aria-label="Total requests">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Requests</div>
        <div v-if="metrics.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Loading…</div>
        <div v-else-if="metrics.type === 'Success'" class="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {{ fmtNum(metrics.data.total_requests) }}
        </div>
        <div v-else-if="metrics.type === 'Error'" class="text-xs text-red-500" role="alert">{{ metrics.message }}</div>
        <div v-else class="text-2xl font-bold text-slate-400">—</div>
      </div>

      <!-- Avg Latency -->
      <div class="panel p-4 space-y-2" aria-label="Average latency">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Avg Latency</div>
        <div v-if="metrics.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Loading…</div>
        <div
          v-else-if="metrics.type === 'Success'"
          class="text-2xl font-bold tabular-nums"
          :class="metrics.data.avg_latency_ms > 2000 ? 'text-amber-600' : 'text-slate-900 dark:text-slate-100'"
        >
          {{ fmtMs(metrics.data.avg_latency_ms) }}
        </div>
        <div v-else class="text-2xl font-bold text-slate-400">—</div>
      </div>

      <!-- Total Tokens -->
      <div class="panel p-4 space-y-2" aria-label="Total tokens">
        <div class="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total Tokens</div>
        <div v-if="metrics.type === 'Loading'" class="text-sm text-slate-500 animate-pulse">Loading…</div>
        <div v-else-if="metrics.type === 'Success'" class="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
          {{ fmtNum(metrics.data.total_tokens) }}
        </div>
        <div v-else class="text-2xl font-bold text-slate-400">—</div>
      </div>
    </div>

    <!-- Model Health (from /admin/v1/health models array) -->
    <div
      v-if="health.type === 'Success' && health.data.models.length > 0"
      class="panel p-4 space-y-3"
    >
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Model Health</h3>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        <div
          v-for="model in health.data.models"
          :key="model.id"
          class="flex items-center justify-between p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-sm"
        >
          <span class="font-mono text-xs text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{{ model.name }}</span>
          <span :class="['badge', modelHealthBadgeClass(model.health)]">{{ modelHealthLabel(model.health) }}</span>
        </div>
      </div>
    </div>

    <!-- Model Statuses (from /admin/v1/models/status) -->
    <div class="panel p-4 space-y-3">
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Model Runtime Status</h3>

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
        v-else-if="modelStatus.type === 'Success' && modelStatus.data.length === 0"\
        class="py-6 text-sm text-center text-slate-400 dark:text-slate-500"
      >
        No models found. Configure models in the Provider Wizard.
      </div>

      <div v-else-if="modelStatus.type === 'Success'" class="overflow-x-auto -mx-4 px-4">
        <table class="w-full text-sm" role="grid" aria-label="Model status table">
          <thead>
            <tr class="text-[11px] uppercase tracking-wider text-left text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <th class="pb-2 font-semibold">Model</th>
              <th class="pb-2 font-semibold hidden sm:table-cell">Kind</th>
              <th class="pb-2 font-semibold">Status</th>
              <th class="pb-2 font-semibold hidden md:table-cell">Reason / Cooldown</th>
              <th class="pb-2 font-semibold hidden lg:table-cell">Last Checked</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="m in modelStatus.data"
              :key="m.id"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
            >
              <td class="py-2.5 pr-3">
                <div class="font-mono text-xs text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{{ m.display_name }}</div>
                <div class="text-[11px] text-slate-400 truncate">{{ m.id }}</div>
              </td>
              <td class="py-2.5 pr-3 hidden sm:table-cell text-xs text-slate-600 dark:text-slate-400">{{ m.kind }}</td>
              <td class="py-2.5 pr-3">
                <span :class="['badge', statusBadgeClass(m.status)]">{{ m.status }}</span>
              </td>
              <td class="py-2.5 pr-3 hidden md:table-cell text-xs text-slate-600 dark:text-slate-400">
                <span v-if="m.status_reason">{{ m.status_reason }}</span>
                <span v-else-if="m.cooldown_until" class="text-amber-600">Until {{ fmtTimestamp(m.cooldown_until) }}</span>
                <span v-else class="text-slate-400">—</span>
              </td>
              <td class="py-2.5 hidden lg:table-cell text-xs text-slate-400 font-mono">
                <span v-if="m.last_checked_at">{{ fmtTimestamp(m.last_checked_at) }} (HTTP {{ m.last_check_status ?? '—' }})</span>
                <span v-else>—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="py-6 text-sm text-center text-slate-400">No data available.</div>
    </div>

    <!-- Provider Breakdown -->
    <div
      v-if="metrics.type === 'Success' && Object.keys(metrics.data.provider_breakdown).length > 0"
      class="panel p-4 space-y-3"
    >
      <h3 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Provider Breakdown</h3>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <div
          v-for="(breakdown, provider) in metrics.data.provider_breakdown"
          :key="provider"
          class="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1"
        >
          <div class="font-semibold text-slate-700 dark:text-slate-200 truncate">{{ provider }}</div>
          <div class="tabular-nums text-slate-600 dark:text-slate-400">Requests: <strong>{{ fmtNum(breakdown.requests) }}</strong></div>
          <div class="tabular-nums text-slate-500">
            Tokens: {{ fmtNum(breakdown.tokens) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
