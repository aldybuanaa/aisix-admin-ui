<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterView } from 'vue-router';
import AppSidebar from './AppSidebar.vue';
import AppTopbar from './AppTopbar.vue';
import { ThemeViewModel } from '@/core/presentation/ThemeViewModel';

const themeVm = new ThemeViewModel();
const collapsed = ref(false);
const drawerOpen = ref(false);

const SIDEBAR_KEY = 'aisix-sidebar-collapsed';

function toggleCollapse() {
  collapsed.value = !collapsed.value;
  try {
    localStorage.setItem(SIDEBAR_KEY, String(collapsed.value));
  } catch {
    // ignore
  }
}

function openMenu() {
  drawerOpen.value = true;
}

function closeMenu() {
  drawerOpen.value = false;
}

function onEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && drawerOpen.value) closeMenu();
}

onMounted(() => {
  try {
    collapsed.value = localStorage.getItem(SIDEBAR_KEY) === 'true';
  } catch {
    collapsed.value = false;
  }
  document.addEventListener('keydown', onEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', onEscape);
  themeVm.dispose();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
    <!-- Desktop sidebar -->
    <div class="hidden lg:block shrink-0">
      <AppSidebar
        :collapsed="collapsed"
        :theme-vm="themeVm"
        @toggle-collapse="toggleCollapse"
      />
    </div>

    <div class="flex-1 min-w-0 flex flex-col">
      <AppTopbar :theme-vm="themeVm" @open-menu="openMenu" />
      <main
        class="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6"
        aria-live="off"
      >
        <RouterView />
      </main>
      <footer class="border-t border-slate-200 dark:border-slate-800 py-3.5 text-center text-[11px] text-slate-500 dark:text-slate-400 px-4">
        AISIX-9R routing console — same-origin Admin API at <span class="font-mono">/admin/v1</span>
      </footer>
    </div>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <div
        v-if="drawerOpen"
        class="fixed inset-0 z-40 lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div
          class="absolute inset-0 bg-black/50"
          aria-hidden="true"
          @click="closeMenu"
        ></div>
        <div class="absolute left-0 top-0 bottom-0 w-64 max-w-[80vw] shadow-xl">
          <AppSidebar
            :collapsed="false"
            :theme-vm="themeVm"
            @toggle-collapse="closeMenu"
          />
          <button
            type="button"
            class="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-md focus-visible:outline-2 focus-visible:outline-amber-400"
            aria-label="Close menu"
            @click="closeMenu"
          >
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7">
              <path d="M5 5l10 10M15 5L5 15" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>
