import type { ApiResult, ErrorResponse } from '../types';
import { ApiResult as ApiResultFactory } from '../types';

export type HttpResponse<T> = {
  status: number;
  data: T;
  headers: Headers;
};

export class HttpError extends Error {
  readonly status: number;
  readonly errorBody: unknown;

  constructor(status: number, errorBody: unknown) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.errorBody = errorBody;
  }
}

export type HttpRequestOptions = {
  headers?: Record<string, string>;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  signal?: AbortSignal;
  responseType?: 'json' | 'text';
};

export interface HttpClient {
  get<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  getText(path: string, options?: HttpRequestOptions): Promise<HttpResponse<string>>;
  post<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  put<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  delete<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}

/** Fetch-backed HTTP client. The header provider is evaluated for every request. */
export class FetchHttpClient implements HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getHeaders: () => Record<string, string> = () => ({}),
  ) {}

  get<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  getText(path: string, options?: HttpRequestOptions): Promise<HttpResponse<string>> {
    return this.request<string>('GET', path, {
      ...options,
      headers: {
        Accept: 'text/plain',
        ...options?.headers,
      },
      responseType: 'text',
    });
  }

  post<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('POST', path, options);
  }

  put<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('PUT', path, options);
  }

  delete<T>(path: string, options?: HttpRequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }

  private async request<T>(
    method: string,
    path: string,
    options?: HttpRequestOptions,
  ): Promise<HttpResponse<T>> {
    const url = new URL(path, this.baseUrl);
    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.getHeaders(),
          ...options?.headers,
        },
        body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: options?.signal,
      });
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }

    let data: T;
    if (options?.responseType === 'text') {
      data = (await response.text().catch(() => '')) as unknown as T;
    } else {
      data = (await response.json().catch(() => null)) as T;
    }
    if (!response.ok) {
      throw new HttpError(response.status, data);
    }
    return { status: response.status, data, headers: response.headers };
  }
}

export async function safeRequest<T, E>(
  request: () => Promise<HttpResponse<T>>,
): Promise<ApiResult<T, E>> {
  try {
    const response = await request();
    return ApiResultFactory.Success(response.data);
  } catch (error) {
    if (error instanceof HttpError) {
      return ApiResultFactory.HttpError(error.status, error.errorBody as E | null);
    }
    const exception = error instanceof Error ? error : new Error(String(error));
    return ApiResultFactory.GenericError(exception);
  }
}

export type { ErrorResponse };
