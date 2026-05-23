'use client'

import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCallback, useRef } from 'react'

// ─── Filter Option ───────────────────────────────────────────────
export interface FilterOption {
  value: string
  label: string
}

// ─── Filter Definition ───────────────────────────────────────────
export interface FilterDef {
  key: string
  label: string
  type: 'select' | 'date' | 'daterange'
  options?: FilterOption[]
  placeholder?: string
}

// ─── Active Filters ──────────────────────────────────────────────
export type ActiveFilters = Record<string, string>

// ─── TableFilters Props ──────────────────────────────────────────
interface TableFiltersProps {
  // Search
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Filters
  filters?: FilterDef[]
  activeFilters?: ActiveFilters
  onFilterChange?: (key: string, value: string) => void
  onClearFilters?: () => void

  // Additional actions (export, etc)
  actions?: React.ReactNode

  className?: string
}

export function TableFilters({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  actions,
  className,
}: TableFiltersProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  const hasActiveFilters = Object.values(activeFilters).some(Boolean) || searchValue.length > 0

  const handleClear = useCallback(() => {
    onSearchChange?.('')
    onClearFilters?.()
  }, [onSearchChange, onClearFilters])

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 bg-[#f8f9fa] border-b border-[#e2e5e9]',
      className
    )}>
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex items-center min-w-[220px] max-w-[280px]">
          <Search
            size={14}
            className="absolute left-3 text-[#9aa3ad] pointer-events-none flex-shrink-0"
          />
          <input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              'form-input pl-8 h-8 text-xs',
              'bg-white border-[#e2e5e9]'
            )}
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 text-[#9aa3ad] hover:text-[#4d5966] transition-colors duration-75"
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Separator */}
      {filters.length > 0 && onSearchChange && (
        <div className="w-px h-5 bg-[#e2e5e9] flex-shrink-0" />
      )}

      {/* Filter inputs */}
      {filters.map((filter) => {
        if (filter.type === 'select') {
          return (
            <div key={filter.key} className="flex items-center gap-1.5">
              <label className="text-xs text-[#9aa3ad] whitespace-nowrap flex-shrink-0">
                {filter.label}
              </label>
              <select
                value={activeFilters[filter.key] ?? ''}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className={cn(
                  'h-8 px-2 pr-6 text-xs rounded border bg-white',
                  'transition-colors duration-100 cursor-pointer',
                  'appearance-none',
                  'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'10\' height=\'10\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%239aa3ad\' d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_6px_center]',
                  activeFilters[filter.key]
                    ? 'border-[#1e4a70] text-[#1e4a70] bg-[#e8f4fd]'
                    : 'border-[#e2e5e9] text-[#4d5966]'
                )}
              >
                <option value="">{filter.placeholder ?? `All`}</option>
                {filter.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )
        }

        if (filter.type === 'date' || filter.type === 'daterange') {
          return (
            <div key={filter.key} className="flex items-center gap-1.5">
              <label className="text-xs text-[#9aa3ad] whitespace-nowrap flex-shrink-0">
                {filter.label}
              </label>
              <input
                type="date"
                value={activeFilters[filter.key] ?? ''}
                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                className={cn(
                  'h-8 px-2 text-xs rounded border bg-white text-[#4d5966]',
                  'transition-colors duration-100 cursor-pointer',
                  activeFilters[filter.key]
                    ? 'border-[#1e4a70]'
                    : 'border-[#e2e5e9]'
                )}
              />
            </div>
          )
        }

        return null
      })}

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 text-xs text-[#9b2020] hover:text-[#7d1a1a] transition-colors duration-100 ml-1"
        >
          <X size={12} />
          Clear
        </button>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions slot */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}
