import { useState, useCallback, useMemo } from 'react'
import { DEFAULT_PAGE_SIZE } from '@/config/constants'
import type { SortState, PaginationState } from '@/components/table/DataTable'
import type { ActiveFilters } from '@/components/table/TableFilters'
import type { ListQueryParams } from '@/types/api'
import { useDebounce } from './useDebounce'

interface UseDataTableOptions {
  defaultPageSize?: number
  defaultSort?:     SortState
}

interface UseDataTableReturn {
  // Search
  search:        string
  debouncedSearch: string
  setSearch:     (value: string) => void

  // Sort
  sort:          SortState | undefined
  onSortChange:  (sort: SortState) => void

  // Pagination
  pagination:    Omit<PaginationState, 'total'>
  onPageChange:  (page: number) => void
  onPageSizeChange: (size: number) => void
  setPaginationTotal: (total: number) => void
  fullPagination: (total: number) => PaginationState

  // Filters
  activeFilters: ActiveFilters
  onFilterChange: (key: string, value: string) => void
  onClearFilters: () => void

  // Computed query params for API
  queryParams:   ListQueryParams

  // Reset all
  resetTable:    () => void
}

export function useDataTable(options: UseDataTableOptions = {}): UseDataTableReturn {
  const { defaultPageSize = DEFAULT_PAGE_SIZE, defaultSort } = options

  const [search, setSearchRaw]   = useState('')
  const [sort, setSort]           = useState<SortState | undefined>(defaultSort)
  const [page, setPage]           = useState(1)
  const [pageSize, setPageSize]   = useState(defaultPageSize)
  const [filters, setFilters]     = useState<ActiveFilters>({})

  const debouncedSearch = useDebounce(search, 300)

  // Reset to page 1 on search or filter change
  const setSearch = useCallback((value: string) => {
    setSearchRaw(value)
    setPage(1)
  }, [])

  const onSortChange = useCallback((newSort: SortState) => {
    setSort(newSort)
    setPage(1)
  }, [])

  const onPageChange = useCallback((newPage: number) => {
    setPage(newPage)
    // Scroll table into view
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [])

  const onPageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize)
    setPage(1)
  }, [])

  const onFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  const onClearFilters = useCallback(() => {
    setFilters({})
    setSearchRaw('')
    setPage(1)
  }, [])

  const resetTable = useCallback(() => {
    setSearchRaw('')
    setSort(defaultSort)
    setPage(1)
    setPageSize(defaultPageSize)
    setFilters({})
  }, [defaultSort, defaultPageSize])

  // Computed pagination object (total comes from API response)
  const pagination = useMemo(() => ({ page, pageSize }), [page, pageSize])

  const fullPagination = useCallback(
    (total: number): PaginationState => ({ page, pageSize, total }),
    [page, pageSize]
  )

  // Dummy setter — pagination total comes from API, not local state
  const setPaginationTotal = useCallback((_total: number) => {
    // no-op: total is derived from API response in the calling component
  }, [])

  // Build query params for API calls
  const queryParams = useMemo<ListQueryParams>(() => ({
    page,
    pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(sort ? { sortBy: sort.key, sortDir: sort.direction } : {}),
    ...Object.fromEntries(
      Object.entries(filters).filter(([, v]) => Boolean(v))
    ),
  }), [page, pageSize, debouncedSearch, sort, filters])

  return {
    search,
    debouncedSearch,
    setSearch,
    sort,
    onSortChange,
    pagination,
    onPageChange,
    onPageSizeChange,
    setPaginationTotal,
    fullPagination,
    activeFilters:  filters,
    onFilterChange,
    onClearFilters,
    queryParams,
    resetTable,
  }
}
