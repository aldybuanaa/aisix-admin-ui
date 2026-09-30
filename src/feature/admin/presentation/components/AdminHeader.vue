<script setup lang="ts">
import type { AdminResourceKey } from '../../domain/entities/AdminResource';
import { adminResourceDefinitions } from '../../domain/entities/AdminResourceDefinitions';

defineProps<{
  currentTab: AdminResourceKey | 'discovery';
}>();

const emit = defineEmits<{
  (e: 'select', tab: AdminResourceKey | 'discovery'): void;
}>();

const resourceTabs = adminResourceDefinitions.map((d) => ({
  key: d.key,
  title: d.titleKey.replace('resources.', '').replace('_', ' ').toUpperCase(),
}));
</script>

<template>
  <header class="bg-slate-900 border-b border-slate-800 text-slate-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center space-x-3">
          <div class="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            6
          </div>
          <div>
            <h1 class="text-lg font-semibold tracking-tight text-white">AISIX Admin</h1>
            <p class="text-xs text-slate-400">Control Plane & Resource Management</p>
          </div>
        </div>

        <nav class="hidden md:flex space-x-1 overflow-x-auto" aria-label="Global">
          <button
            v-for="tab in resourceTabs"
            :key="tab.key"
            type="button"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px]',
              currentTab === tab.key
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
            ]"
            @click="emit('select', tab.key)"
          >
            {{ tab.title }}
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-2 text-xs font-medium rounded-md transition-colors min-h-[44px]',
              currentTab === 'discovery'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-indigo-300 hover:bg-slate-800/60 hover:text-white',
            ]"
            @click="emit('select', 'discovery')"
          >
            DISCOVER
          </button>
        </nav>
      </div>

      <!-- Mobile navigation scroll -->
      <div class="md:hidden flex space-x-1 pb-3 overflow-x-auto scrollbar-thin" aria-label="Mobile Navigation">
        <button
          v-for="tab in resourceTabs"
          :key="tab.key"
          type="button"
          :class="[
            'px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap min-h-[44px] shrink-0',
            currentTab === tab.key
              ? 'bg-slate-800 text-white'
              : 'text-slate-300 hover:bg-slate-800/60',
          ]"
          @click="emit('select', tab.key)"
        >
          {{ tab.title }}
        </button>
        <button
          type="button"
          :class="[
            'px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap min-h-[44px] shrink-0',
            currentTab === 'discovery' ? 'bg-indigo-600 text-white' : 'text-indigo-300',
          ]"
          @click="emit('select', 'discovery')"
        >
          DISCOVER
        </button>
      </div>
    </div>
  </header>
</template>
