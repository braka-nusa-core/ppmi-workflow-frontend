'use client'

import { useMemo, useState }     from 'react'
import { useRouter }             from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download }              from 'lucide-react'
import { DataTable }             from '@/components/table/DataTable'
import { TableFilters }          from '@/components/table/TableFilters'
import type { FilterDef }        from '@/components/table/TableFilters'
import { PageHeader }            from '@/components/layout/PageHeader'
import { Button }                from '@/components/ui/Button'
import { ConfirmModal }          from '@/components/modal/BaseModal'
import { ErrorState }            from '@/components/feedback/ErrorState'
import { useDataTable }          from '@/hooks/useDataTable'
import { useModal }              from '@/hooks/useModal'
import { useRole }               from '@/hooks/useRole'
import { buildPaymentColumns }   from './PaymentTableColumns'
import { RecordPaymentModal }    from './RecordPaymentModal'
import { fetchPaymentList, updatePayment, deletePayment } from '@/lib/api/payment'
import type { PaymentListItem, PaymentStatus } from '@/types/payment'

// ─── Filter definitions ──────────────────────────────────────────
// paymentStatus values aligned with backend enum (UNPAID | INSTALLMENT | PAID)
// OVERDUE shown as frontend-derived option — maps to UNPAID filter server-side
const PAYMENT_FILTERS: FilterDef[] = [
  {
    key: 'paymentStatus', label: 'Payment', type: 'select',
    options: [
      { value: 'UNPAID',      label: 'Unpaid'      },
      { value: 'INSTALLMENT', label: 'Installment' },
      { value: 'PAID',        label: 'Paid'        },
      { value: 'OVERDUE',     label: 'Overdue'     },
    ],
  },
  {
    key: 'verificationStatus', label: 'Verification', type: 'select',
    options: [
      { value: 'UNVERIFIED', label: 'Unverified' },
      { value: 'VERIFIED',   label: 'Verified'   },
      { value: 'FLAGGED',    label: 'Flagged'    },
    ],
  },
  {
    key: 'division', label: 'Division', type: 'select',
    options: [
      { value: 'PI', label: 'P&I' },
      { value: 'HM', label: 'H&M' },
    ],
  },
  {
    key: 'isInstallment', label: 'Type', type: 'select',
    options: [
      { value: 'false', label: 'Full Payment' },
      { value: 'true',  label: 'Installment'  },
    ],
  },
  { key: 'dueDate', label: 'Due by', type: 'date' },
]

export function PaymentListClient() {
  const router = useRouter()
  const qc     = useQueryClient()
  const { canUpdatePayment, canVerify, canCreate } = useRole()
  const table         = useDataTable({ defaultPageSize: 25 })
  const recordModal   = useModal<PaymentListItem>()
  const verifyModal   = useModal<PaymentListItem>()
  const flagModal     = useModal<PaymentListItem>()
  const shipmentModal = useModal<PaymentListItem>()

  const [isProcessing, setProcessing] = useState(false)
  const [actionError,  setActionError] = useState<string | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────
  const paymentQueryParams = {
    page:            table.pagination.page,
    pageSize:        table.pagination.pageSize,
    search:          table.debouncedSearch || undefined,
    sortBy:          table.sort?.key,
    sortDir:         table.sort?.direction,
    paymentStatus:   (table.activeFilters.paymentStatus as PaymentStatus | undefined) || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['payment-list', paymentQueryParams],
    queryFn:  () => fetchPaymentList(paymentQueryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination.total ?? 0

  // ── Shared invalidation ─────────────────────────────────────────
  const invalidateList = () => qc.invalidateQueries({ queryKey: ['payment-list'] })

  const run = async (action: () => Promise<void>, close: () => void) => {
    setProcessing(true)
    setActionError(null)
    try {
      await action()
      close()
      await invalidateList()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Action failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const columns = useMemo(() => buildPaymentColumns({
    onView:             (row) => router.push(`/dashboard/payment/${row.id}`),
    onRecord:           (row) => recordModal.open(row),
    onVerify:           (row) => verifyModal.open(row),
    onFlag:             (row) => flagModal.open(row),
    onGenerateShipment: (row) => shipmentModal.open(row),
    canUpdatePayment,
    canVerify,
    canCreate,
  }), [canUpdatePayment, canVerify, canCreate, router, recordModal, verifyModal, flagModal, shipmentModal])

  return (
    <>
      <PageHeader
        title="Payments"
        description="Payment tracking and finance verification across all divisions"
        breadcrumbs={[{ label: 'Payment' }]}
        actions={
          <Button variant="secondary" size="sm" icon={<Download size={13} />}>
            Export
          </Button>
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search payment no., voucher ref., insured…"
          filters={PAYMENT_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />

        {actionError && (
          <div className="mb-3 px-4 py-2 rounded bg-[#fdecea] border border-[#f0a0a0]">
            <p className="text-[12px] text-[#8c1f1f]">{actionError}</p>
          </div>
        )}

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

      {/* Record payment — wires to PATCH /payments/:id via RecordPaymentModal */}
      <RecordPaymentModal
        open={recordModal.isOpen}
        onClose={recordModal.close}
        payment={recordModal.data}
        isInstallment={false}
        onSuccess={async (pid, paidAmount, remainingAmount, paymentDate, remarks) => {
          await run(
            async () => {
              await updatePayment(pid, {
                paid_amount:      paidAmount,
                remaining_amount: remainingAmount,
                payment_date:     paymentDate,
                payment_status:   remainingAmount <= 0 ? 'PAID' : 'INSTALLMENT',
                ...(remarks ? { remarks } : {}),
              })
            },
            recordModal.close
          )
        }}
      />

      {/* Verify — NO backend endpoint; intentionally non-functional */}
      <ConfirmModal
        open={verifyModal.isOpen}
        onClose={verifyModal.close}
        onConfirm={() => {
          // INTENTIONALLY NON-FUNCTIONAL — no POST /payments/:id/verify endpoint.
          verifyModal.close()
        }}
        title="Verify Payment"
        description={`Mark ${verifyModal.data?.docNumber} as verified? (Note: verification has no backend effect yet.)`}
        confirmLabel="Verify Payment"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      {/* Flag — NO backend endpoint; intentionally non-functional */}
      <ConfirmModal
        open={flagModal.isOpen}
        onClose={flagModal.close}
        onConfirm={() => {
          // INTENTIONALLY NON-FUNCTIONAL — no POST /payments/:id/flag endpoint.
          flagModal.close()
        }}
        title="Flag Payment"
        description={`Flag ${flagModal.data?.docNumber} for review? (Note: flagging has no backend effect yet.)`}
        confirmLabel="Flag for Review"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      {/* Generate Shipment — navigates to shipment create (POST /shipments handles it) */}
      <ConfirmModal
        open={shipmentModal.isOpen}
        onClose={shipmentModal.close}
        onConfirm={() => {
          shipmentModal.close()
          if (shipmentModal.data) {
            router.push(`/dashboard/shipment/new?paymentId=${shipmentModal.data.id}`)
          }
        }}
        title="Generate Shipment"
        description={`Generate a shipment record from ${shipmentModal.data?.docNumber}? This advances the workflow to the final Shipment stage.`}
        confirmLabel="Generate Shipment"
        cancelLabel="Cancel"
        variant="primary"
      />
    </>
  )
}