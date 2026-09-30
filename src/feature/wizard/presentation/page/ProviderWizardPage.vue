<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { coreContainer } from '@/core/di/di';
import { WizardModuleKeys } from '../../di/WizardModuleKeys';
import type { ProviderWizardViewModel } from '../viewmodel/ProviderWizardViewModel';
import type { DiscoverAdapter } from '@/feature/admin/domain/entities/DiscoveredModel';

const vm = coreContainer.get<ProviderWizardViewModel>(WizardModuleKeys.ProviderWizardViewModel);

const isLoading = computed(() => vm.uiState.discoveryState.type === 'Loading');
const isSaving = computed(() => vm.uiState.saveState.type === 'Loading');

const discoveredItems = computed(() => {
  const s = vm.uiState.discoveryState;
  if (s.type !== 'Success') return [];
  const q = vm.uiState.searchQuery.toLowerCase();
  if (!q) return s.data;
  return s.data.filter((m) => m.id.toLowerCase().includes(q));
});

const checkedCount = computed(() => {
  const s = vm.uiState.discoveryState;
  if (s.type !== 'Success') return 0;
  return s.data.filter((m) => m.checked).length;
});

const allFilteredChecked = computed(() => {
  if (!discoveredItems.value.length) return false;
  return discoveredItems.value.every((m) => m.checked);
});

const ADAPTERS: { value: DiscoverAdapter; label: string; placeholder: string }[] = [
  { value: 'openai', label: 'OpenAI / Compatible', placeholder: 'https://api.openai.com/v1' },
  { value: 'anthropic', label: 'Anthropic', placeholder: 'https://api.anthropic.com' },
  { value: 'ollama', label: 'Ollama (local)', placeholder: 'http://localhost:11434/v1' },
];

const selectedAdapter = computed(() => ADAPTERS.find((a) => a.value === vm.uiState.adapter) ?? ADAPTERS[0]);

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape' && vm.uiState.step !== 'configure') {
    vm.reset();
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  vm.dispose();
});
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-5">
    <!-- Header -->
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Provider Setup Wizard</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        Connect an upstream AI provider, discover its models, and import them as gateway resources.
      </p>
    </div>

    <!-- Step indicator -->
    <div class="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
      <span :class="vm.uiState.step === 'configure' ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''">1. Configure</span>
      <span>›</span>
      <span :class="['discover','select'].includes(vm.uiState.step) ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''">2. Discover</span>
      <span>›</span>
      <span :class="['select','saving'].includes(vm.uiState.step) ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''">3. Import</span>
    </div>

    <!-- STEP 1: Configure -->
    <div v-if="vm.uiState.step === 'configure'" class="panel p-5 space-y-5">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">1. Provider connection</h3>

      <!-- Adapter -->
      <div>
        <label class="field-label" for="wizard-adapter">Adapter</label>
        <select
          id="wizard-adapter"
          class="control"
          :value="vm.uiState.adapter"
          @change="vm.setAdapter(($event.target as HTMLSelectElement).value as DiscoverAdapter)"
        >
          <option v-for="a in ADAPTERS" :key="a.value" :value="a.value">{{ a.label }}</option>
        </select>
      </div>

      <!-- Base URL -->
      <div>
        <label class="field-label" for="wizard-base-url">
          Base URL
          <span class="text-slate-400 font-normal">(optional — uses adapter default if blank)</span>
        </label>
        <input
          id="wizard-base-url"
          type="url"
          class="control"
          :class="vm.uiState.apiBaseError ? '!border-red-500 dark:!border-red-400' : ''"
          :placeholder="selectedAdapter.placeholder"
          :value="vm.uiState.apiBase"
          autocomplete="off"
          @input="vm.setApiBase(($event.target as HTMLInputElement).value)"
        />
        <p v-if="vm.uiState.apiBaseError" class="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
          {{ vm.uiState.apiBaseError }}
        </p>
      </div>

      <!-- Key source choice -->
      <div class="flex gap-4 text-sm">
        <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
          <input
            type="radio"
            name="keysource"
            :checked="!vm.uiState.useExistingKey"
            class="w-4 h-4 accent-amber-600"
            @change="vm.setUseExistingKey(false)"
          />
          Enter API key directly
        </label>
        <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
          <input
            type="radio"
            name="keysource"
            :checked="vm.uiState.useExistingKey"
            class="w-4 h-4 accent-amber-600"
            @change="vm.setUseExistingKey(true)"
          />
          Use existing provider key ID
        </label>
      </div>

      <!-- API key field (password) -->
      <div v-if="!vm.uiState.useExistingKey">
        <label class="field-label" for="wizard-api-key">API Key</label>
        <input
          id="wizard-api-key"
          type="password"
          class="control font-mono tracking-widest"
          placeholder="sk-..."
          autocomplete="new-password"
          :value="vm.uiState.apiKey"
          @input="vm.setApiKey(($event.target as HTMLInputElement).value)"
        />
        <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          Used only for this discovery request. Never stored in the browser.
        </p>
      </div>

      <!-- Provider key ID -->
      <div v-else>
        <label class="field-label" for="wizard-key-id">Provider Key ID</label>
        <input
          id="wizard-key-id"
          type="text"
          class="control font-mono"
          placeholder="provider_keys:openai-prod"
          :value="vm.uiState.providerKeyId"
          @input="vm.setProviderKeyId(($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Action -->
      <div class="flex items-center justify-end gap-3 pt-1">
        <span
          v-if="vm.uiState.discoveryState.type === 'Error'"
          class="text-xs text-red-600 dark:text-red-400 flex-1"
          role="alert"
        >
          {{ vm.uiState.discoveryState.message }}
        </span>
        <button
          type="button"
          class="btn-primary min-w-[140px]"
          :disabled="isLoading"
          @click="vm.discover()"
        >
          <span v-if="isLoading">Discovering…</span>
          <span v-else>Test &amp; Discover Models</span>
        </button>
      </div>
    </div>

    <!-- STEP 2: Discover / Select from list -->
    <div v-else-if="vm.uiState.step === 'discover' || vm.uiState.step === 'select'" class="panel p-5 space-y-4">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          2. Choose models to import
          <span class="text-slate-500 font-normal text-xs ml-1">
            ({{ checkedCount }} selected)
          </span>
        </h3>
        <button
          type="button"
          class="btn-secondary text-xs px-3 min-h-[36px]"
          @click="vm.reset()"
        >
          Back
        </button>
      </div>

      <!-- Search -->
      <div class="relative">
        <input
          type="search"
          class="control"
          placeholder="Filter models by name…"
          :value="vm.uiState.searchQuery"
          @input="vm.setSearchQuery(($event.target as HTMLInputElement).value)"
          aria-label="Filter discovered models"
        />
      </div>

      <!-- Header row -->
      <div class="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md text-xs text-slate-600 dark:text-slate-300 font-semibold">
        <label class="flex items-center gap-2 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            class="w-4 h-4 accent-amber-600"
            :checked="allFilteredChecked"
            @change="vm.toggleAll(($event.target as HTMLInputElement).checked)"
            aria-label="Select all filtered models"
          />
        </label>
        <span class="flex-1">Model ID</span>
        <span class="w-40 hidden sm:block">Display name</span>
      </div>

      <!-- Model list -->
      <div class="space-y-0.5 max-h-96 overflow-y-auto" role="list" aria-label="Discovered models">
        <div
          v-for="model in discoveredItems"
          :key="model.id"
          class="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          role="listitem"
        >
          <label class="flex items-center min-h-[44px] gap-2 cursor-pointer">
            <input
              type="checkbox"
              :checked="model.checked"
              class="w-4 h-4 accent-amber-600"
              :aria-label="'Select ' + model.id"
              @change="vm.toggleModel(model.id)"
            />
          </label>
          <span class="flex-1 text-xs font-mono text-slate-700 dark:text-slate-200 truncate">{{ model.id }}</span>
          <span v-if="model.ownedBy" class="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ model.ownedBy }}</span>
          <input
            v-if="model.checked"
            type="text"
            class="control w-40 hidden sm:block text-xs"
            :value="model.customDisplayName"
            :aria-label="'Display name for ' + model.id"
            @input="vm.setCustomName(model.id, ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div
          v-if="discoveredItems.length === 0"
          class="px-3 py-6 text-sm text-center text-slate-400 dark:text-slate-500"
        >
          No models match your filter.
        </div>
      </div>

      <!-- Action -->
      <div class="flex items-center justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <span class="text-xs text-slate-500">{{ checkedCount }} of {{ discoveredItems.length }} selected</span>
        <button
          type="button"
          class="btn-primary min-w-[120px]"
          :disabled="checkedCount === 0 || isSaving"
          @click="vm.proceedToSelect(); vm.saveSelectedModels()"
        >
          Import selected
        </button>
      </div>
    </div>

    <!-- STEP 3: Saving / Done -->
    <div v-else-if="vm.uiState.step === 'saving'" class="panel p-5 space-y-4">
      <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">3. Importing models…</h3>

      <div v-if="vm.uiState.saveState.type === 'Loading'" class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
        <span class="animate-spin text-lg" aria-hidden="true">⟳</span>
        <span>Saving models to the gateway…</span>
      </div>

      <div v-else-if="vm.uiState.saveState.type === 'Success'" class="space-y-3" role="status">
        <div class="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <span aria-hidden="true">✓</span>
          <span>{{ vm.uiState.saveState.data.length }} model(s) imported.</span>
        </div>
        <ul class="text-xs text-slate-500 dark:text-slate-400 list-disc pl-4 space-y-0.5">
          <li v-for="id in vm.uiState.saveState.data" :key="id" class="font-mono">{{ id }}</li>
        </ul>
        <div v-if="vm.uiState.saveErrors.length" class="space-y-1" role="alert">
          <p class="text-xs font-semibold text-amber-700 dark:text-amber-400">Partial errors:</p>
          <ul class="text-xs text-amber-700 dark:text-amber-300 list-disc pl-4 space-y-0.5">
            <li v-for="err in vm.uiState.saveErrors" :key="err">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-else-if="vm.uiState.saveState.type === 'Error'" role="alert" class="text-sm text-red-700 dark:text-red-400 space-y-1">
        <p>{{ vm.uiState.saveState.message }}</p>
        <ul class="text-xs list-disc pl-4 space-y-0.5">
          <li v-for="err in vm.uiState.saveErrors" :key="err">{{ err }}</li>
        </ul>
      </div>

      <div class="flex gap-3 pt-2">
        <button type="button" class="btn-primary" @click="vm.reset()">Start over</button>
      </div>
    </div>
  </div>
</template>
