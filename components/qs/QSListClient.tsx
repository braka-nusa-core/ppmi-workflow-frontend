'use client'

import { useMemo }    from 'react'
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
import { buildQSColumns }       from './QSTableColumns'
import type { QSListItem }      from '@/types/qs'

// ─── Filter definitions ──────────────────────────────────────────
const QS_FILTERS: FilterDef[] = [
  {
    key:   'status',
    label: 'Status',
    type:  'select',
    options: [
      { value: 'DRAFT',     label: 'Draft'     },
      { value: 'PENDING',   label: 'Pending'   },
      { value: 'APPROVED',  label: 'Approved'  },
      { value: 'REVISION',  label: 'Revision'  },
      { value: 'COMPLETED', label: 'Completed' },
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
    key:   'type',
    label: 'Type',
    type:  'select',
    options: [
      { value: 'NEW',   label: 'New'     },
      { value: 'RENEW', label: 'Renewal' },
    ],
  },
]

interface QSListClientProps {
  initialData: QSListItem[]
  totalRecords: number
}

export function QSListClient({ initialData, totalRecords }: QSListClientProps) {
  const router  = useRouter()
  const { canCreate, canEdit } = useRole()
  const table   = useDataTable({ defaultPageSize: 25 })
  const archiveModal = useModal<QSListItem>()
  const invoiceModal = useModal<QSListItem>()

  // In production: replace with useQuery using table.queryParams
  const data  = initialData
  const total = totalRecords

  const columns = useMemo(() => buildQSColumns({
    onView:            (row) => router.push(`/dashboard/qs/${row.id}`),
    onEdit:            (row) => router.push(`/dashboard/qs/${row.id}/edit`),
    onGenerateInvoice: (row) => invoiceModal.open(row),
    onArchive:         (row) => archiveModal.open(row),
    canEdit,
    canCreate,
  }), [canEdit, canCreate, router, archiveModal, invoiceModal])

  return (
    <>
      {/* ── Page Header ─────────────────────────────────────── */}
      <PageHeader
        title="Quotation Sheets"
        description="Manage all QS documents across P&I and H&M divisions"
        breadcrumbs={[{ label: 'QS' }]}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download size={13} />}
            >
              Export
            </Button>
            {canCreate && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => router.push('/dashboard/qs/new')}
              >
                New QS
              </Button>
            )}
          </>
        }
      />

      {/* ── Data Table ──────────────────────────────────────── */}
      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search QS number, insured, vessel…"
          filters={QS_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        <DataTable<QSListItem>
          columns={columns}
          data={data}
          rowKey={(row) => row.id}
          sort={table.sort}
          onSortChange={table.onSortChange}
          pagination={table.fullPagination(total)}
          onPageChange={table.onPageChange}
          onPageSizeChange={table.onPageSizeChange}
          onRowDoubleClick={(row) => router.push(`/dashboard/qs/${row.id}`)}
          emptyMessage="No quotation sheets found"
          emptyDescription="Try adjusting your search or filter criteria"
        />
      </div>

      {/* ── Archive Confirm Modal ────────────────────────────── */}
      <ConfirmModal
        open={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={() => {
          // wire to mutation
          archiveModal.close()
        }}
        title="Archive Quotation Sheet"
        description={`Archive ${archiveModal.data?.docNumber}? This will remove it from the active list. You can restore it later from the archive.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="primary"
      />

      {/* ── Generate Invoice Confirm ─────────────────────────── */}
      <ConfirmModal
        open={invoiceModal.isOpen}
        onClose={invoiceModal.close}
        onConfirm={() => {
          invoiceModal.close()
          if (invoiceModal.data) {
            router.push(`/dashboard/invoice/new?qsId=${invoiceModal.data.id}`)
          }
        }}
        title="Generate Invoice"
        description={`Generate an invoice from ${invoiceModal.data?.docNumber}? This will advance the workflow to the Invoice stage.`}
        confirmLabel="Generate Invoice"
        cancelLabel="Cancel"
        variant="primary"
      />
    </>
  )
}
