<script setup lang="ts">
import { ref } from 'vue';
import type { AdminColumn } from '../../domain/entities/AdminResource';

defineProps<{
  columns: readonly AdminColumn[];
  visibleKeys: readonly string[];
}>();

const emit = defineEmits<{
  (e: 'toggle', key: string): void;
}>();

const isOpen = ref(false);
</script>

<template>
  <div class="relative inline-block text-left">
    <button
      type="button"
      class="inline-flex items-center gap-x-1.5 rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 min-h-[44px]"
      @click="isOpen = !isOpen"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
      Kolom
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 p-2 focus:outline-none"
      role="menu"
    >
      <div class="text-xs font-semibold text-slate-500 dark:text-slate-400 px-2 py-1 mb-1">
        Tampilkan Kolom
      </div>
      <label
        v-for="col in columns"
        :key="col.key"
        :class="[
          'flex items-center px-2 py-1.5 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer select-none',
          col.alwaysVisible ? 'opacity-60 cursor-not-allowed' : '',
        ]"
      >
        <input
          type="checkbox"
          :checked="visibleKeys.includes(col.key)"
          :disabled="col.alwaysVisible"
          class="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mr-2"
          @change="emit('toggle', col.key)"
        />
        <span class="text-slate-800 dark:text-slate-200">{{ col.key }}</span>
        <span v-if="col.alwaysVisible" class="ml-auto text-[10px] text-slate-400">(Wajib)</span>
      </label>
    </div>
  </div>
</template>
