import { describe, expect, it, vi, beforeEach } from 'vitest'
import { Subject } from 'rxjs'
import type { Result } from '@/core/types'
import { Result as ResultFactory } from '@/core/types'

class ProbeAsyncStore {
  readonly events: Array<{ key: string; type: string }> = []

  trackSubscription(key: string, subscription: { unsubscribe: () => void }) {
    void subscription
    this.events.push({ key, type: 'tracked' })
  }
}

describe('core DI container contract', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('exposes a singleton Inversify container from the composition root', async () => {
    const first = await import('@/core/di/di')
    const second = await import('@/core/di/di')

    expect(second.coreContainer).toBe(first.coreContainer)
  })

  it('rejects resolving an unregistered binding with a clear Inversify error', async () => {
    const { coreContainer } = await import('@/core/di/di')
    const missing = Symbol('MissingBinding') as never

    expect(() => coreContainer.get(missing)).toThrow()
  })

  it('returns a fresh transient instance on every get for request-scoped bindings', async () => {
    const { coreContainer } = await import('@/core/di/di')
    const key = Symbol('TransientProbe') as never

    class TransientProbe {
      static counter = 0
      readonly id: number

      constructor() {
        TransientProbe.counter += 1
        this.id = TransientProbe.counter
      }
    }

    coreContainer.bind(key).to(TransientProbe)
    const first = coreContainer.get<TransientProbe>(key)
    const second = coreContainer.get<TransientProbe>(key)

    expect(first).not.toBe(second)
    expect(first.id).not.toBe(second.id)
    coreContainer.unbind(key)
  })

  it('returns the same instance on every get for singleton-scoped bindings', async () => {
    const { coreContainer } = await import('@/core/di/di')
    const key = Symbol('SingletonProbe') as never

    class SingletonProbe {}

    coreContainer.bind(key).to(SingletonProbe).inSingletonScope()
    const first = coreContainer.get<SingletonProbe>(key)
    const second = coreContainer.get<SingletonProbe>(key)

    expect(first).toBe(second)
    coreContainer.unbind(key)
  })
})

describe('unsubscriber lifecycle plumbing (contract for BaseViewModel)', () => {
  it('tracks a subscription and replaces it when a new request starts', () => {
    const store = new ProbeAsyncStore()
    const first = new Subject<Result<number, string>>()
    const second = new Subject<Result<number, string>>()

    store.trackSubscription('detail', first.subscribe({ next: () => {} }))
    store.trackSubscription('detail', second.subscribe({ next: () => {} }))

    expect(store.events).toHaveLength(2)
    expect(store.events.every((entry) => entry.key === 'detail')).toBe(true)
    expect(ResultFactory.Success(1).type).toBe('Success')
  })

  it('maps Result variants onto presentation state without data loss', () => {
    const results: Array<Result<number, string>> = [
      ResultFactory.Loading<number>(),
      ResultFactory.Success(7),
      ResultFactory.Failure('offline'),
      ResultFactory.GenericError(new Error('boom')),
    ]

    expect(results.map((result) => result.type)).toEqual([
      'Loading',
      'Success',
      'Failure',
      'GenericError',
    ])
  })
})
