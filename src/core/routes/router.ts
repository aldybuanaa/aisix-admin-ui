import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/feature/metrics/presentation/page/MetricsDashboardPage.vue'),
    meta: { title: 'Metrics Dashboard' },
  },
  {
    path: '/routing',
    name: 'SmartRouting',
    component: () => import('@/feature/routing/presentation/page/SmartRoutingPage.vue'),
    meta: { title: 'Smart Routing' },
  },
  {
    path: '/routing/new',
    name: 'CreateSmartRouting',
    component: () => import('@/feature/routing/presentation/page/SmartRoutingEditPage.vue'),
    meta: { title: 'Create Routing Rule' },
  },
  {
    path: '/routing/:id/edit',
    name: 'EditSmartRouting',
    component: () => import('@/feature/routing/presentation/page/SmartRoutingEditPage.vue'),
    meta: { title: 'Edit Routing Rule' },
  },
  {
    path: '/providers/new',
    name: 'ProviderWizard',
    component: () => import('@/feature/wizard/presentation/page/ProviderWizardPage.vue'),
    meta: { title: 'Provider Setup Wizard' },
  },
  {
    path: '/providers',
    name: 'Providers',
    redirect: '/resources/provider_keys',
  },
  {
    path: '/discover',
    name: 'ModelDiscovery',
    component: () => import('@/feature/admin/presentation/page/ModelDiscoveryPage.vue'),
    meta: { title: 'Model Auto-Discovery' },
  },
  {
    path: '/resources',
    name: 'ResourcesRoot',
    redirect: '/resources/models',
  },
  {
    path: '/resources/:resourceKey',
    name: 'AdminResources',
    component: () => import('@/feature/admin/presentation/page/AdminResourceListPage.vue'),
    props: true,
    meta: { title: 'Resource Management' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
