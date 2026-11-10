// FILE: hooks/useClientDirectory.ts
import { useCallback } from 'react'
import { useQueries, useQuery, keepPreviousData } from '@tanstack/react-query'
import { fetchClients } from '@/lib/api/clients'
import { clientKeys } from '@/hooks/useClients'
import { fetchDirectoryClient, fetchVessel, fetchVesselPolicies } from '@/lib/api/clientDirectory'
import type { Client } from '@/types/client'
import type { ClientDirectoryQuery, DirectoryPolicyQuery } from '@/types/clientDirectory'

export const clientDirectoryKeys = {
  detail:   (id: string) => ['client-directory', 'client', id] as const,
  policies: (q: DirectoryPolicyQuery) => ['client-directory', 'policies', q] as const,
  vessel:   (id: string) => ['client-directory', 'vessel', id] as const,
}

const norm = (s: string | null | undefined) => (s ?? '').toLowerCase()

/**
 * GET /clients has no search/sort/pagination, so those run client-side
 * on the full list. Shares the ['clients'] cache with the quotation forms.
 */
export function useClientDirectory(q: ClientDirectoryQuery, enabled = true) {
  const select = useCallback((all: Client[]) => {
    const needle = norm(q.search).trim()
    let rows = needle
      ? all.filter((c) => [c.name, c.clientCode, c.contactPerson, c.email, c.phone, c.address]
          .some((v) => norm(v).includes(needle)))
      : [...all]
    if (q.sortBy) {
      const dir = q.sortDir === 'desc' ? -1 : 1
      const key = q.sortBy
      rows.sort((a, b) => {
        const av = norm(a[key]), bv = norm(b[key])
        return (av < bv ? -1 : av > bv ? 1 : 0) * dir
      })
    }
    const start = (q.page - 1) * q.pageSize
    return { data: rows.slice(start, start + q.pageSize), total: rows.length }
  }, [q.search, q.sortBy, q.sortDir, q.page, q.pageSize])

  return useQuery({ queryKey: clientKeys.all, queryFn: fetchClients, select, enabled })
}

export function useClientDirectoryDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: clientDirectoryKeys.detail(id),
    queryFn:  () => fetchDirectoryClient(id),
    enabled,
    retry: (count, err) => (err as { status?: number })?.status !== 404 && count < 2,
  })
}

export function useClientPolicies(q: DirectoryPolicyQuery, enabled = true) {
  return useQuery({
    queryKey: clientDirectoryKeys.policies(q),
    queryFn:  () => fetchVesselPolicies(q),
    enabled,
    placeholderData: keepPreviousData,
  })
}

/** Vessel master data (type/year/GT/class) for the vessels on the current page. */
export function useVesselDetails(vesselIds: string[], enabled = true) {
  return useQueries({
    queries: vesselIds.map((id) => ({
      queryKey: clientDirectoryKeys.vessel(id),
      queryFn:  () => fetchVessel(id),
      enabled,
      staleTime: 5 * 60_000,
    })),
  })
}
