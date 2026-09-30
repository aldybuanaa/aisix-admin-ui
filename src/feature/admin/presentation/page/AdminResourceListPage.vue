<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { coreContainer } from '@/core/di/di';
import { AdminModuleKeys } from '../../di/AdminModuleKeys';
import type { AdminResourceKey, AdminResource } from '../../domain/entities/AdminResource';
import type { AdminResourceListViewModel } from '../../viewmodel/AdminResourceListViewModel';
import type { AdminResourceDetailViewModel } from '../../viewmodel/AdminResourceDetailViewModel';
import ColumnToggleButton from '../components/ColumnToggleButton.vue';
import ResourceTable from '../components/ResourceTable.vue';
import ResourceEditModal from '../components/ResourceEditModal.vue';

const props = defineProps<{
  resourceKey: AdminResourceKey;
}>();

const listVm = coreContainer.get<AdminResourceListViewModel>(AdminModuleKeys.AdminResourceListViewModel);
const detailVm = coreContainer.get<AdminResourceDetailViewModel>(AdminModuleKeys.AdminResourceDetailViewModel);

const isModalOpen = ref(false);

const definition = computed(() => listVm.definition);

const filteredItems = computed<readonly AdminResource[]>(() => {
  const q = listVm.uiState.searchQuery.trim().toLowerCase();
  const all = listVm.uiState.items;
  if (!q) return all;
  return all.filter((item) => {
    if (item.id.toLowerCase().includes(q)) return true;
    const rec = item as unknown as Record<string, unknown>;
    for (const key of Object.keys(rec)) {
      const v = rec[key];
      if (typeof v === 'string' && v.toLowerCase().includes(q)) return true;
    }
    return false;
  });
});

const isLoading = computed(() => listVm.uiState.isLoading);
const errorMessage = computed(() => listVm.uiState.errorMessage);

watch(
  () => props.resourceKey,
  (newKey) => {
    listVm.setResource(newKey);
  },
  { immediate: true },
);

function openCreate() {
  detailVm.init(props.resourceKey);
  isModalOpen.value = true;
}

function openEdit(item: AdminResource) {
  detailVm.init(props.resourceKey, item.id);
  isModalOpen.value = true;
}

function handleDelete(id: string) {
  if (confirm(`Yakin ingin menghapus ${props.resourceKey} dengan ID: ${id}?`)) {
    listVm.deleteItem(id);
  }
}

function onSaved() {
  isModalOpen.value = false;
  listVm.load();
}

onMounted(() => {
  listVm.load();
});

onUnmounted(() => {
  listVm.dispose();
  detailVm.dispose();
});
</script>

<template>
  <div class="space-y-4">
    <!-- Top Toolbar -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
      <div>
        <h2 class="text-base font-bold text-slate-900 dark:text-white capitalize">
          {{ definition.key.replace(/_/g, ' ') }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {{ listVm.uiState.items.length }} total entri
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="relative flex-1 sm:w-64 min-w-[200px]">
          <input
            type="text"
            :value="listVm.uiState.searchQuery"
            placeholder="Cari ID atau nama..."
            class="w-full text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            @input="listVm.setSearchQuery(($event.target as HTMLInputElement).value)"
          />
        </div>

        <ColumnToggleButton
          :columns="definition.columns"
          :visible-keys="listVm.uiState.visibleColumnKeys"
          @toggle="listVm.toggleColumn($event)"
        />

        <button
          v-if="definition.writable"
          type="button"
          class="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 min-h-[44px] shadow-sm"
          @click="openCreate"
        >
          <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah
        </button>
      </div>
    </div>

    <!-- Notices -->
    <div
      v-if="listVm.uiState.actionSuccess"
      class="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex justify-between items-center"
    >
      <span>{{ listVm.uiState.actionSuccess }}</span>
      <button type="button" class="font-bold ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center" @click="listVm.clearActionNotices()">×</button>
    </div>

    <div
      v-if="listVm.uiState.actionError"
      class="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-xs flex justify-between items-center"
    >
      <span>{{ listVm.uiState.actionError }}</span>
      <button type="button" class="font-bold ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center" @click="listVm.clearActionNotices()">×</button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mb-2"></div>
      <p>Memuat data {{ definition.key }}...</p>
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800 text-xs">
      <p class="text-red-700 dark:text-red-300 font-semibold mb-2">{{ errorMessage }}</p>
      <button
        type="button"
        class="px-3 py-1.5 bg-red-600 text-white rounded text-xs font-semibold min-h-[44px] min-w-[80px]"
        @click="listVm.load()"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredItems.length === 0"
      class="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400"
    >
      <p class="font-semibold text-slate-800 dark:text-slate-200 mb-1 capitalize">
        Tidak ada data {{ definition.key.replace(/_/g, ' ') }}
      </p>
      <p class="mb-4">Belum ada entri yang dikonfigurasi untuk resource ini.</p>
      <button
        v-if="definition.writable"
        type="button"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md text-xs font-semibold min-h-[44px]"
        @click="openCreate"
      >
        Buat Entri Pertama
      </button>
    </div>

    <!-- Data Table -->
    <div v-else class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <ResourceTable
        :items="filteredItems"
        :columns="definition.columns"
        :visible-keys="listVm.uiState.visibleColumnKeys"
        :writable="definition.writable"
        :deleting-id="listVm.uiState.deletingId"
        @edit="openEdit($event)"
        @delete="handleDelete($event)"
      />
    </div>

    <!-- Modal -->
    <ResourceEditModal
      :is-open="isModalOpen"
      :definition="definition"
      :vm="detailVm"
      @close="isModalOpen = false"
      @saved="onSaved"
    />
  </div>
</template>
