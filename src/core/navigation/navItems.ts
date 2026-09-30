import type { RouteRecordRaw } from 'vue-router';

export interface NavItem {
  readonly key: string;
  readonly label: string;
  readonly path: string;
  readonly description: string;
  readonly group: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    key: 'dashboard',
    label: 'Metrics',
    path: '/',
    description: 'Live traffic, latency, and health for the gateway.',
    group: 'Observe',
  },
  {
    key: 'routing',
    label: 'Smart Routing',
    path: '/routing',
    description: 'Virtual models that fan requests across target models.',
    group: 'Routing',
  },
  {
    key: 'wizard',
    label: 'Provider Wizard',
    path: '/providers/new',
    description: 'Connect a provider, discover models, and import them.',
    group: 'Routing',
  },
  {
    key: 'providers',
    label: 'Providers',
    path: '/providers',
    description: 'Upstream credentials and API bases.',
    group: 'Configuration',
  },
  {
    key: 'models',
    label: 'Models',
    path: '/resources/models',
    description: 'Model resources exposed by the gateway.',
    group: 'Configuration',
  },
  {
    key: 'api-keys',
    label: 'API Keys',
    path: '/resources/api_keys',
    description: 'Client keys and the models each may call.',
    group: 'Configuration',
  },
  {
    key: 'resources',
    label: 'All Resources',
    path: '/resources',
    description: 'Every other resource managed by the gateway.',
    group: 'Configuration',
  },
] as const;

export const navRouteRecords: RouteRecordRaw[] = [];
