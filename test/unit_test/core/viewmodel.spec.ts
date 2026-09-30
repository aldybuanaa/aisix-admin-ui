import { describe, expect, it, vi } from 'vitest'
import { Subject } from 'rxjs'
import { BaseViewModel } from '@/core/ui/BaseViewModel'
import type { Result, Paging } from '@/core/types'
import { Result as ResultFactory } from '@/core/types'
import { injectable } from 'inversify'
import 'reflect-metadata'

type TestState = {
  counter: number
  asyncAction: { type: string; message?: string }
}

@injectable()
class TestViewModel extends BaseViewModel<TestState> {
  constructor() {
    super({ counter: 0, asyncAction: { type: 'Idle' } })
  }

  increment() {
    this.updateState((draft) => {
      draft.counter += 1
    })
  }

  loadAction(observable: Subject<Result<string, string>>) {
    this.collectResult(
      'action',
      observable.asObservable(),
      (draft, asyncState) => {
        draft.asyncAction = asyncState as { type: string; message?: string }
      },
      {
        onSuccess: () => {
          this.updateState((draft) => {
            draft.counter = 99
          })
        },
      }
    )
  }

  loadListAction(observable: Subject<Result<Paging<string>, string>>) {
    this.collectListResult(
      'listAction',
      observable.asObservable(),
      (paging) => ({ data: paging.data, totalRecords: paging.meta.totalItems }),
      (draft, asyncState) => {
        draft.asyncAction = asyncState as { type: string; message?: string }
      }
    )
  }
}

describe('BaseViewModel', () => {
  it('exposes a readonly reactive state snapshot', () => {
    const vm = new TestViewModel()

    expect(vm.uiState.counter).toBe(0)
    expect(vm.currentState.counter).toBe(0)
  })

  it('mutates state sequentially through updateState', () => {
    const vm = new TestViewModel()

    vm.increment()
    vm.increment()

    expect(vm.uiState.counter).toBe(2)
  })

  it('maps Result.Success to AsyncState.Success using collectResult', () => {
    const vm = new TestViewModel()
    const subject = new Subject<Result<string, string>>()

    vm.loadAction(subject)

    subject.next(ResultFactory.Loading())
    expect(vm.uiState.asyncAction.type).toBe('Loading')

    subject.next(ResultFactory.Success('OK'))
    expect(vm.uiState.asyncAction.type).toBe('Success')
    expect(vm.uiState.counter).toBe(99) // Validates onSuccess callback
  })

  it('maps Result.Failure to AsyncState.Error using collectResult', () => {
    const vm = new TestViewModel()
    const subject = new Subject<Result<string, string>>()

    vm.loadAction(subject)

    subject.next(ResultFactory.Failure('Not found'))
    expect(vm.uiState.asyncAction.type).toBe('Error')
    expect(vm.uiState.asyncAction.message).toBe('Not found')
  })

  it('disposes all active subscriptions when destroyed', () => {
    const vm = new TestViewModel()
    const abortMock = vi.fn()
    const observable = new Subject<Result<string, string>>().asObservable()
    const originalSubscribe = observable.subscribe.bind(observable)
    vi.spyOn(observable, 'subscribe').mockImplementation((...args: Parameters<typeof originalSubscribe>) => {
      const sub = originalSubscribe(...args)
      sub.add(abortMock)
      return sub
    })

    vm.collectResult('action', observable, () => {})

    vm.dispose()

    expect(abortMock).toHaveBeenCalled()
  })
})
