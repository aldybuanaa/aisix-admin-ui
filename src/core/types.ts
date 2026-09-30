export type Result<T, E> =
  | { type: 'Loading'; data?: T }
  | { type: 'Success'; data: T }
  | { type: 'Failure'; error: E }
  | { type: 'GenericError'; error: Error }

export const Result = {
  Loading<T>(data?: T): Result<T, never> {
    return { type: 'Loading', data }
  },
  Success<T>(data: T): Result<T, never> {
    return { type: 'Success', data }
  },
  Failure<E>(error: E): Result<never, E> {
    return { type: 'Failure', error }
  },
  GenericError<T>(error: Error): Result<T, never> {
    return { type: 'GenericError', error }
  },
}

export type ApiResult<T, E> =
  | { type: 'Success'; body: T }
  | { type: 'HttpError'; code: number; errorBody: E | null }
  | { type: 'GenericError'; exception: Error }

export const ApiResult = {
  Success<T>(body: T): ApiResult<T, never> {
    return { type: 'Success', body }
  },
  HttpError<E>(code: number, errorBody: E | null): ApiResult<never, E> {
    return { type: 'HttpError', code, errorBody }
  },
  GenericError<T>(exception: Error): ApiResult<T, never> {
    return { type: 'GenericError', exception }
  },
}

export type ErrorResponse = {
  message: string | null
  errors: Array<{ field?: string; message: string }> | null
}

export type AsyncState<T = void> =
  | { type: 'Idle' }
  | { type: 'Loading' }
  | { type: 'Success'; data: T }
  | { type: 'Error'; message: string }

export const AsyncState = {
  idle(): AsyncState<never> {
    return { type: 'Idle' }
  },
  loading(): AsyncState<never> {
    return { type: 'Loading' }
  },
  success<T>(data: T): AsyncState<T> {
    return { type: 'Success', data }
  },
  error(message: string): AsyncState<never> {
    return { type: 'Error', message }
  },
}

export type AsyncListState<T> =
  | { type: 'Idle' }
  | { type: 'Loading' }
  | { type: 'Success'; data: T[]; totalRecords: number }
  | { type: 'Error'; message: string }

export const AsyncListState = {
  idle<T>(): AsyncListState<T> {
    return { type: 'Idle' }
  },
  loading<T>(): AsyncListState<T> {
    return { type: 'Loading' }
  },
  success<T>(data: T[], totalRecords: number): AsyncListState<T> {
    return { type: 'Success', data, totalRecords }
  },
  error<T>(message: string): AsyncListState<T> {
    return { type: 'Error', message }
  },
}

export type Paging<T> = {
  data: T[]
  meta: {
    itemsPerPage: number
    totalItems: number
    currentPage: number
    totalPages: number
  }
  links: {
    current: string
    next: string | null
    previous: string | null
    last: string | null
  }
}

export type PagingResponse<T> = {
  data: T[]
  meta: {
    items_per_page: number
    total_items: number
    current_page: number
    total_pages: number
  }
  links: {
    current: string
    next: string | null
    previous: string | null
    last: string | null
  }
}

export function mapPagingToDomain<TRaw, TDomain>(
  response: PagingResponse<TRaw>,
  data: TDomain[],
): Paging<TDomain> {
  return {
    data,
    meta: {
      itemsPerPage: response.meta.items_per_page,
      totalItems: response.meta.total_items,
      currentPage: response.meta.current_page,
      totalPages: response.meta.total_pages,
    },
    links: { ...response.links },
  }
}
