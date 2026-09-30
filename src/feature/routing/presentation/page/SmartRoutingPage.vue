<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { coreContainer } from '@/core/di/di';
import { RoutingModuleKeys } from '../../di/RoutingModuleKeys';
import type { SmartRoutingViewModel } from '../viewmodel/SmartRoutingViewModel';
import { parseRoutingTargets } from '../../domain/entities/SmartRouting';

const router = useRouter();
const vm = coreContainer.get<SmartRoutingViewModel>(RoutingModuleKeys.SmartRoutingViewModel);

onMounted(() => {
  vm.load();
});

onUnmounted(() => {
  vm.dispose();
});

const virtualModels = computed(() => vm.uiState.virtualModels);

function getStrategyLabel(strategy: string): string {
  switch (strategy) {
    case 'round_robin_weighted':
    case 'round_robin':
      return 'Weighted Round-Robin';
    case 'failover':
      return 'Priority Failover';
    case 'least_latency':
      return 'Least Latency';
    default:
      return strategy;
  }
}

function handleCreate() {
  router.push('/routing/new');
}

function handleEdit(id: string) {
  router.push(`/routing/${encodeURIComponent(id)}/edit`);
}

function handleDelete(id: string, name: string) {
  if (confirm(`Delete virtual routing model "${name}"?`)) {
    vm.deleteVirtualModel(id);
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Smart Routing Rules</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Virtual models that distribute traffic across multiple upstream targets with weighted balancing, failover, or latency optimization.
        </p>
      </div>
      <button
        type="button"
        class="btn-primary self-start sm:self-auto"
        @click="handleCreate"
      >
        <span aria-hidden="true">+</span>
        <span>Create Routing Model</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="vm.uiState.isLoading" class="panel p-8 text-center text-sm text-slate-500 dark:text-slate-400">
      Loading virtual routing models…
    </div>

    <!-- Error State -->
    <div
      v-else-if="vm.uiState.errorMessage"
      class="panel p-4 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-sm text-red-700 dark:text-red-400"
      role="alert"
    >
      {{ vm.uiState.errorMessage }}
    </div>

    <!-- Empty State -->
    <div
      v-else-if="virtualModels.length === 0"
      class="panel p-10 text-center space-y-3"
    >
      <div class="w-10 h-10 mx-auto rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-base">
        ⇄
      </div>
      <div class="space-y-1">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">No routing models configured</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Create a virtual model to combine multiple upstream models into a resilient endpoint with weighted load balancing or failover.
        </p>
      </div>
      <button type="button" class="btn-primary inline-flex" @click="handleCreate">
        Create First Routing Rule
      </button>
    </div>

    <!-- Virtual Models Grid / List -->
    <div v-else class="grid grid-cols-1 gap-4" role="list" aria-label="Smart routing models">
      <div
        v-for="model in virtualModels"
        :key="model.id"
        class="panel p-5 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        role="listitem"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-base font-semibold text-slate-900 dark:text-slate-100 font-mono">
                {{ model.displayName || model.modelName }}
              </h3>
              <span class="badge badge-amber">virtual</span>
              <span class="text-xs text-slate-500 font-mono">{{ model.id }}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Strategy: <strong class="text-slate-700 dark:text-slate-200">{{ getStrategyLabel(parseRoutingTargets(model.raw).strategy) }}</strong>
            </p>
          </div>
          <div class="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              class="btn-secondary text-xs px-3 min-h-[36px]"
              :aria-label="'Edit ' + model.displayName"
              @click="handleEdit(model.id)"
            >
              Edit
            </button>
            <button
              type="button"
              class="btn-secondary text-xs px-3 min-h-[36px] text-red-600 dark:text-red-400 hover:border-red-300"
              :aria-label="'Delete ' + model.displayName"
              @click="handleDelete(model.id, model.displayName)"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Targets visual preview -->
        <div class="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
          <span class="text-[11px] font-semibold tracking-wider uppercase text-slate-500">
            Routing Targets ({{ parseRoutingTargets(model.raw).targets.length }})
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <div
              v-for="(t, idx) in parseRoutingTargets(model.raw).targets"
              :key="idx"
              class="p-2.5 rounded-md bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1"
            >
              <div class="font-mono text-slate-800 dark:text-slate-200 truncate font-medium">
                {{ t.modelResourceId }}
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-500">
                <span>Weight: <strong class="text-amber-600 dark:text-amber-400">{{ t.weight }}</strong></span>
                <span>Priority: {{ t.priority }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
