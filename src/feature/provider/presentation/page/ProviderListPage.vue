<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { coreContainer } from '@/core/di/di';
import { ProviderModuleKeys } from '../../di/ProviderModuleKeys';
import type { ProviderListViewModel } from '../../viewmodel/ProviderListViewModel';

const viewModel = coreContainer.get<ProviderListViewModel>(ProviderModuleKeys.ProviderListViewModel);
const state = viewModel.uiState;

onMounted(() => viewModel.load());
onUnmounted(() => viewModel.dispose());
</script>

<template>
  <!-- Draft without direction. ENERGY 1 / RHYTHM 1 / MOTION 1. -->
  <main>
    <h1>Daftar Provider</h1>

    <p v-if="state.status.type === 'Idle'">Daftar provider belum dimuat.</p>
    <p v-else-if="state.status.type === 'Loading'" role="status">Memuat daftar provider...</p>

    <section v-else-if="state.status.type === 'Error'" role="alert">
      <p>Daftar provider gagal dimuat: {{ state.status.message }}</p>
      <button type="button" @click="viewModel.load">Coba lagi</button>
    </section>

    <p v-else-if="state.providers.length === 0">Belum ada provider yang tersedia.</p>

    <ul v-else aria-label="Provider">
      <li v-for="provider in state.providers" :key="provider.id">
        <strong>{{ provider.name }}</strong>
        <span>{{ provider.baseUrl }}</span>
        <span>{{ provider.enabled ? 'Aktif' : 'Nonaktif' }}</span>
      </li>
    </ul>
  </main>
</template>
