import { describe, expect, it } from 'vitest'
import type { Paging } from '@/core/types'
import { AsyncListState, AsyncState, Result } from '@/core/types'

describe('Result', () => {
  it('builds a discriminated Loading result', () => {
    const result = Result.Loading<number>()

    expect(result.type).toBe('Loading')
    // TypeScript 6 requires narrowing before accessing .data
    if (result.type === 'Loading') {
      expect(result.data).toBeUndefined()
    }
  })

  it('builds a discriminated Success result with its payload', () => {
    const result = Result.Success({ id: 'p-1' })

    expect(result.type).toBe('Success')
    if (result.type === 'Success') {
      expect(result.data).toEqual({ id: 'p-1' })
    }
  })

  it('builds a Failure result carrying the domain error', () => {
    const result = Result.Failure('Base URL is not reachable')

    expect(result.type).toBe('Failure')
    if (result.type === 'Failure') {
      expect(result.error).toBe('Base URL is not reachable')
    }
  })

  it('builds a GenericError result from a thrown Error', () => {
    const cause = new Error('socket hang up')
    const result = Result.GenericError<number>(cause)

    expect(result.type).toBe('GenericError')
    if (result.type === 'GenericError') {
      expect(result.error).toBe(cause)
    }
  })
})

describe('AsyncState', () => {
  it('starts Idle with no payload', () => {
    expect(AsyncState.idle()).toEqual({ type: 'Idle' })
  })

  it('carries the message when it fails', () => {
    expect(AsyncState.error('Connection refused')).toEqual({
      type: 'Error',
      message: 'Connection refused',
    })
  })

  it('carries data and total records for lists', () => {
    const state = AsyncListState.success([{ id: 'p-1' }], 42)

    expect(state).toEqual({ type: 'Success', data: [{ id: 'p-1' }], totalRecords: 42 })
  })
})

describe('Paging', () => {
  it('exposes the page metadata contract used by repositories', () => {
    const paging: Paging<{ id: string }> = {
      data: [{ id: 'p-1' }],
      meta: { itemsPerPage: 10, totalItems: 1, currentPage: 1, totalPages: 1 },
      links: { current: '?page=1', next: null, previous: null, last: '?page=1' },
    }

    expect(paging.meta.totalItems).toBe(1)
    expect(paging.links.next).toBeNull()
  })
})
