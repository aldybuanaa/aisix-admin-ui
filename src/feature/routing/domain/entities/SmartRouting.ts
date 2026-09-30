export type RoutingStrategy =
  | 'round_robin_weighted'
  | 'round_robin'
  | 'failover'
  | 'least_latency';

export const ROUTING_STRATEGIES: readonly RoutingStrategy[] = [
  'round_robin_weighted',
  'failover',
  'least_latency',
] as const;

export interface RoutingFormTarget {
  modelResourceId: string;
  weight: number;
  priority: number;
}

export interface RoutingFormInput {
  displayName: string;
  strategy: string;
  targets: RoutingFormTarget[];
}

export interface RoutingTargetPayload {
  model: string;
  weight: number;
  priority: number;
}

export interface RoutingPayload {
  display_name: string;
  routing: {
    strategy: Exclude<RoutingStrategy, 'round_robin'>;
    targets: RoutingTargetPayload[];
  };
  [key: string]: unknown;
}

export function validateRouting(input: RoutingFormInput): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!input.displayName.trim()) {
    errors.push('Routing display name is required');
  }

  const known = [...ROUTING_STRATEGIES, 'round_robin'];
  if (!known.includes(input.strategy)) {
    errors.push(`Unknown strategy "${input.strategy}"`);
  }

  if (input.targets.length < 2) {
    errors.push('At least 2 target models are required');
  }

  const seen = new Set<string>();
  for (const t of input.targets) {
    if (!t.modelResourceId.trim()) {
      errors.push('Every target must select a model');
      break;
    }
    if (seen.has(t.modelResourceId)) {
      errors.push('Target models must be unique');
      break;
    }
    seen.add(t.modelResourceId);

    if (!Number.isFinite(t.weight) || t.weight <= 0) {
      errors.push(`Target weight for "${t.modelResourceId}" must be a positive number`);
      break;
    }

    if (!Number.isFinite(t.priority) || t.priority < 0) {
      errors.push(`Priority for "${t.modelResourceId}" must be 0 or higher`);
      break;
    }
  }

  return { ok: errors.length === 0, errors };
}

export function buildRoutingTargetsPayload(args: {
  displayName: string;
  strategy: string;
  targets: RoutingFormTarget[];
}): RoutingPayload {
  const { displayName, strategy, targets } = args;
  const normalized = strategy === 'round_robin' ? 'round_robin_weighted' : strategy;

  return {
    display_name: displayName.trim(),
    routing: {
      strategy: normalized as Exclude<RoutingStrategy, 'round_robin'>,
      targets: targets.map((t) => ({
        model: t.modelResourceId.trim(),
        weight: t.weight,
        priority: t.priority,
      })),
    },
  };
}

export function parseRoutingTargets(raw: unknown): { strategy: RoutingStrategy; targets: RoutingFormTarget[] } {
  const fallback = { strategy: 'round_robin_weighted' as RoutingStrategy, targets: [] as RoutingFormTarget[] };
  if (typeof raw !== 'object' || raw === null) return fallback;
  const routing = (raw as Record<string, unknown>).routing;
  if (typeof routing !== 'object' || routing === null) return fallback;
  const rec = routing as Record<string, unknown>;
  const strategy = typeof rec.strategy === 'string' ? rec.strategy : 'round_robin_weighted';
  const rawTargets = Array.isArray(rec.targets) ? rec.targets : [];
  const valid: RoutingStrategy[] = ['round_robin_weighted', 'round_robin', 'failover', 'least_latency'];
  const targets: RoutingFormTarget[] = rawTargets
    .filter((t) => typeof t === 'object' && t !== null && typeof (t as Record<string, unknown>).model === 'string')
    .map((t) => {
      const r = t as Record<string, unknown>;
      return {
        modelResourceId: String(r.model),
        weight: typeof r.weight === 'number' && r.weight > 0 ? r.weight : 1,
        priority: typeof r.priority === 'number' && r.priority >= 0 ? r.priority : 0,
      };
    });
  return {
    strategy: (valid.includes(strategy as RoutingStrategy) ? strategy : 'round_robin_weighted') as RoutingStrategy,
    targets,
  };
}
