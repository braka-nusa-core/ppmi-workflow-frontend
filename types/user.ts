import type { UserRole, Division } from './workflow'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  division?: Division
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password: string
  role: UserRole
  division?: Division
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  role?: UserRole
  division?: Division
  isActive?: boolean
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
