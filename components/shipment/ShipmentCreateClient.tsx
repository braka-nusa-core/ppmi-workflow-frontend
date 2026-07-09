'use client'

import { useEffect }                 from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm }                   from 'react-hook-form'
import { zodResolver }               from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, Package }          from 'lucide-react'
import { createShipmentSchema, type CreateShipmentFormData } from '@/lib/validations/shipment'
import { createShipment }            from '@/lib/api/shipment'
import { fetchInvoiceDetail }        from '@/lib/api/invoice'
import { fetchPaymentDetail }        from '@/lib/api/payment'
import { fetchVoucherDetail }        from '@/lib/api/voucher'
import { Button }                    from '@/components/ui/Button'
import { PageHeader }                from '@/components/layout/PageHeader'
import { FormField, FormSection }    from '@/components/form/FormField'
import { Input }                     from '@/components/ui/Input'
import { useToast }                  from '@/context/ToastContext'

export function ShipmentCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient   = useQueryClient()
  const { success, error: toastError } = useToast()

  const invoiceIdFromUrl = searchParams.get('invoiceId') ?? ''
  const paymentIdParam   = searchParams.get('paymentId') ?? ''

  // ── Resolve invoiceId ──────────────────────────────────────────
  // BUG FIX: Generate Shipment (from Payment) previously relied on
  // Payment's response already containing voucher.invoice_id, which the
  // backend does not actually return today (only voucher.id/voucher_number
  // are selected in payments.service.ts) — so invoiceId always arrived
  // empty in the URL. Rather than depend on that backend field, resolve
  // it ourselves via fields that ARE guaranteed present: Payment.voucherId
  // (always populated — it's a direct, required column) → Voucher detail
  // → Voucher.invoiceId (always populated — invoice_id is a required,
  // non-nullable column on the Voucher model). No backend change needed.
  const { data: paymentForResolve } = useQuery({
    queryKey: ['payment-detail', paymentIdParam],
    queryFn:  () => fetchPaymentDetail(paymentIdParam),
    enabled:  !invoiceIdFromUrl && !!paymentIdParam,
  })

  const resolvedVoucherId = paymentForResolve?.voucherId

  const { data: voucherForResolve } = useQuery({
    queryKey: ['voucher-detail', resolvedVoucherId],
    queryFn:  () => fetchVoucherDetail(resolvedVoucherId!).then((r) => r.data),
    enabled:  !invoiceIdFromUrl && !!resolvedVoucherId,
  })

  const invoiceIdParam = invoiceIdFromUrl || voucherForResolve?.invoiceId || ''

  // ── Fetch linked invoice (when navigated from Invoice/Payment) ─
  const { data: invoice } = useQuery({
    queryKey: ['invoice-detail', invoiceIdParam],
    queryFn:  () => fetchInvoiceDetail(invoiceIdParam),
    enabled:  !!invoiceIdParam,
  })

  const form = useForm<CreateShipmentFormData>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      invoiceId:       invoiceIdFromUrl,
      paymentId:       paymentIdParam || undefined,
      courier:         '',
      trackingNumber:  '',
      shippingDate:    '',
      shippingProofId: '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = form


   // Keep invoiceId/paymentId in sync — prefilled, never typed by the
  // user (same pattern as Voucher's invoiceId, Payment's voucherId).
  // invoiceIdParam here includes the resolved fallback value once it loads.
  useEffect(() => {
    if (invoiceIdParam) setValue('invoiceId', invoiceIdParam, { shouldValidate: true })
    if (paymentIdParam) setValue('paymentId', paymentIdParam)
  }, [invoiceIdParam, paymentIdParam, setValue])

  // ── Create mutation ───────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateShipmentFormData) =>
      createShipment({
        invoiceId:       data.invoiceId,
        courier:         data.courier,
        trackingNumber:  data.trackingNumber,
        shippingDate:    data.shippingDate,
        paymentId:       data.paymentId || undefined,
        shippingProofId: data.shippingProofId || undefined,
      }),
    onSuccess: (shipment) => {
      queryClient.invalidateQueries({ queryKey: ['shipment-list'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] })
      if (invoiceIdParam) {
        queryClient.invalidateQueries({ queryKey: ['invoice-detail', invoiceIdParam] })
      }
      success('Shipment Created', `${shipment.docNumber} has been created successfully.`)
      router.push(`/dashboard/shipment/${shipment.id}`)
    },
    onError: () => {
      toastError('Save failed', 'Could not create the shipment. Please check your inputs and try again.')
    },
  })

  const onSubmit = (data: CreateShipmentFormData) => {
    createMutation.mutate(data)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title="New Shipment"
          description={invoice ? `Creating shipment for ${invoice.docNumber}` : 'Create a new shipment record'}
          breadcrumbs={[
            { label: 'Shipment', href: '/dashboard/shipment' },
            { label: 'New Shipment' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">

        {/* Invoice / Payment pre-fill banner */}
        {(invoice || paymentIdParam) && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
            <Package size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#123d6b]">
                {invoice ? `Linked to ${invoice.docNumber}` : 'Linked to payment'}
              </p>
              <p className="text-[11px] text-[#2d6495] mt-0.5">
                Invoice{paymentIdParam ? ' and payment' : ''} have been pre-filled. Review before submitting.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Shipment Details" columns={2}>
            {/* invoice_id / payment_id — prefilled, read-only, not typed by the user */}
            <FormField label="Invoice" required className="col-span-2" error={errors.invoiceId?.message}>
              <Input
                value={invoice?.docNumber ?? invoiceIdParam ?? ''}
                readOnly
                disabled
                className="bg-[#f7f9fb] cursor-not-allowed"
              />
              <input type="hidden" {...register('invoiceId')} />
            </FormField>

            {paymentIdParam && (
              <FormField label="Payment" className="col-span-2">
                <Input
                  value={paymentIdParam}
                  readOnly
                  disabled
                  className="bg-[#f7f9fb] cursor-not-allowed"
                />
                <input type="hidden" {...register('paymentId')} />
              </FormField>
            )}

            <FormField label="Courier" required error={errors.courier?.message}>
              <Input
                placeholder="e.g. DHL, FedEx, JNE"
                error={!!errors.courier}
                {...register('courier')}
              />
            </FormField>

            <FormField label="Tracking Number" required error={errors.trackingNumber?.message}>
              <Input
                placeholder="e.g. 1234567890"
                error={!!errors.trackingNumber}
                {...register('trackingNumber')}
              />
            </FormField>

            <FormField label="Shipping Date" required error={errors.shippingDate?.message}>
              <Input type="date" error={!!errors.shippingDate} {...register('shippingDate')} />
            </FormField>

            <FormField label="Shipping Proof ID" hint="Optional — linked file attachment ID" error={errors.shippingProofId?.message}>
              <Input error={!!errors.shippingProofId} {...register('shippingProofId')} />
            </FormField>
          </FormSection>

          <div className="h-20" />
        </form>
      </div>

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #d5e3ef', boxShadow: '0 -4px 16px rgba(7,25,52,0.06)' }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push('/dashboard/shipment')}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={<Save size={13} />} loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
          Create Shipment
        </Button>
      </div>
    </div>
  )
}