'use client'

import { useCallback } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/feedback/EmptyState'

// ─── Column Definition ───────────────────────────────────────────
export interface ColumnDef<T> {
  key: string
  header: string
  width?: string | number
  minWidth?: string | number
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  sticky?: 'left' | 'right'
  className?: string
  headerClassName?: string
  render: (row: T, index: number) => React.ReactNode
}

// ─── Sort State ──────────────────────────────────────────────────
export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

// ─── Pagination State ────────────────────────────────────────────
export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

// ─── DataTable Props ─────────────────────────────────────────────
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  rowKey: (row: T) => string | number
  loading?: boolean
  compact?: boolean

  // Sorting
  sort?: SortState
  onSortChange?: (sort: SortState) => void

  // Pagination
  pagination?: PaginationState
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void

  // Row interaction
  onRowClick?: (row: T) => void
  onRowDoubleClick?: (row: T) => void
  selectedRows?: Set<string | number>

  // State
  emptyMessage?: string
  emptyDescription?: string

  className?: string
}

const PAGE_SIZE_OPTIONS = [25, 50, 100]

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  compact = false,
  sort,
  onSortChange,
  pagination,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onRowDoubleClick,
  selectedRows,
  emptyMessage = 'No records found',
  emptyDescription,
  className,
}: DataTableProps<T>) {

  // ── Sort handler ───────────────────────────────────────────────
  const handleSort = useCallback((key: string) => {
    if (!onSortChange) return
    if (sort?.key === key) {
      onSortChange({
        key,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      })
    } else {
      onSortChange({ key, direction: 'asc' })
    }
  }, [sort, onSortChange])

  // ── Sort icon ──────────────────────────────────────────────────
  function SortIcon({ columnKey }: { columnKey: string }) {
    if (!sort || sort.key !== columnKey) {
      return <ChevronsUpDown size={12} className="text-[#ced3d9]" />
    }
    return sort.direction === 'asc'
      ? <ChevronUp size={12} className="text-[#1e4a70]" />
      : <ChevronDown size={12} className="text-[#1e4a70]" />
  }

  // ── Pagination ─────────────────────────────────────────────────
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1
  const currentPage = pagination?.page ?? 1
  const pageStart = pagination ? (currentPage - 1) * pagination.pageSize + 1 : 1
  const pageEnd = pagination ? Math.min(currentPage * pagination.pageSize, pagination.total) : data.length

  return (
    <div className={cn('data-table-wrapper', className)}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className={cn('data-table', compact && 'compact')}>
          {/* Head */}
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    col.sortable && 'sortable',
                    sort?.key === col.key && 'sort-active',
                    col.sticky && `sticky-col sticky-col-${col.sticky}`,
                    col.headerClassName
                  )}
                  style={{
                    width: col.width,
                    minWidth: col.minWidth,
                    textAlign: col.align ?? 'left',
                  }}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && <SortIcon columnKey={col.key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              // Loading skeleton rows
              Array.from({ length: compact ? 8 : 6 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      <div className={cn(
                        'skeleton h-3 rounded',
                        col.align === 'right' ? 'ml-auto' : '',
                        col.align === 'center' ? 'mx-auto' : ''
                      )}
                        style={{ width: typeof col.width === 'number' ? col.width - 32 : '70%' }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0 border-none">
                  <EmptyState message={emptyMessage} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const key = rowKey(row)
                const isSelected = selectedRows?.has(key)
                return (
                  <tr
                    key={key}
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      isSelected && 'bg-[#e8f4fd]'
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onDoubleClick={onRowDoubleClick ? () => onRowDoubleClick(row) : undefined}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          col.sticky && `sticky-col sticky-col-${col.sticky}`,
                          col.className,
                          col.key === 'actions' && 'col-actions'
                        )}
                        style={{ textAlign: col.align ?? 'left' }}
                      >
                        {col.render(row, rowIdx)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && !loading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#e2e5e9] bg-[#f8f9fa]">
          {/* Left: Row count info */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#9aa3ad]">
              Showing{' '}
              <span className="font-medium text-[#4d5966]">{pageStart}–{pageEnd}</span>
              {' '}of{' '}
              <span className="font-medium text-[#4d5966]">{pagination.total}</span>
              {' '}records
            </span>

            {/* Page size selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#9aa3ad]">Show</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="h-6 px-1.5 text-xs border border-[#e2e5e9] rounded bg-white text-[#4d5966] cursor-pointer"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <span className="text-xs text-[#9aa3ad]">per page</span>
            </div>
          </div>

          {/* Right: Page navigation */}
          <div className="flex items-center gap-1">
            <PaginationButton
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
              title="First page"
            >
              <ChevronsLeft size={13} />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              title="Previous page"
            >
              <ChevronLeft size={13} />
            </PaginationButton>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-1">
              {generatePageNumbers(currentPage, totalPages).map((page, i) =>
                page === '...' ? (
                  <span key={i} className="w-7 text-center text-xs text-[#9aa3ad]">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page as number)}
                    className={cn(
                      'w-7 h-7 rounded text-xs font-medium transition-colors duration-100',
                      currentPage === page
                        ? 'bg-[#1e4a70] text-white'
                        : 'text-[#4d5966] hover:bg-[#f1f3f5]'
                    )}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <PaginationButton
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              title="Next page"
            >
              <ChevronRight size={13} />
            </PaginationButton>
            <PaginationButton
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage === totalPages}
              title="Last page"
            >
              <ChevronsRight size={13} />
            </PaginationButton>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Pagination Button ───────────────────────────────────────────
function PaginationButton({
  children,
  onClick,
  disabled,
  title,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex items-center justify-center w-7 h-7 rounded',
        'text-[#4d5966] transition-colors duration-100',
        'hover:bg-[#f1f3f5] hover:text-[#232b34]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent'
      )}
    >
      {children}
    </button>
  )
}

// ─── Page number generation ──────────────────────────────────────
function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]

  return [1, '...', current - 1, current, current + 1, '...', total]
}
