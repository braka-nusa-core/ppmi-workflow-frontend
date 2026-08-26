'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { DataTable } from '@/components/table/DataTable'
import { TableFilters, type FilterDef } from '@/components/table/TableFilters'
import { PageHeader } from '@/components/layout/PageHeader'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useDataTable } from '@/hooks/useDataTable'
import { useRole } from '@/hooks/useRole'
import { useModal } from '@/hooks/useModal'
import { buildPaymentColumns } from './PaymentTableColumns'
import { RecordPaymentModal } from './RecordPaymentModal'
import { fetchPaymentList, createPayment } from '@/lib/api/payment'
import type { PaymentListItem, PaymentStatus } from '@/types/payment'
import type { RecordPaymentFormData } from '@/lib/validations/payment'

// ─── Filter definitions ──────────────────────────────────────────
// Aligned with the latest Finance API Specification's documented
// Incoming Payment status flow: UNPAID → PARTIAL → PAID.
const PAYMENT_FILTERS: FilterDef[] = [
  {
    key: 'paymentStatus', label: 'Payment', type: 'select',
    options: [
      { value: 'UNPAID',  label: 'Unpaid'  },
      { value: 'PARTIAL', label: 'Partial' },
      { value: 'PAID',    label: 'Paid'    },
      { value: 'OVERDUE', label: 'Overdue' },
    ],
  },
]

export function PaymentListClient() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { canUpdatePayment } = useRole()
  const table = useDataTable({ defaultPageSize: 25 })
  const recordModal = useModal<PaymentListItem>()

  const paymentQueryParams = {
    page:          table.pagination.page,
    search:        table.debouncedSearch || undefined,
    paymentStatus: (table.activeFilters.paymentStatus as PaymentStatus | undefined) || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment-list', paymentQueryParams],
    queryFn:  () => fetchPaymentList(paymentQueryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination?.total ?? 0

  const columns = useMemo(() => buildPaymentColumns({
    onView:   (row) => router.push(`/dashboard/payment/${row.id}`),
    onRecord: (row) => recordModal.open(row),
    canUpdatePayment,
  }), [router, recordModal, canUpdatePayment])

  return (
    <>
      <PageHeader
        title="Incoming Payment"
        description="Payments received from clients against issued invoices"
        breadcrumbs={[{ label: 'Payment' }]}
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search payment no., invoice ref., insured…"
          filters={PAYMENT_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        {isError ? (
          <ErrorState
            message="Failed to load payments"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<PaymentListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(`/dashboard/payment/${row.id}`)}
            emptyMessage="No payments found"
            emptyDescription="Try adjusting your search or filter criteria"
          />
        )}
      </div>

      {/* Record payment — creates a new payment row against the linked invoice */}
      <RecordPaymentModal
        open={recordModal.isOpen}
        onClose={recordModal.close}
        payment={recordModal.data}
        onSuccess={(data: RecordPaymentFormData) => {
          if (!recordModal.data) return
          const target = recordModal.data
          createPayment({
            invoiceId:       target.invoiceId,
            paidDate:        data.paidDate,
            paidAmount:      data.paidAmount,
            paymentMethod:   data.paymentMethod,
            bankAccount:     data.bankAccount,
            referenceNumber: data.referenceNumber,
            notes:           data.notes,
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ['payment-list'] })
            recordModal.close()
          })
        }}
      />
    </>
  )
}
