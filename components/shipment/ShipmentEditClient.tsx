'use client'

import { useEffect }          from 'react'
import { useRouter }          from 'next/navigation'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X }            from 'lucide-react'
import { updateShipmentSchema, type UpdateShipmentFormData } from '@/lib/validations/shipment'
import { fetchShipmentDetail, updateShipment } from '@/lib/api/shipment'
import { Button }             from '@/components/ui/Button'
import { PageHeader }         from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input }              from '@/components/ui/Input'
import { LoadingSkeleton }    from '@/components/feedback/LoadingSkeleton'
import { ErrorState }         from '@/components/feedback/ErrorState'
import { useToast }           from '@/context/ToastContext'

interface ShipmentEditClientProps {
  id: string
}

export function ShipmentEditClient({ id }: ShipmentEditClientProps) {
  const router       = useRouter()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  // ── Fetch existing shipment data ───────────────────────────────
  const { data: shp, isLoading, isError, refetch } = useQuery({
    queryKey: ['shipment-detail', id],
    queryFn:  () => fetchShipmentDetail(id),
  })

  const form = useForm<UpdateShipmentFormData>({
    resolver: zodResolver(updateShipmentSchema),
    defaultValues: {
      invoiceId:       '',
      courier:         '',
      trackingNumber:  '',
      shippingDate:    '',
      paymentId:       '',
      shippingProofId: '',
    },
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  // Populate form once shipment data arrives
  useEffect(() => {
    if (!shp) return
    reset({
      invoiceId:       shp.invoiceId,
      courier:         shp.courier          ?? '',
      trackingNumber:  shp.trackingNumber   ?? '',
      shippingDate:    shp.shippingDate?.slice(0, 10) ?? '',
      paymentId:       shp.paymentId        ?? '',
      shippingProofId: shp.shippingProofId  ?? '',
    })
  }, [shp, reset])

  // ── Update mutation ─────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateShipmentFormData) =>
      updateShipment(id, {
        invoiceId:       data.invoiceId,
        courier:         data.courier,
        trackingNumber:  data.trackingNumber,
        shippingDate:    data.shippingDate,
        paymentId:       data.paymentId || undefined,
        shippingProofId: data.shippingProofId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-list'] })
      queryClient.invalidateQueries({ queryKey: ['shipment-detail', id] })
      success('Shipment Updated', `${shp?.docNumber} has been updated successfully.`)
      router.push(`/dashboard/shipment/${id}`)
    },
    onError: () => {
      toastError('Update failed', 'Could not save changes. Please check your inputs and try again.')
    },
  })

  const handleSave = (data: UpdateShipmentFormData) => {
    updateMutation.mutate(data)
  }

  // ── Loading / Error states ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !shp) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load shipment"
          description="The shipment document could not be loaded for editing."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit ${shp.docNumber}`}
          description="Update shipment and tracking information"
          breadcrumbs={[
            { label: 'Shipment', href: '/dashboard/shipment' },
            { label: shp.docNumber, href: `/dashboard/shipment/${shp.id}` },
            { label: 'Edit' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        <form onSubmit={handleSubmit(handleSave)} noValidate>
          <div className="max-w-[720px] flex flex-col gap-0 divide-y divide-[#f0f4f7]">

            {/* Shipping Details */}
            <div className="pb-8">
              <FormSection title="Shipping Details" description="Courier and tracking reference information" columns={2}>
                <FormField label="Invoice" required className="col-span-2" error={errors.invoiceId?.message}>
                  <Input
                    value={shp.invoiceNumber}
                    readOnly
                    disabled
                    className="bg-[#f7f9fb] cursor-not-allowed"
                  />
                  <input type="hidden" {...register('invoiceId')} />
                </FormField>
                <FormField label="Courier" required error={errors.courier?.message}>
                  <Input placeholder="e.g. DHL, FedEx, JNE" error={!!errors.courier} {...register('courier')} />
                </FormField>
                <FormField label="Tracking Number" required error={errors.trackingNumber?.message}>
                  <Input placeholder="e.g. 1234567890" error={!!errors.trackingNumber} {...register('trackingNumber')} />
                </FormField>
                <FormField label="Shipping Date" required error={errors.shippingDate?.message}>
                  <Input type="date" error={!!errors.shippingDate} {...register('shippingDate')} />
                </FormField>
                <FormField label="Shipping Proof ID" hint="Optional — linked file attachment ID" error={errors.shippingProofId?.message}>
                  <Input error={!!errors.shippingProofId} {...register('shippingProofId')} />
                </FormField>
              </FormSection>
            </div>
          </div>
          <div className="h-20" />
        </form>
      </div>

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background:     'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop:      '1px solid #d5e3ef',
          boxShadow:      '0 -4px 16px rgba(7,25,52,0.06)',
        }}
      >
        <Button
          variant="ghost" size="sm" icon={<X size={13} />}
          onClick={() => router.push(`/dashboard/shipment/${shp.id}`)}
        >
          Cancel
        </Button>
        <Button
          variant="primary" size="sm" icon={<Save size={13} />}
          loading={updateMutation.isPending} onClick={handleSubmit(handleSave)}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}