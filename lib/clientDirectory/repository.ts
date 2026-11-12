// FILE: lib/clientDirectory/repository.ts
// Repository boundary for the Client Management page. The UI only talks
// to `clientDirectoryRepository`. Today it is mock-backed; to go live,
// provide another ClientDirectoryRepository (HTTP) and swap the export —
// no UI changes. No backend endpoint is assumed or called here.
import type {
  ClientDirectoryPage, ClientDirectoryQuery,
  DirectoryClientDetail, DirectoryClientSummary, DirectoryPolicyRecord,
} from '@/types/clientDirectory'

/** Filter options for client directory list. */
interface ClientDirectoryFilterOptions {
  insurers: string[]
  vesselTypes: string[]
  classifications: string[]
  remarks: string[]
}
import { MOCK_DIRECTORY_CLIENTS, MOCK_DIRECTORY_RECORDS } from '@/lib/mock/clientDirectoryData'

export interface ClientDirectoryRepository {
  readonly source: 'mock' | 'live'
  list(query: ClientDirectoryQuery): Promise<ClientDirectoryPage>
  getById(id: string): Promise<DirectoryClientDetail | null>
  getFilterOptions(): Promise<ClientDirectoryFilterOptions>
}

const uniq = (xs: (string | null)[]) =>
  Array.from(new Set(xs.filter((x): x is string => !!x))).sort()

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase()

function recordMatchesFilters(r: DirectoryPolicyRecord, q: ClientDirectoryQuery) {
  return (!q.insurer || r.insurer === q.insurer)
    && (!q.vesselType || r.vesselType === q.vesselType)
    && (!q.classification || r.classification === q.classification)
    && (!q.remark || r.remark === q.remark)
}

function recordMatchesSearch(r: DirectoryPolicyRecord, needle: string) {
  return [r.policyNumber, r.vesselName, r.vesselType, r.insurer, r.classification, r.remark]
    .some((v) => norm(v).includes(needle))
}

class MockClientDirectoryRepository implements ClientDirectoryRepository {
  readonly source = 'mock' as const

  async list(q: ClientDirectoryQuery): Promise<ClientDirectoryPage> {
    const needle = norm(q.search).trim()
    const hasRecordFilter = !!(q.insurer || q.vesselType || q.classification || q.remark)

    let rows: DirectoryClientSummary[] = MOCK_DIRECTORY_CLIENTS.flatMap((c) => {
      const own = MOCK_DIRECTORY_RECORDS.filter((r) => r.clientId === c.id)
      const filtered = own.filter((r) => recordMatchesFilters(r, q))
      if (hasRecordFilter && filtered.length === 0) return []
      const nameHit = needle && norm(c.name).includes(needle)
      if (needle && !nameHit && !filtered.some((r) => recordMatchesSearch(r, needle))) return []
      const ends = filtered.map((r) => r.periodEnd).filter((d): d is string => !!d).sort()
      return [{
        ...c,
        recordCount: filtered.length,
        insurers: uniq(filtered.map((r) => r.insurer)),
        vesselNames: uniq(filtered.map((r) => r.vesselName)),
        latestPeriodEnd: ends.length ? ends[ends.length - 1] : null,
      }]
    })

    const dir = q.sortDir === 'desc' ? -1 : 1
    const key = q.sortBy ?? 'name'
    rows = rows.sort((a, b) => {
      const av = (a as any)[key] ?? '', bv = (b as any)[key] ?? ''
      return (av < bv ? -1 : av > bv ? 1 : 0) * dir
    })

    const start = (q.page - 1) * q.pageSize
    return { data: rows.slice(start, start + q.pageSize), total: rows.length }
  }

  async getById(id: string): Promise<DirectoryClientDetail | null> {
    const client = MOCK_DIRECTORY_CLIENTS.find((c) => c.id === id)
    if (!client) return null
    return { client, records: MOCK_DIRECTORY_RECORDS.filter((r) => r.clientId === id) }
  }

  async getFilterOptions(): Promise<ClientDirectoryFilterOptions> {
    const rs = MOCK_DIRECTORY_RECORDS
    return {
      insurers: uniq(rs.map((r) => r.insurer)),
      vesselTypes: uniq(rs.map((r) => r.vesselType)),
      classifications: uniq(rs.map((r) => r.classification)),
      remarks: uniq(rs.map((r) => r.remark)),
    }
  }
}

export const clientDirectoryRepository: ClientDirectoryRepository = new MockClientDirectoryRepository()
