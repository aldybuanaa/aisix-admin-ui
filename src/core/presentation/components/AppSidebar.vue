<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import type { NavItem } from '@/core/navigation/navItems';
import { NAV_ITEMS } from '@/core/navigation/navItems';
import type { ThemeViewModel } from '@/core/presentation/ThemeViewModel';

const props = defineProps<{
  collapsed: boolean;
  themeVm: ThemeViewModel;
}>();

const emit = defineEmits<{
  (e: 'toggle-collapse'): void;
}>();

const route = useRoute();

const groups = computed(() => {
  const acc: Record<string, NavItem[]> = {};
  for (const item of NAV_ITEMS) {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
  }
  return acc;
});

function isActive(item: NavItem): boolean {
  if (item.path === '/') return route.path === '/';
  if (item.path.startsWith('/resources/')) {
    return route.path === item.path || route.path.startsWith(item.path);
  }
  if (item.path === '/resources') {
    return route.path.startsWith('/resources') && !route.path.match(/^\/resources\/(models|api_keys)/);
  }
  return route.path === item.path || route.path.startsWith(item.path + '/');
}

const themeLabel = computed(() => {
  const m = props.themeVm.uiState.mode;
  if (m === 'system') return 'Auto';
  return m.charAt(0).toUpperCase() + m.slice(1);
});

const themeIcon = computed(() => {
  const eff = props.themeVm.uiState.effective;
  return eff === 'dark' ? '◐' : '◑';
});
</script>

<template>
  <aside
    :class="[
      'flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-200 h-screen sticky top-0',
      collapsed ? 'w-14' : 'w-56',
    ]"
    aria-label="Main navigation"
  >
    <!-- Logo area -->
    <div class="flex items-center h-14 border-b border-slate-800 flex-shrink-0 px-3 gap-2.5">
      <div
        class="h-7 w-7 rounded bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-xs shrink-0 select-none"
        aria-hidden="true"
      >
        6R
      </div>
      <span
        v-if="!collapsed"
        class="text-white text-sm font-semibold tracking-tight truncate"
      >AISIX Admin</span>
      <button
        type="button"
        class="ml-auto shrink-0 text-slate-400 hover:text-white p-1 rounded focus-visible:outline-2 focus-visible:outline-amber-500 min-w-[32px] min-h-[32px] flex items-center justify-center"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggle-collapse')"
      >
        <svg class="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5">
          <path v-if="!collapsed" stroke-linecap="round" d="M10 4L6 8l4 4" />
          <path v-else stroke-linecap="round" d="M6 4l4 4-4 4" />
        </svg>
      </button>
    </div>

    <!-- Nav groups -->
    <nav class="flex-1 overflow-y-auto py-2 space-y-0.5" aria-label="Sections">
      <template v-for="(items, group) in groups" :key="group">
        <!-- Group label -->
        <div
          v-if="!collapsed"
          class="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none"
        >{{ group }}</div>
        <div v-else class="pt-2" aria-hidden="true"></div>
        <!-- Items -->
        <RouterLink
          v-for="item in items"
          :key="item.key"
          :to="item.path"
          :class="[
            'flex items-center gap-2.5 mx-1 px-2.5 py-2 rounded-md transition-colors min-h-[40px] focus-visible:outline-2 focus-visible:outline-amber-500 focus-visible:outline-offset-1',
            isActive(item)
              ? 'bg-amber-500/15 text-amber-400 font-medium'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
          ]"
          :aria-current="isActive(item) ? 'page' : undefined"
          :title="collapsed ? item.label : undefined"
        >
          <!-- Dot indicator -->
          <span
            :class="[
              'shrink-0 h-1.5 w-1.5 rounded-full',
              isActive(item) ? 'bg-amber-400' : 'bg-slate-600',
            ]"
            aria-hidden="true"
          ></span>
          <span v-if="!collapsed" class="text-xs truncate">{{ item.label }}</span>
        </RouterLink>
      </template>
    </nav>

    <!-- Theme toggle -->
    <div class="border-t border-slate-800 p-2 flex-shrink-0">
      <button
        type="button"
        :class="[
          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors min-h-[40px] focus-visible:outline-2 focus-visible:outline-amber-500',
          collapsed ? 'justify-center' : '',
        ]"
        :title="'Theme: ' + themeLabel"
        :aria-label="'Switch theme, current: ' + themeLabel"
        @click="themeVm.cycle()"
      >
        <span class="text-base leading-none" aria-hidden="true">{{ themeIcon }}</span>
        <span v-if="!collapsed" class="text-xs">{{ themeLabel }}</span>
      </button>
    </div>
  </aside>
</template>
