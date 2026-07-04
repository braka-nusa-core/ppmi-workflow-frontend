import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { API_BASE_URL, API_TIMEOUT, LS_AUTH_KEY, LS_AUTH_USER_KEY } from '@/config/constants'
import type { ApiError } from '@/types/api'

// ─── Create Axios Instance ───────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
})

// ─── Request Interceptor — attach auth token ─────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LS_AUTH_KEY)
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — normalize errors ─────────────────────
//
// Backend (NestJS GlobalException filter) error shape:
//   { success: false, status_code: number, error: { name, message, errors? } }
//
// This differs from the originally-assumed flat { message, errors } shape,
// so we check both: nested `error.*` (current backend) first, falling back
// to top-level `message`/`errors` in case other endpoints ever return a
// flatter shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      status:  error.response?.status ?? 0,
      message: 'An unexpected error occurred',
      errors:  undefined,
    }

    if (error.response) {
      const data = error.response.data as {
        message?: string
        errors?: Record<string, string[]>
        error?: { name?: string; message?: string; errors?: unknown }
      }

      apiError.message =
        data?.error?.message ??
        data?.message ??
        error.message

      apiError.errors =
        (data?.error?.errors as Record<string, string[]> | undefined) ??
        data?.errors

      // 401 — clear both session keys and redirect to login.
      // Skip redirect if already on the login page to avoid redirect loops.
      if (error.response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem(LS_AUTH_KEY)
        localStorage.removeItem(LS_AUTH_USER_KEY)
        if (!window.location.pathname.startsWith('/auth/')) {
          window.location.href = '/auth/login'
        }
      }
    } else if (error.request) {
      apiError.message = 'Network error — unable to reach server'
    }

    return Promise.reject(apiError)
  }
)

// ─── Typed request helpers ───────────────────────────────────────
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config)
  return res.data
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, data, config)
  return res.data
}

export async function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.put<T>(url, data, config)
  return res.data
}

export async function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.patch<T>(url, data, config)
  return res.data
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.delete<T>(url, config)
  return res.data
}

export default apiClient