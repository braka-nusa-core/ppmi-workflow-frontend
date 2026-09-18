// ─── API Error ───────────────────────────────────────────────────
// Normalized from the backend's GlobalException filter shape:
//   { success: false, error: { name, message, details? } }
// Confirmed shapes of `details` from actual backend source
// (src/common/exceptions/global.exception.ts):
//   - HttpException (BadRequestException, NotFoundException, etc.) → undefined
//   - ZodError (validation failures)                                → Array<{ field: string | string[] | undefined; message: string }>
//   - Prisma / generic Error                                        → undefined
// Backend does not guarantee a single shape, so `details` is `unknown`
// here — narrow it at the call site (e.g. `Array.isArray(details)`)
// rather than assuming the Zod shape everywhere.
export interface ApiError {
  status:  number
  name?:   string
  message: string
  details?: unknown
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

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