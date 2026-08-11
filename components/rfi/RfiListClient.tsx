'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/table/DataTable'
import { TableFilters } from '@/components/table/TableFilters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useDataTable } from '@/hooks/useDataTable'
import { useRole } from '@/hooks/useRole'
import { buildRfiColumns } from './RfiTableColumns'
import { fetchRfiList } from '@/lib/api/rfi'
import type { RfiListItem } from '@/types/rfi'
import { ROUTES } from '@/config/routes'

export function RfiListClient() {
  const router = useRouter()
  const { canCreate, canEdit } = useRole()
  const table = useDataTable({ defaultPageSize: 25 })

  const rfiQueryParams = {
    page:   table.pagination.page,
    search: table.debouncedSearch || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['rfi-list', rfiQueryParams],
    queryFn:  () => fetchRfiList(rfiQueryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination?.total ?? 0

  const columns = useMemo(() => buildRfiColumns({
    onView: (row) => router.push(ROUTES.rfi.detail(row.id)),
    onEdit: (row) => router.push(ROUTES.rfi.edit(row.id)),
    canEdit,
  }), [canEdit, router])

  return (
    <>
      <PageHeader
        title="Request For Invoice"
        description="Checklist-driven handover from Technical to Finance"
        breadcrumbs={[{ label: 'Request For Invoice' }]}
        actions={
          canCreate && (
            <Button
              variant="primary" size="sm" icon={<Plus size={13} />}
              onClick={() => router.push(ROUTES.rfi.new)}
            >
              New RFI
            </Button>
          )
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search policy number, insured…"
        />
        {isError ? (
          <ErrorState
            message="Failed to load RFIs"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<RfiListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(ROUTES.rfi.detail(row.id))}
            emptyMessage="No RFIs found"
            emptyDescription="Try adjusting your search criteria"
          />
        )}
      </div>
    </>
  )
}