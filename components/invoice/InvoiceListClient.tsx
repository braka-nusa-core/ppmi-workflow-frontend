'use client'

import { useMemo }             from 'react'
import { useRouter }           from 'next/navigation'
import { Plus, Download }      from 'lucide-react'
import { DataTable }           from '@/components/table/DataTable'
import { TableFilters }        from '@/components/table/TableFilters'
import type { FilterDef }      from '@/components/table/TableFilters'
import { PageHeader }          from '@/components/layout/PageHeader'
import { Button }              from '@/components/ui/Button'
import { ConfirmModal }        from '@/components/modal/BaseModal'
import { useDataTable }        from '@/hooks/useDataTable'
import { useModal }            from '@/hooks/useModal'
import { useRole }             from '@/hooks/useRole'
import { buildInvoiceColumns } from './InvoiceTableColumns'
import type { InvoiceListItem } from '@/types/invoice'

const INVOICE_FILTERS: FilterDef[] = [
  {
    key:   'status',
    label: 'Status',
    type:  'select',
    options: [
      { value: 'DRAFT',     label: 'Draft'     },
      { value: 'ISSUED',    label: 'Issued'    },
      { value: 'SENT',      label: 'Sent'      },
      { value: 'PAID',      label: 'Paid'      },
      { value: 'OVERDUE',   label: 'Overdue'   },
      { value: 'CANCELLED', label: 'Cancelled' },
    ],
  },
  {
    key:   'paymentStatus',
    label: 'Payment',
    type:  'select',
    options: [
      { value: 'UNPAID',  label: 'Unpaid'  },
      { value: 'PARTIAL', label: 'Partial' },
      { value: 'PAID',    label: 'Paid'    },
    ],
  },
  {
    key:   'division',
    label: 'Division',
    type:  'select',
    options: [
      { value: 'PI', label: 'P&I' },
      { value: 'HM', label: 'H&M' },
    ],
  },
  {
    key:   'dueDate',
    label: 'Due by',
    type:  'date',
  },
]

interface InvoiceListClientProps {
  initialData:  InvoiceListItem[]
  totalRecords: number
}

export function InvoiceListClient({ initialData, totalRecords }: InvoiceListClientProps) {
  const router = useRouter()
  const { canCreate, canEdit } = useRole()
  const table        = useDataTable({ defaultPageSize: 25 })
  const voucherModal = useModal<InvoiceListItem>()
  const sentModal    = useModal<InvoiceListItem>()

  const columns = useMemo(() => buildInvoiceColumns({
    onView:            (row) => router.push(`/dashboard/invoice/${row.id}`),
    onEdit:            (row) => router.push(`/dashboard/invoice/${row.id}/edit`),
    onGenerateVoucher: (row) => voucherModal.open(row),
    onDownloadPDF:     () => { /* wire to downloadInvoicePDF */ },
    onMarkSent:        (row) => sentModal.open(row),
    canEdit,
    canCreate,
  }), [canEdit, canCreate, router, voucherModal, sentModal])

  return (
    <>
      <PageHeader
        title="Invoices"
        description="Manage all invoice documents across P&I and H&M divisions"
        breadcrumbs={[{ label: 'Invoice' }]}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>
              Export
            </Button>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => router.push('/dashboard/invoice/new')}
              >
                New Invoice
              </Button>
            )}
          </>
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search invoice no., QS ref., insured, vessel…"
          filters={INVOICE_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        <DataTable<InvoiceListItem>
          columns={columns}
          data={initialData}
          rowKey={(row) => row.id}
          sort={table.sort}
          onSortChange={table.onSortChange}
          pagination={table.fullPagination(totalRecords)}
          onPageChange={table.onPageChange}
          onPageSizeChange={table.onPageSizeChange}
          onRowDoubleClick={(row) => router.push(`/dashboard/invoice/${row.id}`)}
          emptyMessage="No invoices found"
          emptyDescription="Try adjusting your search or filter criteria"
        />
      </div>

      {/* Generate Voucher confirm */}
      <ConfirmModal
        open={voucherModal.isOpen}
        onClose={voucherModal.close}
        onConfirm={() => {
          voucherModal.close()
          if (voucherModal.data) {
            router.push(`/dashboard/voucher/new?invoiceId=${voucherModal.data.id}`)
          }
        }}
        title="Generate Voucher"
        description={`Generate a payment voucher from ${voucherModal.data?.docNumber}? This will advance the workflow to the Voucher stage.`}
        confirmLabel="Generate Voucher"
        cancelLabel="Cancel"
        variant="primary"
      />

      {/* Mark Sent confirm */}
      <ConfirmModal
        open={sentModal.isOpen}
        onClose={sentModal.close}
        onConfirm={() => { sentModal.close() }}
        title="Mark Invoice as Sent"
        description={`Confirm that ${sentModal.data?.docNumber} has been sent to the insured?`}
        confirmLabel="Mark as Sent"
        cancelLabel="Cancel"
        variant="primary"
      />
    </>
  )
}
