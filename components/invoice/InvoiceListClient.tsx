'use client'

import { useMemo }             from 'react'
import { useRouter }           from 'next/navigation'
import { useQuery }            from '@tanstack/react-query'
import { Plus, Download }      from 'lucide-react'
import { DataTable }           from '@/components/table/DataTable'
import { TableFilters }        from '@/components/table/TableFilters'
import type { FilterDef }      from '@/components/table/TableFilters'
import { PageHeader }          from '@/components/layout/PageHeader'
import { Button }              from '@/components/ui/Button'
import { ConfirmModal }        from '@/components/modal/BaseModal'
import { ErrorState }          from '@/components/feedback/ErrorState'
import { useDataTable }        from '@/hooks/useDataTable'
import { useModal }            from '@/hooks/useModal'
import { useRole }             from '@/hooks/useRole'
import { buildInvoiceColumns } from './InvoiceTableColumns'
import { fetchInvoiceList }    from '@/lib/api/invoice'
import type { InvoiceListItem, InvoiceStatus } from '@/types/invoice'

// ─── Filter definitions ──────────────────────────────────────────
// Values must match backend enum (types/backend/invoice.ts):
//   InvoiceStatus: DRAFT | PENDING | VOUCHER | SHIPPED | CLOSED
const INVOICE_FILTERS: FilterDef[] = [
  {
    key:   'status',
    label: 'Status',
    type:  'select',
    options: [
      { value: 'DRAFT',   label: 'Draft'   },
      { value: 'PENDING', label: 'Pending' },
      { value: 'VOUCHER', label: 'Voucher' },
      { value: 'SHIPPED', label: 'Shipped' },
      { value: 'CLOSED',  label: 'Closed'  },
    ],
  },
  {
    key:   'dueDate',
    label: 'Due by',
    type:  'date',
  },
]

export function InvoiceListClient() {
  const router = useRouter()
  const { canCreate, canEdit } = useRole()
  const table        = useDataTable({ defaultPageSize: 25 })
  const voucherModal = useModal<InvoiceListItem>()
  const sentModal    = useModal<InvoiceListItem>()

  // ── Data fetching ──────────────────────────────────────────────
  // useDataTable's queryParams is generically typed (ListQueryParams) for
  // reuse across modules; narrow activeFilters to Invoice's real enum types
  // here before calling fetchInvoiceList (which expects InvoiceFilters &
  // pagination/sort). lib/api/invoice.ts + lib/adapters/invoice.ts handle
  // the backend request/response mapping.
  const invoiceQueryParams = {
    page:     table.pagination.page,
    pageSize: table.pagination.pageSize,
    search:   table.debouncedSearch || undefined,
    sortBy:   table.sort?.key,
    sortDir:  table.sort?.direction,
    status:   (table.activeFilters.status as InvoiceStatus | undefined) || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoice-list', invoiceQueryParams],
    queryFn:  () => fetchInvoiceList(invoiceQueryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination.total ?? 0

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
        {isError ? (
          <ErrorState
            message="Failed to load invoices"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<InvoiceListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(`/dashboard/invoice/${row.id}`)}
            emptyMessage="No invoices found"
            emptyDescription="Try adjusting your search or filter criteria"
          />
        )}
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