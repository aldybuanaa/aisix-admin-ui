import { describe, expect, it } from 'vitest';
import {
  buildRoutingTargetsPayload,
  validateRouting,
  type RoutingFormTarget,
} from '@/feature/routing/domain/entities/SmartRouting';

function target(modelResourceId: string, weight?: number, priority?: number): RoutingFormTarget {
  return { modelResourceId, weight: weight ?? 1, priority: priority ?? 0 };
}

describe('validateRouting — form validation', () => {
  it('rejects an empty display name', () => {
    const r = validateRouting({ displayName: ' ', strategy: 'round_robin_weighted', targets: [target('a'), target('b')] });
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('Routing display name is required');
  });

  it('requires at least two targets', () => {
    const r = validateRouting({ displayName: 'mix', strategy: 'failover', targets: [target('a')] });
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('At least 2 target models are required');
  });

  it('rejects duplicate target model IDs', () => {
    const r = validateRouting({ displayName: 'mix', strategy: 'failover', targets: [target('a'), target('a')] });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('unique'))).toBe(true);
  });

  it('rejects non-positive target weights', () => {
    const r = validateRouting({ displayName: 'mix', strategy: 'round_robin_weighted', targets: [target('a', 0), target('b', 1)] });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('weight'))).toBe(true);
  });

  it('rejects invalid strategy values', () => {
    const r = validateRouting({ displayName: 'mix', strategy: 'random', targets: [target('a'), target('b')] });
    expect(r.ok).toBe(false);
  });

  it('accepts a valid multi-target form', () => {
    const r = validateRouting({ displayName: 'balanced', strategy: 'least_latency', targets: [target('a', 2, 1), target('b', 1, 2)] });
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
  });
});

describe('buildRoutingTargetsPayload — backend resource body', () => {
  it('builds the model payload with routing.targets', () => {
    const payload = buildRoutingTargetsPayload({
      displayName: 'balanced',
      strategy: 'round_robin_weighted',
      targets: [target('models:gpt-4o', 3, 1), target('models:gpt-4o-mini', 1, 2)],
    });
    expect(payload).toMatchObject({
      display_name: 'balanced',
    });
    expect(payload).not.toHaveProperty('provider');
    expect(payload).not.toHaveProperty('model_name');
    const routing = payload.routing as any;
    expect(routing.strategy).toBe('round_robin_weighted');
    expect(routing.targets).toHaveLength(2);
    expect(routing.targets[0]).toEqual({ model: 'models:gpt-4o', weight: 3, priority: 1 });
  });

  it('maps round_robin to round_robin_weighted', () => {
    const payload = buildRoutingTargetsPayload({
      displayName: 'rr',
      strategy: 'round_robin',
      targets: [target('a'), target('b')],
    });
    expect((payload.routing as any).strategy).toBe('round_robin_weighted');
  });
});
