// ─── Standard API Response Wrapper ──────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

// ─── Paginated Response ──────────────────────────────────────────
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ─── API Error ───────────────────────────────────────────────────
export interface ApiError {
  status: number
  message: string
  errors?: Record<string, string[]>
}

// ─── Query Params for list endpoints ─────────────────────────────
export interface ListQueryParams {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortDir?: 'asc' | 'desc'
  division?: string
  status?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: string | number | undefined
}
