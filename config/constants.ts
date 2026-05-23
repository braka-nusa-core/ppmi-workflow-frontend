// ─── App Info ────────────────────────────────────────────────────
export const APP_NAME    = 'PPMI Flow'
export const APP_VERSION = '0.1.0'
export const COMPANY     = 'PT Pandi Proteksi Marine Indonesia'

// ─── API ─────────────────────────────────────────────────────────
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'
export const API_TIMEOUT  = 30_000 // 30 seconds

// ─── Pagination ───────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 25
export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const

// ─── Divisions ───────────────────────────────────────────────────
export const DIVISIONS = {
  PI: { key: 'PI' as const, label: 'P&I', fullLabel: 'Protection & Indemnity' },
  HM: { key: 'HM' as const, label: 'H&M', fullLabel: 'Hull & Machinery' },
}

// ─── Currency ─────────────────────────────────────────────────────
export const CURRENCIES = {
  IDR: { code: 'IDR', symbol: 'Rp', locale: 'id-ID' },
  USD: { code: 'USD', symbol: '$',  locale: 'en-US' },
}

// ─── Date Formats ────────────────────────────────────────────────
export const DATE_FORMAT         = 'dd MMM yyyy'      // 15 Jan 2025
export const DATE_FORMAT_SHORT   = 'dd/MM/yyyy'       // 15/01/2025
export const DATE_FORMAT_API     = 'yyyy-MM-dd'       // 2025-01-15
export const DATETIME_FORMAT     = 'dd MMM yyyy HH:mm'// 15 Jan 2025 14:30

// ─── Local Storage Keys ──────────────────────────────────────────
export const LS_DIVISION_KEY = 'ppmi_active_division'
export const LS_AUTH_KEY     = 'ppmi_auth_token'
export const LS_TABLE_PREFS  = 'ppmi_table_prefs'

// ─── Query Stale Times ───────────────────────────────────────────
export const STALE_TIME_DEFAULT  = 60 * 1000        // 1 minute
export const STALE_TIME_SHORT    = 30 * 1000        // 30 seconds
export const STALE_TIME_LONG     = 5 * 60 * 1000   // 5 minutes
