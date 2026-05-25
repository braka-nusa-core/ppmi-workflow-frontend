'use client'

import { useMemo }                from 'react'
import { useRouter }              from 'next/navigation'
import { Download }               from 'lucide-react'
import { DataTable }              from '@/components/table/DataTable'
import { TableFilters }           from '@/components/table/TableFilters'
import type { FilterDef }         from '@/components/table/TableFilters'
import { PageHeader }             from '@/components/layout/PageHeader'
import { Button }                 from '@/components/ui/Button'
import { ConfirmModal }           from '@/components/modal/BaseModal'
import { useDataTable }           from '@/hooks/useDataTable'
import { useModal }               from '@/hooks/useModal'
import { useRole }                from '@/hooks/useRole'
import { buildShipmentColumns }   from './ShipmentTableColumns'
import type { ShipmentListItem }  from '@/types/shipment'

const SHIPMENT_FILTERS: FilterDef[] = [
  {
    key: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'DRAFT',               label: 'Draft'               },
      { value: 'IN_PROGRESS',         label: 'In Progress'         },
      { value: 'DOCUMENTS_RECEIVED',  label: 'Docs Received'       },
      { value: 'DOCUMENTS_FORWARDED', label: 'Docs Forwarded'      },
      { value: 'COMPLETED',           label: 'Completed'           },
      { value: 'CANCELLED',           label: 'Cancelled'           },
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
    key: 'documentsReceived', label: 'Docs Rcv.', type: 'select',
    options: [
      { value: 'true',  label: 'Received'      },
      { value: 'false', label: 'Not Received'  },
    ],
  },
  {
    key: 'documentsForwarded', label: 'Docs Fwd.', type: 'select',
    options: [
      { value: 'true',  label: 'Forwarded'     },
      { value: 'false', label: 'Not Forwarded' },
    ],
  },
]

interface ShipmentListClientProps {
  initialData:  ShipmentListItem[]
  totalRecords: number
}

export function ShipmentListClient({ initialData, totalRecords }: ShipmentListClientProps) {
  const router = useRouter()
  const { canEdit } = useRole()
  const table        = useDataTable({ defaultPageSize: 25 })
  const completeModal = useModal<ShipmentListItem>()

  const columns = useMemo(() => buildShipmentColumns({
    onView:     (row) => router.push(`/dashboard/shipment/${row.id}`),
    onEdit:     (row) => router.push(`/dashboard/shipment/${row.id}/edit`),
    onComplete: (row) => completeModal.open(row),
    canEdit,
  }), [canEdit, router, completeModal])

  return (
    <>
      <PageHeader
        title="Shipments"
        description="Document tracking for the final workflow stage across all divisions"
        breadcrumbs={[{ label: 'Shipment' }]}
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
          searchPlaceholder="Search shipment no., B/L number, insured…"
          filters={SHIPMENT_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        <DataTable<ShipmentListItem>
          columns={columns}
          data={initialData}
          rowKey={(row) => row.id}
          sort={table.sort}
          onSortChange={table.onSortChange}
          pagination={table.fullPagination(totalRecords)}
          onPageChange={table.onPageChange}
          onPageSizeChange={table.onPageSizeChange}
          onRowDoubleClick={(row) => router.push(`/dashboard/shipment/${row.id}`)}
          emptyMessage="No shipments found"
          emptyDescription="Shipment records appear here once payments are completed"
        />
      </div>

      <ConfirmModal
        open={completeModal.isOpen}
        onClose={completeModal.close}
        onConfirm={() => completeModal.close()}
        title="Complete Shipment"
        description={`Mark ${completeModal.data?.docNumber} as completed? This finalises the entire workflow for this policy.`}
        confirmLabel="Complete Shipment"
        cancelLabel="Cancel"
        variant="primary"
      />
    </>
  )
}
