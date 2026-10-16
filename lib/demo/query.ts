// FILE: lib/demo/query.ts
// ═══════════════════════════════════════════════════════════════
// DEMO LIST/DETAIL HELPERS (client-side only — no network)
//
// Shared by the demo API facades in lib/demo/api/*. They reproduce the
// RUNTIME shape the real list fetchers return to the list screens:
//   { success, data, pagination: { page, pageSize, total, totalPages } }
// ═══════════════════════════════════════════════════════════════

export interface DemoListParams {
  page?:     number
  pageSize?: number
  search?:   string
  sortBy?:   string
  sortDir?:  'asc' | 'desc'
  [key: string]: unknown
}

export interface DemoPage<T> {
  success:    true
  data:       T[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

interface DemoListOptions<T> {
  /** Row fields matched (case-insensitive substring) by `params.search`. */
  searchFields: (keyof T)[]
  /** Query-param name → row field compared by equality when the param is set. */
  filters?:     Record<string, keyof T>
  pageSize?:    number
}

export function demoList<T extends object>(
  rows: T[],
  params: object | undefined,
  opts: DemoListOptions<T>
): DemoPage<T> {
  const p = (params ?? {}) as DemoListParams
  let result = [...rows]

  const term = typeof p.search === 'string' ? p.search.trim().toLowerCase() : ''
  if (term) {
    result = result.filter((row) =>
      opts.searchFields.some((f) => String(row[f] ?? '').toLowerCase().includes(term))
    )
  }

  for (const [param, field] of Object.entries(opts.filters ?? {})) {
    const wanted = p[param]
    if (wanted !== undefined && wanted !== null && wanted !== '') {
      result = result.filter((row) => String(row[field]) === String(wanted))
    }
  }

  if (p.sortBy && result.length > 0 && p.sortBy in result[0]) {
    const key = p.sortBy as keyof T
    const dir = p.sortDir === 'desc' ? -1 : 1
    result.sort((a, b) => {
      const av = a[key] as unknown
      const bv = b[key] as unknown
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av ?? '').localeCompare(String(bv ?? '')) * dir
    })
  }

  const pageSize   = p.pageSize ?? opts.pageSize ?? 25
  const total      = result.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const page       = Math.min(Math.max(1, p.page ?? 1), totalPages)

  return {
    success: true,
    data:    result.slice((page - 1) * pageSize, page * pageSize),
    pagination: { page, pageSize, total, totalPages },
  }
}

/** Looks a record up by id; throws a 404-shaped Error when it does not exist. */
export function demoFind<T extends { id: string }>(rows: T[], id: string, label: string): T {
  const found = rows.find((r) => r.id === id)
  if (!found) {
    throw Object.assign(new Error(`${label} ${id} not found in demo data`), {
      status: 404,
      name:   'DemoNotFoundError',
    })
  }
  return found
}