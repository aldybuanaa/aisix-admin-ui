<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import type { ThemeViewModel } from '@/core/presentation/ThemeViewModel';

const props = defineProps<{
  themeVm: ThemeViewModel;
}>();

const emit = defineEmits<{
  (e: 'open-menu'): void;
}>();

const route = useRoute();
const title = computed(() => String(route.meta.title ?? 'AISIX Operations'));
const themeLabel = computed(() => {
  const mode = props.themeVm.uiState.mode;
  if (mode === 'system') return 'Auto';
  return mode.charAt(0).toUpperCase() + mode.slice(1);
});
</script>

<template>
  <header class="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-3 sm:px-5 gap-3 sticky top-0 z-20">
    <button
      type="button"
      class="lg:hidden min-w-[44px] min-h-[44px] -ml-1 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md focus-visible:outline-2 focus-visible:outline-amber-600"
      aria-label="Open navigation menu"
      @click="emit('open-menu')"
    >
      <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" stroke-linecap="round" />
      </svg>
    </button>

    <div class="min-w-0 flex-1">
      <h1 class="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate">
        {{ title }}
      </h1>
    </div>

    <div class="hidden sm:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
      <span class="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true"></span>
        Control plane
      </span>
      <span class="font-mono">/admin/v1</span>
    </div>

    <button
      type="button"
      class="sm:hidden min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-amber-600"
      :aria-label="'Switch theme, current: ' + themeLabel"
      :title="'Theme: ' + themeLabel"
      @click="themeVm.cycle()"
    >
      <span aria-hidden="true">{{ themeVm.uiState.effective === 'dark' ? '◐' : '◑' }}</span>
    </button>
  </header>
</template>
