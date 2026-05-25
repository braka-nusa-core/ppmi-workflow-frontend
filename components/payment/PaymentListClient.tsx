'use client'

import { useMemo }               from 'react'
import { useRouter }             from 'next/navigation'
import { Download }              from 'lucide-react'
import { DataTable }             from '@/components/table/DataTable'
import { TableFilters }          from '@/components/table/TableFilters'
import type { FilterDef }        from '@/components/table/TableFilters'
import { PageHeader }            from '@/components/layout/PageHeader'
import { Button }                from '@/components/ui/Button'
import { ConfirmModal }          from '@/components/modal/BaseModal'
import { useDataTable }          from '@/hooks/useDataTable'
import { useModal }              from '@/hooks/useModal'
import { useRole }               from '@/hooks/useRole'
import { buildPaymentColumns }   from './PaymentTableColumns'
import { RecordPaymentModal }    from './RecordPaymentModal'
import type { PaymentListItem }  from '@/types/payment'

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
  {
    key: 'verificationStatus', label: 'Verification', type: 'select',
    options: [
      { value: 'UNVERIFIED', label: 'Unverified' },
      { value: 'VERIFIED',   label: 'Verified'   },
      { value: 'FLAGGED',    label: 'Flagged'     },
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
      { value: 'false', label: 'Full Payment'  },
      { value: 'true',  label: 'Installment'   },
    ],
  },
  { key: 'dueDate', label: 'Due by', type: 'date' },
]

interface PaymentListClientProps {
  initialData:  PaymentListItem[]
  totalRecords: number
}

export function PaymentListClient({ initialData, totalRecords }: PaymentListClientProps) {
  const router = useRouter()
  const { canUpdatePayment, canVerify, canCreate } = useRole()
  const table          = useDataTable({ defaultPageSize: 25 })
  const recordModal    = useModal<PaymentListItem>()
  const verifyModal    = useModal<PaymentListItem>()
  const flagModal      = useModal<PaymentListItem>()
  const shipmentModal  = useModal<PaymentListItem>()

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
        <DataTable<PaymentListItem>
          columns={columns}
          data={initialData}
          rowKey={(row) => row.id}
          sort={table.sort}
          onSortChange={table.onSortChange}
          pagination={table.fullPagination(totalRecords)}
          onPageChange={table.onPageChange}
          onPageSizeChange={table.onPageSizeChange}
          onRowDoubleClick={(row) => router.push(`/dashboard/payment/${row.id}`)}
          emptyMessage="No payments found"
          emptyDescription="Try adjusting your search or filter criteria"
        />
      </div>

      {/* Record payment modal */}
      <RecordPaymentModal
        open={recordModal.isOpen}
        onClose={recordModal.close}
        payment={recordModal.data}
        isInstallment={false}
        onSuccess={() => { recordModal.close() }}
      />

      {/* Verify confirm */}
      <ConfirmModal
        open={verifyModal.isOpen}
        onClose={verifyModal.close}
        onConfirm={() => verifyModal.close()}
        title="Verify Payment"
        description={`Mark ${verifyModal.data?.docNumber} as verified? This confirms the payment details have been reviewed and approved.`}
        confirmLabel="Verify Payment"
        cancelLabel="Cancel"
        variant="primary"
      />

      {/* Flag confirm */}
      <ConfirmModal
        open={flagModal.isOpen}
        onClose={flagModal.close}
        onConfirm={() => flagModal.close()}
        title="Flag Payment"
        description={`Flag ${flagModal.data?.docNumber} for review? The finance team will be notified to investigate.`}
        confirmLabel="Flag for Review"
        cancelLabel="Cancel"
        variant="primary"
      />

      {/* Generate shipment confirm */}
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
