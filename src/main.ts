import 'reflect-metadata';
import { createApp } from 'vue';
import { router } from '@/core/routes/router';
import AppShell from '@/core/presentation/components/AppShell.vue';
import './style.css';

createApp(AppShell).use(router).mount('#app');
