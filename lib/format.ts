import { format, formatDistanceToNow, isBefore, parseISO } from 'date-fns'
import { CURRENCIES, DATE_FORMAT, DATE_FORMAT_SHORT, DATETIME_FORMAT } from '@/config/constants'

type Currency = 'IDR' | 'USD'

// ─── Currency Formatters ─────────────────────────────────────────

/**
 * Format number as currency string
 * @example formatCurrency(1500000, 'IDR') → "Rp 1.500.000"
 * @example formatCurrency(1500.50, 'USD') → "$ 1,500.50"
 */
export function formatCurrency(
  amount: number,
  currency: Currency = 'IDR',
  options?: { compact?: boolean; showSymbol?: boolean }
): string {
  const config = CURRENCIES[currency]
  const { compact = false, showSymbol = true } = options ?? {}

  if (compact && amount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1)
    return showSymbol ? `${config.symbol} ${val}B` : `${val}B`
  }
  if (compact && amount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1)
    return showSymbol ? `${config.symbol} ${val}M` : `${val}M`
  }

  const formatted = amount.toLocaleString(config.locale, {
    minimumFractionDigits: currency === 'IDR' ? 0 : 2,
    maximumFractionDigits: currency === 'IDR' ? 0 : 2,
  })

  return showSymbol ? `${config.symbol} ${formatted}` : formatted
}

/**
 * Format as IDR shorthand
 * @example formatIDR(1500000) → "Rp 1.500.000"
 */
export function formatIDR(amount: number): string {
  return formatCurrency(amount, 'IDR')
}

/**
 * Format as USD shorthand
 */
export function formatUSD(amount: number): string {
  return formatCurrency(amount, 'USD')
}

// ─── Date Formatters ─────────────────────────────────────────────

/**
 * Format ISO date string → "15 Jan 2025"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), DATE_FORMAT)
  } catch {
    return dateStr
  }
}

/**
 * Format ISO date string → "15/01/2025"
 */
export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), DATE_FORMAT_SHORT)
  } catch {
    return dateStr
  }
}

/**
 * Format ISO datetime string → "15 Jan 2025 14:30"
 */
export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), DATETIME_FORMAT)
  } catch {
    return dateStr
  }
}

/**
 * Relative time → "3 days ago"
 */
export function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

/**
 * Check if a date is overdue (past today)
 */
export function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  try {
    return isBefore(parseISO(dateStr), new Date())
  } catch {
    return false
  }
}

/**
 * Days until due date (negative = overdue)
 */
export function daysUntilDue(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  try {
    const due = parseISO(dateStr)
    const now = new Date()
    const diffMs = due.getTime() - now.getTime()
    return Math.round(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return null
  }
}

// ─── Number Formatters ───────────────────────────────────────────

/**
 * Format number with thousand separators
 */
export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// ─── String Utilities ────────────────────────────────────────────

/**
 * Truncate string to max length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Format document number for display (ensure leading zeros consistent)
 */
export function formatDocNumber(docNumber: string): string {
  return docNumber
}
