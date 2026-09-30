<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { AdminResourceDefinition } from '../../domain/entities/AdminResource';
import type { AdminResourceDetailViewModel } from '../../viewmodel/AdminResourceDetailViewModel';

const props = defineProps<{
  definition: AdminResourceDefinition;
  vm: AdminResourceDetailViewModel;
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const localJson = ref('');

watch(
  () => props.vm.uiState.jsonText,
  (val) => {
    localJson.value = val;
  },
  { immediate: true },
);

function onInput(e: Event) {
  const target = e.target as HTMLTextAreaElement;
  localJson.value = target.value;
  props.vm.setJsonText(target.value);
}

function handleSave() {
  props.vm.save();
}

const isSaving = computed(() => props.vm.uiState.saveState.type === 'Loading');
const errorMessage = computed(() =>
  props.vm.uiState.saveState.type === 'Error' ? props.vm.uiState.saveState.message : '',
);
const isSaveSuccess = computed(() => props.vm.uiState.saveState.type === 'Success');

watch(isSaveSuccess, (val) => {
  if (val) emit('saved');
});
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/60 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
  >
    <div class="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 rounded-t-xl">
        <div>
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">
            {{ vm.isNew ? 'Tambah ' + definition.key : 'Edit ' + definition.key + ' #' + (vm.uiState.itemId ?? '') }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Format JSON mengikuti skema backend AISIX.</p>
        </div>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
          @click="emit('close')"
          aria-label="Tutup modal"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="p-6 overflow-y-auto space-y-4 flex-1">
        <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs">
          {{ errorMessage }}
        </div>
        <div v-if="definition.secretField" class="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">
          <strong>Catatan Keamanan:</strong> Kunci/rahasia (<code>{{ definition.secretField }}</code>) disimpan aman di backend dan tidak dikembalikan dalam format plaintext.
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Payload Konfigurasi (JSON)
          </label>
          <textarea
            :value="localJson"
            rows="12"
            class="w-full font-mono text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            @input="onInput"
          />
          <p v-if="vm.uiState.jsonValidationError" class="text-xs text-red-600 dark:text-red-400 mt-1 font-mono">
            {{ vm.uiState.jsonValidationError }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3 bg-slate-50 dark:bg-slate-800/40 rounded-b-xl">
        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[44px]"
          @click="emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          :disabled="!vm.uiState.jsonText || !!vm.uiState.jsonValidationError || isSaving"
          class="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 min-h-[44px]"
          @click="handleSave"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </div>
  </div>
</template>
