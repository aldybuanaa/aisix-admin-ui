<script setup lang="ts">
import { ref } from 'vue';
import type { AdminResourceKey } from '@/feature/admin/domain/entities/AdminResource';
import AdminHeader from '@/feature/admin/presentation/components/AdminHeader.vue';
import AdminResourceListPage from '@/feature/admin/presentation/page/AdminResourceListPage.vue';
import ModelDiscoveryPage from '@/feature/admin/presentation/page/ModelDiscoveryPage.vue';

const activeTab = ref<AdminResourceKey | 'discovery'>('models');

function onSelectTab(tab: AdminResourceKey | 'discovery') {
  activeTab.value = tab;
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
    <AdminHeader :current-tab="activeTab" @select="onSelectTab" />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ModelDiscoveryPage v-if="activeTab === 'discovery'" />
      <AdminResourceListPage v-else :resource-key="activeTab" />
    </main>

    <footer class="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
      AISIX Control Plane Admin &bull; Clean Architecture &bull; Vue 3
    </footer>
  </div>
</template>
