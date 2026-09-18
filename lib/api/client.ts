import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'
import { LS_AUTH_KEY, LS_AUTH_USER_KEY } from '@/config/constants'

// ─── Centralized Axios Instance ────────────────────────────────────
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─── Request Interceptor — attach auth token ──────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LS_AUTH_KEY)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — normalize errors ─────────────────────
//
// Backend (NestJS GlobalException filter) error shape, confirmed from
// src/common/exceptions/global.exception.ts:
//   { success: false, error: { name, message, details? } }
//
// `details` is only ever populated for Zod validation failures
// (an array of { field, message }); every other exception path
// (HttpException, Prisma, generic Error) omits it. We pass it through
// as-is rather than assuming a shape.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      status:  error.response?.status ?? 0,
      message: 'An unexpected error occurred',
      details: undefined,
    }

    if (error.response) {
      const data = error.response.data as {
        message?: string
        error?: { name?: string; message?: string; details?: unknown }
      }

      apiError.name    = data?.error?.name
      apiError.message = data?.error?.message ?? data?.message ?? error.message
      apiError.details = data?.error?.details

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

// ─── Generic request helpers ───────────────────────────────────────
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.get<T>(url, config)
  return res.data
}

export async function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await apiClient.post<T>(url, data, config)
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