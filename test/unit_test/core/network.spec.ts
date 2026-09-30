import { describe, expect, it, vi } from 'vitest'
import { firstValueFrom, lastValueFrom, toArray } from 'rxjs'
import { HttpError, type HttpResponse, safeRequest } from '@/core/network/HttpClient'
import { toResultObservable } from '@/core/network/resultObservable'
import type { ErrorResponse } from '@/core/types'

function okResponse<T>(data: T): HttpResponse<T> {
  return { status: 200, data, headers: new Headers() }
}

describe('safeRequest', () => {
  it('returns Success with the decoded body on a 2xx response', async () => {
    const result = await safeRequest<{ id: string }, ErrorResponse>(() =>
      Promise.resolve(okResponse({ id: 'provider-1' })),
    )

    expect(result.type).toBe('Success')
    if (result.type === 'Success') {
      expect(result.body.id).toBe('provider-1')
    }
  })

  it('returns HttpError carrying the status and the server error body', async () => {
    const errorBody: ErrorResponse = { message: 'Invalid API key', errors: null }

    const result = await safeRequest<unknown, ErrorResponse>(() =>
      Promise.reject(new HttpError(401, errorBody)),
    )

    expect(result.type).toBe('HttpError')
    if (result.type === 'HttpError') {
      expect(result.code).toBe(401)
      expect(result.errorBody?.message).toBe('Invalid API key')
    }
  })

  it('returns GenericError when the transport itself fails', async () => {
    const cause = new TypeError('Failed to fetch')

    const result = await safeRequest<unknown, ErrorResponse>(() => Promise.reject(cause))

    expect(result.type).toBe('GenericError')
    if (result.type === 'GenericError') {
      expect(result.exception).toBe(cause)
    }
  })

  it('wraps a non-Error rejection into a real Error', async () => {
    const result = await safeRequest<unknown, ErrorResponse>(() => Promise.reject('boom'))

    expect(result.type).toBe('GenericError')
    if (result.type === 'GenericError') {
      expect(result.exception).toBeInstanceOf(Error)
      expect(result.exception.message).toBe('boom')
    }
  })
})

describe('toResultObservable', () => {
  it('emits Loading first, then the mapped Success value', async () => {
    const emissions = await firstValueFrom(
      toResultObservable(
        Promise.resolve({ type: 'Success', body: { provider_id: 'provider-1' } }),
        (body) => body.provider_id,
        'Failed to load provider',
      ).pipe(toArray()),
    )

    expect(emissions.map((entry) => entry.type)).toEqual(['Loading', 'Success'])
    expect(emissions[1]).toEqual({ type: 'Success', data: 'provider-1' })
  })

  it('maps an HttpError to Failure using the server message', async () => {
    const result = await lastValueFrom(
      toResultObservable(
        Promise.resolve({
          type: 'HttpError' as const,
          code: 400,
          errorBody: { message: 'Base URL is not reachable', errors: null },
        }),
        (body: { provider_id: string }) => body.provider_id,
        'Failed to connect',
      ),
    )

    expect(result).toEqual({ type: 'Failure', error: 'Base URL is not reachable' })
  })

  it('falls back to the provided message when the server sends no body', async () => {
    const result = await lastValueFrom(
      toResultObservable(
        Promise.resolve({ type: 'HttpError' as const, code: 502, errorBody: null }),
        (body: { provider_id: string }) => body.provider_id,
        'Failed to connect',
      ),
    )

    expect(result).toEqual({ type: 'Failure', error: 'Failed to connect' })
  })

  it('maps a GenericError to GenericError and never swallows the exception', async () => {
    const cause = new Error('socket hang up')

    const result = await lastValueFrom(
      toResultObservable(
        Promise.resolve({ type: 'GenericError' as const, exception: cause }),
        (body: { provider_id: string }) => body.provider_id,
        'Failed to connect',
      ),
    )

    expect(result.type).toBe('GenericError')
    if (result.type === 'GenericError') {
      expect(result.error).toBe(cause)
    }
  })

  it('cancels the upstream request when the subscriber unsubscribes', async () => {
    const abort = vi.fn()
    const observable = toResultObservable(
      new Promise<never>(() => {}),
      (body: unknown) => body,
      'Failed to connect',
      abort,
    )

    const subscription = observable.subscribe()
    subscription.unsubscribe()

    expect(abort).toHaveBeenCalledTimes(1)
  })
})
