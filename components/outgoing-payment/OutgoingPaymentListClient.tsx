'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { DataTable } from '@/components/table/DataTable'
import { TableFilters } from '@/components/table/TableFilters'
import type { FilterDef } from '@/components/table/TableFilters'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useDataTable } from '@/hooks/useDataTable'
import { useRole } from '@/hooks/useRole'
import { buildOutgoingPaymentColumns } from './OutgoingPaymentTableColumns'
import { fetchOutgoingPaymentList } from '@/lib/api/outgoingPayment'
import type { OutgoingPaymentListItem, OutgoingPaymentStatus } from '@/types/outgoingPayment'
import { ROUTES } from '@/config/routes'

const OUTGOING_PAYMENT_FILTERS: FilterDef[] = [
  {
    key: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'WAITING_PAYMENT', label: 'Waiting Payment' },
      { value: 'PARTIAL_PAYMENT', label: 'Partial Payment' },
      { value: 'FULLY_PAID',      label: 'Fully Paid'      },
    ],
  },
]

export function OutgoingPaymentListClient() {
  const router = useRouter()
  const { canCreate } = useRole()
  const table = useDataTable({ defaultPageSize: 25 })

  const queryParams = {
    page:   table.pagination.page,
    search: table.debouncedSearch || undefined,
    status: (table.activeFilters.status as OutgoingPaymentStatus | undefined) || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['outgoing-payment-list', queryParams],
    queryFn:  () => fetchOutgoingPaymentList(queryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination?.total ?? 0

  const columns = useMemo(() => buildOutgoingPaymentColumns({
    onView: (row) => router.push(ROUTES.outgoingPayment.detail(row.id)),
  }), [router])

  return (
    <>
      <PageHeader
        title="Outgoing Payment"
        description="Payments from PPMI to insurance companies, per placement share"
        breadcrumbs={[{ label: 'Outgoing Payment' }]}
        actions={
          canCreate && (
            <Button
              variant="primary" size="sm" icon={<Plus size={13} />}
              onClick={() => router.push(ROUTES.outgoingPayment.new)}
            >
              New Payment
            </Button>
          )
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search payment no., invoice ref., insured…"
          filters={OUTGOING_PAYMENT_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        {isError ? (
          <ErrorState
            message="Failed to load outgoing payments"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<OutgoingPaymentListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(ROUTES.outgoingPayment.detail(row.id))}
            emptyMessage="No outgoing payments found"
            emptyDescription="Try adjusting your search or filter criteria"
          />
        )}
      </div>
    </>
  )
}
