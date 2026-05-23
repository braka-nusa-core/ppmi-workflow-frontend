import { get, post } from './client'
import type { ApiResponse } from '@/types/api'
import type { AuthSession, AuthUser, LoginCredentials, ChangePasswordPayload } from '@/types/auth'
import { LS_AUTH_KEY } from '@/config/constants'

const BASE = '/auth'

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const res = await post<ApiResponse<AuthSession>>(`${BASE}/login`, credentials)
  if (res.success && res.data.accessToken) {
    localStorage.setItem(LS_AUTH_KEY, res.data.accessToken)
  }
  return res.data
}

export async function logout(): Promise<void> {
  try {
    await post(`${BASE}/logout`)
  } finally {
    localStorage.removeItem(LS_AUTH_KEY)
  }
}

export async function getMe(): Promise<AuthUser> {
  const res = await get<ApiResponse<AuthUser>>(`${BASE}/me`)
  return res.data
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  await post(`${BASE}/change-password`, payload)
}

export async function refreshToken(): Promise<{ accessToken: string }> {
  const res = await post<ApiResponse<{ accessToken: string }>>(`${BASE}/refresh`)
  if (res.data.accessToken) {
    localStorage.setItem(LS_AUTH_KEY, res.data.accessToken)
  }
  return res.data
}
