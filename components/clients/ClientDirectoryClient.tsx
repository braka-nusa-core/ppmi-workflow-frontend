// FILE: components/clients/ClientDirectoryClient.tsx
'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable, type ColumnDef } from '@/components/table/DataTable'
import { TableFilters } from '@/components/table/TableFilters'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { PageSpinner } from '@/components/ui/Spinner'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useDataTable } from '@/hooks/useDataTable'
import { useClientDirectory } from '@/hooks/useClientDirectory'
import { UseExistingClientButton } from './UseExistingClientButton'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/config/routes'
import type { Client } from '@/types/client'
import type { ClientDirectoryQuery } from '@/types/clientDirectory'

const SORT_KEYS = ['name', 'clientCode', 'createdAt'] as const
const dash = (v: string | null) => (v ? v : '—')

export function ClientDirectoryClient() {
  const router = useRouter()
  const { can, isLoading: authLoading } = useAuth()
  const allowed = can('client', 'read')
  const table = useDataTable({ defaultPageSize: 25 })

  const query: ClientDirectoryQuery = {
    page: table.pagination.page,
    pageSize: table.pagination.pageSize,
    search: table.debouncedSearch || undefined,
    sortBy: SORT_KEYS.find((k) => k === table.sort?.key),
    sortDir: table.sort?.direction,
  }
  const { data: result, isLoading, isError, refetch } = useClientDirectory(query, allowed)

  const columns = useMemo<ColumnDef<Client>[]>(() => [
    { key: 'clientCode', header: 'Client Code', sortable: true, width: 170,
      render: (r) => <span className="text-xs font-medium text-[#4d5966]">{r.clientCode}</span> },
    { key: 'name', header: 'Client / Company', sortable: true, minWidth: 220,
      render: (r) => <span className="text-[13px] font-medium text-[#232b34] break-words">{r.name}</span> },
    { key: 'contactPerson', header: 'Contact Person', minWidth: 120,
      render: (r) => <span className="text-xs text-[#4d5966]">{dash(r.contactPerson)}</span> },
    { key: 'phone', header: 'Phone', minWidth: 110,
      render: (r) => <span className="text-xs text-[#4d5966]">{dash(r.phone)}</span> },
    { key: 'email', header: 'Email', minWidth: 140,
      render: (r) => <span className="text-xs text-[#4d5966] break-all">{dash(r.email)}</span> },
    { key: 'createdAt', header: 'Created', sortable: true, width: 120,
      render: (r) => <span className="text-xs text-[#4d5966]">{formatDate(r.createdAt)}</span> },
    { key: 'actions', header: '', align: 'right', width: 250,
      render: (r) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(ROUTES.clients.detail(r.id)) }}>View</Button>
          <UseExistingClientButton client={r} />
        </div>
      ),
    },
  ], [router])

  if (authLoading) return <PageSpinner label="Loading…" />
  if (!allowed) {
    return <ErrorState message="Access denied" description="You need the client:read permission to view Client Management." />
  }

  return (
    <>
      <PageHeader
        title="Client Management"
        description="Existing clients with their insured vessels and policy records"
        breadcrumbs={[{ label: 'Client Management' }]}
        actions={<DataSourceBadge source="live" />}
      />
      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search name, code, contact…"
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
          className="flex-wrap"
        />
        {isError ? (
          <ErrorState message="Failed to load clients" description="Please try again." onRetry={() => refetch()} />
        ) : (
          <DataTable<Client>
            columns={columns}
            data={result?.data ?? []}
            rowKey={(r) => r.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(result?.total ?? 0)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowClick={(r) => router.push(ROUTES.clients.detail(r.id))}
            emptyMessage="No clients found"
            emptyDescription="Try adjusting your search"
          />
        )}
      </div>
    </>
  )
}
