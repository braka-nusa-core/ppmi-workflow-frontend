'use client'

import { useMemo }             from 'react'
import { useRouter }           from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus }                 from 'lucide-react'
import { DataTable }            from '@/components/table/DataTable'
import { TableFilters }         from '@/components/table/TableFilters'
import { PageHeader }           from '@/components/layout/PageHeader'
import { Button }               from '@/components/ui/Button'
import { ConfirmModal }         from '@/components/modal/BaseModal'
import { ErrorState }           from '@/components/feedback/ErrorState'
import { useDataTable }         from '@/hooks/useDataTable'
import { useModal }             from '@/hooks/useModal'
import { useRole }              from '@/hooks/useRole'
import { useToast }             from '@/context/ToastContext'
import { buildShipmentColumns } from './ShipmentTableColumns'
import { fetchShipmentList, deleteShipment } from '@/lib/api/shipment'
import type { ShipmentListItem } from '@/types/shipment'

export function ShipmentListClient() {
  const router      = useRouter()
  const queryClient  = useQueryClient()
  const { canCreate, canEdit, canDelete } = useRole()
  const { success, error: toastError }    = useToast()
  const table       = useDataTable({ defaultPageSize: 25 })
  const deleteModal  = useModal<ShipmentListItem>()

  // ── Typed query params ────────────────────────────────────────
  const shipmentQueryParams = {
    page:     table.pagination.page,
    pageSize: table.pagination.pageSize,
    search:   table.debouncedSearch || undefined,
    sortBy:   table.sort?.key,
    sortDir:  table.sort?.direction,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['shipment-list', shipmentQueryParams],
    queryFn:  () => fetchShipmentList(shipmentQueryParams),
  })

  const data  = result?.data ?? []
  const total = result?.pagination?.total ?? 0

  // ── Delete ─────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-list'] })
      success('Shipment Deleted', `${deleteModal.data?.docNumber} has been deleted.`)
      deleteModal.close()
    },
    onError: () => {
      toastError('Delete failed', 'Could not delete the shipment. Please try again.')
    },
  })

  const columns = useMemo(() => buildShipmentColumns({
    onView:   (row) => router.push(`/dashboard/shipment/${row.id}`),
    onEdit:   (row) => router.push(`/dashboard/shipment/${row.id}/edit`),
    onDelete: (row) => deleteModal.open(row),
    canEdit,
    canDelete,
  }), [canEdit, canDelete, router, deleteModal])

  return (
    <>
      <PageHeader
        title="Shipments"
        description="Shipment records linked to invoices across P&I and H&M divisions"
        breadcrumbs={[{ label: 'Shipment' }]}
        actions={
          canCreate && (
            <Button
              variant="primary" size="sm" icon={<Plus size={13} />}
              onClick={() => router.push('/dashboard/shipment/new')}
            >
              New Shipment
            </Button>
          )
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search courier, tracking number…"
        />
        {isError ? (
          <ErrorState
            message="Failed to load shipments"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<ShipmentListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(`/dashboard/shipment/${row.id}`)}
            emptyMessage="No shipments found"
            emptyDescription="Try adjusting your search criteria"
          />
        )}
      </div>

      {/* Delete */}
      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteModal.data && deleteMutation.mutate(deleteModal.data.id)}
        title="Delete Shipment"
        description={`Delete ${deleteModal.data?.docNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </>
  )
}