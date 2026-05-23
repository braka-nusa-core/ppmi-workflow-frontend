'use client'

import { useMemo }              from 'react'
import { useRouter }            from 'next/navigation'
import { Plus, Download }       from 'lucide-react'
import { DataTable }            from '@/components/table/DataTable'
import { TableFilters }         from '@/components/table/TableFilters'
import type { FilterDef }       from '@/components/table/TableFilters'
import { PageHeader }           from '@/components/layout/PageHeader'
import { Button }               from '@/components/ui/Button'
import { ConfirmModal }         from '@/components/modal/BaseModal'
import { useDataTable }         from '@/hooks/useDataTable'
import { useModal }             from '@/hooks/useModal'
import { useRole }              from '@/hooks/useRole'
import { buildVoucherColumns }  from './VoucherTableColumns'
import type { VoucherListItem } from '@/types/voucher'

const VOUCHER_FILTERS: FilterDef[] = [
  {
    key: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'DRAFT',            label: 'Draft'            },
      { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
      { value: 'APPROVED',         label: 'Approved'         },
      { value: 'PROCESSED',        label: 'Processed'        },
      { value: 'CANCELLED',        label: 'Cancelled'        },
    ],
  },
  {
    key: 'approvalStatus', label: 'Approval', type: 'select',
    options: [
      { value: 'WAITING',  label: 'Waiting'  },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
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
    key: 'paymentType', label: 'Payment Type', type: 'select',
    options: [
      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
      { value: 'RTGS',          label: 'RTGS'          },
      { value: 'SWIFT',         label: 'SWIFT'         },
      { value: 'CHEQUE',        label: 'Cheque'        },
      { value: 'CASH',          label: 'Cash'          },
    ],
  },
]

interface VoucherListClientProps {
  initialData:  VoucherListItem[]
  totalRecords: number
}

export function VoucherListClient({ initialData, totalRecords }: VoucherListClientProps) {
  const router         = useRouter()
  const { canCreate, canEdit, canVerify } = useRole()
  const table          = useDataTable({ defaultPageSize: 25 })
  const approveModal   = useModal<VoucherListItem>()
  const paymentModal   = useModal<VoucherListItem>()

  const columns = useMemo(() => buildVoucherColumns({
    onView:            (row) => router.push(`/dashboard/voucher/${row.id}`),
    onEdit:            (row) => router.push(`/dashboard/voucher/${row.id}/edit`),
    onApprove:         (row) => approveModal.open(row),
    onGeneratePayment: (row) => paymentModal.open(row),
    onDownload:        (_row) => { /* wire to API */ },
    canEdit,
    canVerify,
    canCreate,
  }), [canEdit, canVerify, canCreate, router, approveModal, paymentModal])

  return (
    <>
      <PageHeader
        title="Vouchers"
        description="Finance payment vouchers across P&I and H&M divisions"
        breadcrumbs={[{ label: 'Voucher' }]}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>
              Export
            </Button>
            {canCreate && (
              <Button
                variant="primary" size="sm" icon={<Plus size={13} />}
                onClick={() => router.push('/dashboard/voucher/new')}
              >
                New Voucher
              </Button>
            )}
          </>
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search voucher no., invoice ref., insured…"
          filters={VOUCHER_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        <DataTable<VoucherListItem>
          columns={columns}
          data={initialData}
          rowKey={(row) => row.id}
          sort={table.sort}
          onSortChange={table.onSortChange}
          pagination={table.fullPagination(totalRecords)}
          onPageChange={table.onPageChange}
          onPageSizeChange={table.onPageSizeChange}
          onRowDoubleClick={(row) => router.push(`/dashboard/voucher/${row.id}`)}
          emptyMessage="No vouchers found"
          emptyDescription="Try adjusting your search or filter criteria"
        />
      </div>

      <ConfirmModal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        onConfirm={() => { approveModal.close() }}
        title="Approve Voucher"
        description={`Approve ${approveModal.data?.docNumber}? This will authorise the payment to be processed.`}
        confirmLabel="Approve Voucher"
        cancelLabel="Cancel"
        variant="primary"
      />

      <ConfirmModal
        open={paymentModal.isOpen}
        onClose={paymentModal.close}
        onConfirm={() => {
          paymentModal.close()
          if (paymentModal.data) {
            router.push(`/dashboard/payment/new?voucherId=${paymentModal.data.id}`)
          }
        }}
        title="Generate Payment"
        description={`Generate a payment record from ${paymentModal.data?.docNumber}? This advances the workflow to the Payment stage.`}
        confirmLabel="Generate Payment"
        cancelLabel="Cancel"
        variant="primary"
      />
    </>
  )
}
