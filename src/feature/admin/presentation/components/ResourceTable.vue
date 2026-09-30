<script setup lang="ts">
import type { AdminResource, AdminColumn } from '../../domain/entities/AdminResource';

defineProps<{
  items: readonly AdminResource[];
  columns: readonly AdminColumn[];
  visibleKeys: readonly string[];
  writable: boolean;
  deletingId: string | null;
}>();

const emit = defineEmits<{
  (e: 'edit', item: AdminResource): void;
  (e: 'delete', id: string): void;
}>();

function formatCell(item: AdminResource, key: string): string {
  const val = (item as unknown as Record<string, unknown>)[key];
  if (val === null || val === undefined) return '-';
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  if (Array.isArray(val)) return val.length > 0 ? val.join(', ') : '[]';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
    <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left text-sm">
      <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
        <tr>
          <th scope="col" class="px-4 py-3 font-semibold">ID</th>
          <template v-for="col in columns" :key="col.key">
            <th
              v-if="visibleKeys.includes(col.key)"
              scope="col"
              class="px-4 py-3 font-semibold"
            >
              {{ col.key }}
            </th>
          </template>
          <th scope="col" class="px-4 py-3 text-right font-semibold">Aksi</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
        <tr
          v-for="item in items"
          :key="item.id"
          class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
        >
          <td class="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400 font-semibold">
            {{ item.id }}
          </td>
          <template v-for="col in columns" :key="col.key">
            <td
              v-if="visibleKeys.includes(col.key)"
              class="px-4 py-3 text-slate-800 dark:text-slate-200 text-xs max-w-xs truncate"
            >
              {{ formatCell(item, col.key) }}
            </td>
          </template>
          <td class="px-4 py-3 text-right space-x-2 whitespace-nowrap">
            <button
              v-if="writable"
              type="button"
              class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              @click="emit('edit', item)"
            >
              Edit
            </button>
            <button
              v-if="writable"
              type="button"
              :disabled="deletingId === item.id"
              class="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
              @click="emit('delete', item.id)"
            >
              {{ deletingId === item.id ? 'Menghapus...' : 'Hapus' }}
            </button>
            <span v-if="!writable" class="text-xs text-slate-400 italic">Read-only</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
