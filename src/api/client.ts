const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5001').replace(
  /\/+$/,
  '',
)

/** Error thrown for any non-2xx response, carrying the backend's `{ message, details }`. */
export class ApiError extends Error {
  readonly status: number
  readonly details: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type QueryValue = string | number | undefined

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, QueryValue>
  signal?: AbortSignal
}

const NETWORK_ERROR_MESSAGE =
  "Can't reach the server. Check that the backend is running, then try again."

export async function request<T>(
  path: string,
  { method = 'GET', body, query, signal }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${API_URL}${path}`, window.location.origin)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }

  let response: Response
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch (error) {
    if (signal?.aborted) {
      throw error
    }
    throw new ApiError(0, NETWORK_ERROR_MESSAGE)
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    if (isErrorPayload(payload)) {
      throw new ApiError(response.status, payload.message, payload.details)
    }
    throw new ApiError(response.status, `Request failed with status ${response.status}.`)
  }

  return payload as T
}

function isErrorPayload(value: unknown): value is { message: string; details?: unknown } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  )
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'Something went wrong. Try again.'
}

/** Invalid id format (400) and unknown id (404) both mean "there is no such resource" to a user. */
export function isMissingResourceError(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.status === 400)
}

export function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500
}
