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
import { buildPolicyColumns } from './PolicyTableColumns'
import { fetchPolicyList } from '@/lib/api/policy'
import type { PolicyListItem } from '@/types/policy'
import { ROUTES } from '@/config/routes'

export function PolicyListClient() {
  const router = useRouter()
  const { canCreate, canEdit } = useRole()
  const table = useDataTable({ defaultPageSize: 25 })

  const policyQueryParams = {
    page:   table.pagination.page,
    search: table.debouncedSearch || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['policy-list', policyQueryParams],
    queryFn:  () => fetchPolicyList(policyQueryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination?.total ?? 0

  const columns = useMemo(() => buildPolicyColumns({
    onView: (row) => router.push(ROUTES.policy.detail(row.id)),
    onEdit: (row) => router.push(ROUTES.policy.edit(row.id)),
    canEdit,
  }), [canEdit, router])

  return (
    <>
      <PageHeader
        title="Policy Placement"
        description="Leader/member share placement for approved policies"
        breadcrumbs={[{ label: 'Policy Placement' }]}
        actions={
          canCreate && (
            <Button
              variant="primary" size="sm" icon={<Plus size={13} />}
              onClick={() => router.push(ROUTES.policy.new)}
            >
              New Policy
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
            message="Failed to load policies"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<PolicyListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(ROUTES.policy.detail(row.id))}
            emptyMessage="No policies found"
            emptyDescription="Try adjusting your search criteria"
          />
        )}
      </div>
    </>
  )
}