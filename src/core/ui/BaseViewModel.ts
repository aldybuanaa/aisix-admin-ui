import { reactive, readonly } from 'vue'
import type { DeepReadonly } from 'vue'
import type { Observable, Subscription } from 'rxjs'
import type { AsyncListState, AsyncState, Result } from '../types'

export abstract class BaseViewModel<S extends object> {
  protected readonly _state: S
  readonly uiState: DeepReadonly<S>
  private readonly subscriptions = new Map<string, Subscription>()

  protected constructor(initialState: S) {
    this._state = reactive(structuredClone(initialState)) as S
    this.uiState = readonly(this._state) as DeepReadonly<S>
  }

  get currentState(): S {
    return this._state
  }

  protected updateState(updater: (state: S) => void): void {
    updater(this._state)
  }

  protected trackSubscription(key: string, subscription: Subscription): void {
    this.unsubscribe(key)
    this.subscriptions.set(key, subscription)
  }

  protected unsubscribe(key: string): void {
    this.subscriptions.get(key)?.unsubscribe()
    this.subscriptions.delete(key)
  }

  collectResult<T>(
    key: string,
    observable: Observable<Result<T, string>>,
    onState: (state: S, asyncState: AsyncState<T>) => void,
    options?: { onSuccess?: (data: T) => void },
  ): void {
    const subscription = observable.subscribe({
      next: (result) => {
        let asyncState: AsyncState<T>
        switch (result.type) {
          case 'Loading':
            asyncState = { type: 'Loading' }
            break
          case 'Success':
            asyncState = { type: 'Success', data: result.data }
            break
          case 'Failure':
            asyncState = { type: 'Error', message: result.error }
            break
          case 'GenericError':
            asyncState = { type: 'Error', message: result.error.message }
            break
        }

        this.updateState((state) => onState(state, asyncState))
        if (result.type === 'Success') options?.onSuccess?.(result.data)
      },
    })
    this.trackSubscription(key, subscription)
  }

  protected collectListResult<TSource, TItem>(
    key: string,
    observable: Observable<Result<TSource, string>>,
    mapSuccess: (source: TSource) => { data: TItem[]; totalRecords: number },
    onState: (state: S, asyncState: AsyncListState<TItem>) => void,
  ): void {
    const subscription = observable.subscribe({
      next: (result) => {
        let asyncState: AsyncListState<TItem>
        switch (result.type) {
          case 'Loading':
            asyncState = { type: 'Loading' }
            break
          case 'Success': {
            const mapped = mapSuccess(result.data)
            asyncState = {
              type: 'Success',
              data: mapped.data,
              totalRecords: mapped.totalRecords,
            }
            break
          }
          case 'Failure':
            asyncState = { type: 'Error', message: result.error }
            break
          case 'GenericError':
            asyncState = { type: 'Error', message: result.error.message }
            break
        }
        this.updateState((state) => onState(state, asyncState))
      },
    })
    this.trackSubscription(key, subscription)
  }

  dispose(): void {
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe()
    }
    this.subscriptions.clear()
  }
}
