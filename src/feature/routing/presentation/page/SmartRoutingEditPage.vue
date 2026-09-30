<script setup lang="ts">
import { onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { coreContainer } from '@/core/di/di';
import { RoutingModuleKeys } from '../../di/RoutingModuleKeys';
import type { SmartRoutingViewModel } from '../viewmodel/SmartRoutingViewModel';
import { ROUTING_STRATEGIES } from '../../domain/entities/SmartRouting';
import type { RoutingStrategy } from '../../domain/entities/SmartRouting';

const route = useRoute();
const router = useRouter();
const vm = coreContainer.get<SmartRoutingViewModel>(RoutingModuleKeys.SmartRoutingViewModel);

const editingId = computed(() => {
  const id = route.params.id;
  return typeof id === 'string' ? id : null;
});

const isEditing = computed(() => !!editingId.value);

onMounted(() => {
  vm.load();
  if (!isEditing.value) {
    vm.initNew();
  }
});

// When models load and we're editing, hydrate the form
watch(
  () => vm.uiState.virtualModels,
  (models) => {
    if (isEditing.value && models.length > 0) {
      const modelToEdit = models.find((m) => m.id === editingId.value);
      if (modelToEdit) vm.initEdit(modelToEdit);
    }
  },
  { immediate: false },
);

onUnmounted(() => {
  vm.dispose();
});

const STRATEGY_LABELS: Record<RoutingStrategy, string> = {
  round_robin_weighted: 'Weighted Round-Robin',
  round_robin: 'Weighted Round-Robin',
  failover: 'Priority Failover',
  least_latency: 'Least Latency',
};

const displayStrategies = ROUTING_STRATEGIES.filter((s) => s !== 'round_robin');

function handleSave() {
  vm.save();
  const unwatch = watch(
    () => vm.uiState.saveState,
    (state) => {
      if (state.type === 'Success') {
        unwatch();
        router.push('/routing');
      }
    },
  );
}

function handleCancel() {
  router.push('/routing');
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {{ isEditing ? 'Edit Routing Rule' : 'Create Routing Rule' }}
      </h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        Define a virtual model endpoint that distributes requests across multiple upstream AI models.
      </p>
    </div>

    <div class="panel p-5 space-y-6">
      <!-- Display Name -->
      <div>
        <label class="field-label" for="routing-name">Display Name <span class="text-red-500">*</span></label>
        <input
          id="routing-name"
          type="text"
          class="control"
          :class="vm.uiState.formErrors.some((e) => e.includes('display name')) ? '!border-red-500' : ''"
          :value="vm.uiState.form.displayName"
          placeholder="e.g. balanced-gpt"
          autocomplete="off"
          @input="vm.setDisplayName(($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Strategy -->
      <div>
        <label class="field-label" for="routing-strategy">Routing Strategy</label>
        <select
          id="routing-strategy"
          class="control"
          :value="vm.uiState.form.strategy"
          @change="vm.setStrategy(($event.target as HTMLSelectElement).value as RoutingStrategy)"
        >
          <option v-for="s in displayStrategies" :key="s" :value="s">{{ STRATEGY_LABELS[s] }}</option>
        </select>
        <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          <template v-if="vm.uiState.form.strategy === 'round_robin_weighted'">
            Each target receives requests proportional to its weight. Weight=2 gets twice the traffic of weight=1.
          </template>
          <template v-else-if="vm.uiState.form.strategy === 'failover'">
            Targets are tried in priority order. Lower priority number = tried first.
          </template>
          <template v-else-if="vm.uiState.form.strategy === 'least_latency'">
            Requests route to the target with the lowest observed response latency.
          </template>
        </p>
      </div>

      <!-- Targets -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Target Models
            <span class="ml-1 text-slate-400 font-normal text-xs">(minimum 2 required)</span>
          </span>
          <button
            type="button"
            class="btn-secondary text-xs px-3 min-h-[36px]"
            @click="vm.addTarget()"
          >
            + Add Target
          </button>
        </div>

        <!-- Column Headers -->
        <div class="grid grid-cols-12 gap-2 px-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:grid">
          <div class="col-span-5">Model</div>
          <div class="col-span-2 text-center">Weight</div>
          <div class="col-span-2 text-center">Priority</div>
          <div class="col-span-3"></div>
        </div>

        <!-- Target Rows -->
        <div
          v-for="(target, idx) in vm.uiState.form.targets"
          :key="idx"
          class="grid grid-cols-12 gap-2 items-center p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30"
        >
          <!-- Model select -->
          <div class="col-span-12 sm:col-span-5">
            <label :for="'target-model-' + idx" class="sr-only">Target model {{ idx + 1 }}</label>
            <select
              :id="'target-model-' + idx"
              class="control text-xs font-mono"
              :value="target.modelResourceId"
              @change="vm.setTargetModel(idx, ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>— select model —</option>
              <option
                v-for="m in vm.uiState.targetCandidates"
                :key="m.id"
                :value="m.id"
                :disabled="vm.uiState.form.targets.some((t, i) => i !== idx && t.modelResourceId === m.id)"
              >
                {{ m.displayName || m.modelName }} ({{ m.id }})
              </option>
            </select>
          </div>

          <!-- Weight -->
          <div class="col-span-4 sm:col-span-2">
            <label :for="'target-weight-' + idx" class="sr-only sm:hidden text-[11px] text-slate-500">Weight</label>
            <input
              :id="'target-weight-' + idx"
              type="number"
              min="1"
              step="1"
              class="control text-center text-sm"
              :value="target.weight"
              aria-label="Weight"
              @change="vm.setTargetWeight(idx, Number(($event.target as HTMLInputElement).value))"
            />
            <span class="block sm:hidden text-[10px] text-slate-400 text-center">weight</span>
          </div>

          <!-- Priority -->
          <div class="col-span-4 sm:col-span-2">
            <label :for="'target-priority-' + idx" class="sr-only sm:hidden text-[11px] text-slate-500">Priority</label>
            <input
              :id="'target-priority-' + idx"
              type="number"
              min="0"
              step="1"
              class="control text-center text-sm"
              :value="target.priority"
              aria-label="Priority (lower = higher priority)"
              @change="vm.setTargetPriority(idx, Number(($event.target as HTMLInputElement).value))"
            />
            <span class="block sm:hidden text-[10px] text-slate-400 text-center">priority</span>
          </div>

          <!-- Actions -->
          <div class="col-span-4 sm:col-span-3 flex items-center justify-end gap-1">
            <button
              type="button"
              class="btn-secondary text-xs px-2 min-h-[32px] h-8"
              :disabled="idx === 0"
              :aria-label="'Move target ' + (idx + 1) + ' up'"
              @click="vm.moveTarget(idx, -1)"
            >
              ↑
            </button>
            <button
              type="button"
              class="btn-secondary text-xs px-2 min-h-[32px] h-8"
              :disabled="idx === vm.uiState.form.targets.length - 1"
              :aria-label="'Move target ' + (idx + 1) + ' down'"
              @click="vm.moveTarget(idx, 1)"
            >
              ↓
            </button>
            <button
              type="button"
              class="btn-secondary text-xs px-2 min-h-[32px] h-8 text-red-600 dark:text-red-400"
              :disabled="vm.uiState.form.targets.length <= 2"
              :aria-label="'Remove target ' + (idx + 1)"
              @click="vm.removeTarget(idx)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Validation errors -->
      <div
        v-if="vm.uiState.formErrors.length"
        class="rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 space-y-1"
        role="alert"
      >
        <ul class="text-sm text-red-700 dark:text-red-400 list-disc pl-4 space-y-0.5">
          <li v-for="err in vm.uiState.formErrors" :key="err">{{ err }}</li>
        </ul>
      </div>

      <!-- Action bar -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <button type="button" class="btn-secondary" @click="handleCancel">Cancel</button>
        <button
          type="button"
          class="btn-primary min-w-[100px]"
          :disabled="vm.uiState.saveState.type === 'Loading'"
          @click="handleSave"
        >
          <span v-if="vm.uiState.saveState.type === 'Loading'">Saving…</span>
          <span v-else>{{ isEditing ? 'Save Changes' : 'Create Rule' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
