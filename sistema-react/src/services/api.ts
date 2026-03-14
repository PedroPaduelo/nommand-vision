const API_URL = import.meta.env.VITE_API_URL || '/api'

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nommand_access_token',
  REFRESH_TOKEN: 'nommand_refresh_token',
}

type ApiError = {
  error: {
    code: string
    message: string
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { code: 'UNKNOWN_ERROR', message: response.statusText }
    })) as ApiError

    if (response.status === 401 && !endpoint.includes('/auth/')) {
      try {
        await refreshAccessToken()
        return request<T>(endpoint, options)
      } catch {
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
    }

    throw new Error(error.error.message || 'Request failed')
  }

  return response.json()
}

let refreshPromise: Promise<void> | null = null

async function refreshAccessToken(): Promise<void> {
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = doRefresh()

  try {
    await refreshPromise
  } finally {
    refreshPromise = null
  }
}

async function doRefresh(): Promise<void> {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
    throw new Error('Failed to refresh token')
  }

  const data = await response.json() as {
    data: { accessToken: string; refreshToken: string }
  }

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken)
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken)
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
}

export { STORAGE_KEYS }
