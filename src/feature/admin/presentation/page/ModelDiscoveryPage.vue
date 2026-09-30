<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { coreContainer } from '@/core/di/di';
import { AdminModuleKeys } from '../../di/AdminModuleKeys';
import type { ModelDiscoveryViewModel } from '../../viewmodel/ModelDiscoveryViewModel';
import type { DiscoverAdapter } from '../../domain/entities/DiscoveredModel';

const vm = coreContainer.get<ModelDiscoveryViewModel>(AdminModuleKeys.ModelDiscoveryViewModel);

const isDiscovering = computed(() => vm.uiState.discoveryState.type === 'Loading');
const errorMessage = computed(() =>
  vm.uiState.discoveryState.type === 'Error' ? vm.uiState.discoveryState.message : '',
);
const discoveredModels = computed(() => {
  const s = vm.uiState.discoveryState;
  return s.type === 'Success' ? s.data : [];
});

const filteredModels = computed(() => {
  const q = vm.uiState.searchQuery.trim().toLowerCase();
  if (!q) return discoveredModels.value;
  return discoveredModels.value.filter((m) => {
    if (m.id.toLowerCase().includes(q)) return true;
    if (m.ownedBy && m.ownedBy.toLowerCase().includes(q)) return true;
    return false;
  });
});

function handleDiscover() {
  vm.discover();
}

onMounted(() => {
  // ready
});

onUnmounted(() => {
  vm.clearSensitiveInput();
  vm.dispose();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Form Card -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white">Auto-Discovery Model AI</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Tarik daftar model langsung dari provider upstream melalui endpoint backend AISIX yang SSRF-safe.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Adapter -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Adapter Upstream
          </label>
          <select
            :value="vm.uiState.adapter"
            class="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            @change="vm.setAdapter(($event.target as HTMLSelectElement).value as DiscoverAdapter)"
          >
            <option value="openai">OpenAI / Compatible</option>
            <option value="anthropic">Anthropic</option>
            <option value="ollama">Ollama Local</option>
          </select>
        </div>

        <!-- Custom Base URL -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Base URL (Opsional)
          </label>
          <input
            type="text"
            :value="vm.uiState.apiBase"
            placeholder="https://api.openai.com/v1"
            class="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            @input="vm.setApiBase(($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- API Key (Sensitive) -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            API Key (Opsional / Rahasia)
          </label>
          <input
            type="password"
            :value="vm.uiState.apiKey"
            placeholder="sk-..."
            autocomplete="off"
            class="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            @input="vm.setApiKey(($event.target as HTMLInputElement).value)"
          />
        </div>

        <!-- Provider Key ID -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Provider Key ID (Tersimpan)
          </label>
          <input
            type="text"
            :value="vm.uiState.providerKeyId"
            placeholder="default-openai-key"
            class="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
            @input="vm.setProviderKeyId(($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button
          type="button"
          :disabled="isDiscovering"
          class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-md min-h-[44px] shadow-sm flex items-center gap-2 disabled:opacity-50"
          @click="handleDiscover"
        >
          <span v-if="isDiscovering" class="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></span>
          <span>{{ isDiscovering ? 'Menghubungi Upstream...' : 'Jalankan Discovery' }}</span>
        </button>
      </div>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
      <strong>Gagal melakukan discovery:</strong> {{ errorMessage }}
    </div>

    <!-- Results Section -->
    <div v-if="vm.uiState.hasSearched" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
          Model Ditemukan ({{ discoveredModels.length }})
        </h3>

        <input
          v-if="discoveredModels.length > 0"
          type="text"
          :value="vm.uiState.searchQuery"
          placeholder="Filter model id..."
          class="text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @input="vm.setSearchQuery(($event.target as HTMLInputElement).value)"
        />
      </div>

      <!-- Empty -->
      <div
        v-if="discoveredModels.length === 0 && !isDiscovering && !errorMessage"
        class="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500"
      >
        Tidak ada model yang ditemukan dari provider ini.
      </div>

      <!-- Table of models -->
      <div
        v-else-if="filteredModels.length > 0"
        class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      >
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold">
            <tr>
              <th class="px-4 py-3">Model ID</th>
              <th class="px-4 py-3">Owned By / Provider</th>
              <th class="px-4 py-3">Object Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            <tr v-for="m in filteredModels" :key="m.id" class="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
              <td class="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-slate-100">
                {{ m.id }}
              </td>
              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                {{ m.ownedBy || '-' }}
              </td>
              <td class="px-4 py-3 text-slate-500 font-mono">
                {{ m.object || 'model' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
