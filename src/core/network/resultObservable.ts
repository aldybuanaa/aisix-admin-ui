import { Observable } from 'rxjs'
import type { ApiResult, Result } from '../types'
import { Result as ResultFactory } from '../types'

export function toResultObservable<TRaw, TDomain>(
  promise: Promise<ApiResult<TRaw, { message: string | null }>>,
  mapSuccess: (body: TRaw) => TDomain,
  fallbackError = 'An unexpected error occurred',
  abort?: () => void,
): Observable<Result<TDomain, string>> {
  return new Observable<Result<TDomain, string>>((subscriber) => {
    subscriber.next(ResultFactory.Loading<TDomain>())

    promise
      .then((result) => {
        if (subscriber.closed) return

        if (result.type === 'Success') {
          subscriber.next(ResultFactory.Success(mapSuccess(result.body)))
        } else if (result.type === 'HttpError') {
          subscriber.next(
            ResultFactory.Failure(result.errorBody?.message ?? fallbackError),
          )
        } else {
          subscriber.next(ResultFactory.GenericError(result.exception))
        }
        subscriber.complete()
      })
      .catch((error) => {
        if (!subscriber.closed) {
          subscriber.next(ResultFactory.GenericError(error))
          subscriber.complete()
        }
      })

    return () => {
      if (abort) abort()
    }
  })
}
