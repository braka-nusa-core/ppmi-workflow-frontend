'use client'

import { useRouter }         from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { fetchShipmentDetail, deleteShipment } from '@/lib/api/shipment'
import { Button }            from '@/components/ui/Button'
import { PageHeader }        from '@/components/layout/PageHeader'
import { LoadingSkeleton }   from '@/components/feedback/LoadingSkeleton'
import { ErrorState }        from '@/components/feedback/ErrorState'
import { ConfirmModal }      from '@/components/modal/BaseModal'
import { useModal }          from '@/hooks/useModal'
import { useRole }           from '@/hooks/useRole'
import { useToast }          from '@/context/ToastContext'
import {
  ShipmentInfoPanel,
  ShipmentLinkedDocsPanel,
} from './ShipmentDetailInfoPanels'

interface ShipmentDetailClientProps {
  id: string
}

export function ShipmentDetailClient({ id }: ShipmentDetailClientProps) {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const { canEdit, canDelete } = useRole()
  const { success, error: toastError } = useToast()
  const deleteModal = useModal()

  const { data: shp, isLoading, isError, refetch } = useQuery({
    queryKey: ['shipment-detail', id],
    queryFn:  () => fetchShipmentDetail(id),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteShipment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-list'] })
      success('Shipment Deleted', `${shp?.docNumber} has been deleted.`)
      router.push('/dashboard/shipment')
    },
    onError: () => {
      toastError('Delete failed', 'Could not delete the shipment. Please try again.')
    },
  })

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────
  if (isError || !shp) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load shipment"
          description="The shipment document could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={shp.docNumber}
        description="Shipment record details"
        breadcrumbs={[
          { label: 'Shipment', href: '/dashboard/shipment' },
          { label: shp.docNumber },
        ]}
        actions={
          <>
            <Button
              variant="ghost" size="sm" icon={<ArrowLeft size={13} />}
              onClick={() => router.push('/dashboard/shipment')}
            >
              Back
            </Button>
            {canEdit && (
              <Button
                variant="secondary" size="sm" icon={<Pencil size={13} />}
                onClick={() => router.push(`/dashboard/shipment/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            {canDelete && (
              <Button
                variant="danger" size="sm" icon={<Trash2 size={13} />}
                onClick={() => deleteModal.open()}
              >
                Delete
              </Button>
            )}
          </>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e8f3fb]">
          <Package size={16} className="text-[#123d6b]" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">{shp.docNumber}</h1>
          <p className="text-[12px] text-[#7a8fa3]">Courier: {shp.courier} · Tracking: {shp.trackingNumber}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">
        <ShipmentInfoPanel shp={shp} />
        <ShipmentLinkedDocsPanel shp={shp} />
      </div>

      {/* Delete */}
      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Shipment"
        description={`Delete ${shp.docNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  )
}