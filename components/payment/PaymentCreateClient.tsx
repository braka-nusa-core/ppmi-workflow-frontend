'use client'

import { useEffect }                 from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm }                   from 'react-hook-form'
import { zodResolver }               from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, Receipt }          from 'lucide-react'
import { createPaymentSchema, type CreatePaymentFormData } from '@/lib/validations/payment'
import { createPayment }             from '@/lib/api/payment'
import { fetchInvoiceDetail }        from '@/lib/api/invoice'
import { Button }                    from '@/components/ui/Button'
import { PageHeader }                from '@/components/layout/PageHeader'
import { FormField, FormSection }    from '@/components/form/FormField'
import { Input, Select, Textarea }   from '@/components/ui/Input'
import { useToast }                  from '@/context/ToastContext'

const METHOD_OPTIONS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'RTGS',          label: 'RTGS'          },
  { value: 'SWIFT',         label: 'SWIFT'         },
  { value: 'CHEQUE',        label: 'Cheque'        },
  { value: 'CASH',          label: 'Cash'          },
]

export function PaymentCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  // Payment now originates from Invoice (Phase 7) — was voucherId.
  const invoiceIdParam = searchParams.get('invoiceId') ?? ''

  // ── Fetch linked invoice (when navigated from Invoice detail/list) ─
  const { data: invoice } = useQuery({
    queryKey: ['invoice-detail', invoiceIdParam],
    queryFn:  () => fetchInvoiceDetail(invoiceIdParam),
    enabled:  !!invoiceIdParam,
  })

  const form = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      invoiceId:       invoiceIdParam,
      paidDate:        new Date().toISOString().slice(0, 10),
      paidAmount:      0,
      paymentMethod:   'BANK_TRANSFER',
      bankAccount:     '',
      referenceNumber: '',
      notes:           '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = form

  // Pre-fill invoiceId + suggest full outstanding amount once the
  // linked invoice loads.
  useEffect(() => {
    if (!invoice) return
    setValue('invoiceId', invoice.id)
    setValue('paidAmount', invoice.totalAmount)
  }, [invoice, setValue])

  // ── Create mutation ───────────────────────────────────────────
  // Per the latest Finance API Specification, status and remaining
  // balance are computed server-side from Total Invoice - Total
  // Payment — never sent by the client.
  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentFormData) =>
      createPayment({
        invoiceId:       data.invoiceId,
        paidDate:        data.paidDate,
        paidAmount:      data.paidAmount,
        paymentMethod:   data.paymentMethod,
        bankAccount:     data.bankAccount || undefined,
        referenceNumber: data.referenceNumber || undefined,
        notes:           data.notes || undefined,
      }),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payment-list'] })
      if (invoiceIdParam) {
        queryClient.invalidateQueries({ queryKey: ['invoice-detail', invoiceIdParam] })
      }
      success('Payment Recorded', `${payment.docNumber} has been created successfully.`)
      router.push(`/dashboard/payment/${payment.id}`)
    },
    onError: () => {
      toastError('Save failed', 'Could not record the payment. Please check your inputs and try again.')
    },
  })

  const onSubmit = (data: CreatePaymentFormData) => {
    createMutation.mutate(data)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title="New Payment"
          description={invoice ? `Recording a payment for ${invoice.docNumber}` : 'Record a new incoming payment'}
          breadcrumbs={[
            { label: 'Payment', href: '/dashboard/payment' },
            { label: 'New Payment' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">

        {/* Invoice pre-fill banner */}
        {invoice && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
            <Receipt size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#123d6b]">Linked to {invoice.docNumber}</p>
              <p className="text-[11px] text-[#2d6495] mt-0.5">
                Amount has been pre-filled from the invoice total. Adjust for a partial payment before submitting.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Payment Details" columns={2}>
            {/* invoiceId — prefilled, read-only, not typed by the user */}
            <FormField label="Invoice" required className="col-span-2">
              <Input
                value={invoice?.docNumber ?? invoiceIdParam}
                readOnly
                disabled
                className="bg-[#f7f9fb] cursor-not-allowed"
              />
              <input type="hidden" {...register('invoiceId')} />
            </FormField>

            <FormField label="Payment Date" required error={errors.paidDate?.message}>
              <Input type="date" error={!!errors.paidDate} {...register('paidDate')} />
            </FormField>

            <FormField label="Amount Paid" required error={errors.paidAmount?.message}>
              <Input
                type="number"
                min={0}
                error={!!errors.paidAmount}
                {...register('paidAmount', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Payment Method" required error={errors.paymentMethod?.message}>
              <Select
                options={METHOD_OPTIONS}
                placeholder="Select method"
                error={!!errors.paymentMethod}
                {...register('paymentMethod')}
              />
            </FormField>

            <FormField label="Bank Account" hint="Receiving bank account for this payment">
              <Input error={!!errors.bankAccount} {...register('bankAccount')} />
            </FormField>

            <FormField label="Reference / Transaction Number" className="col-span-2" hint="Bank transfer reference or cheque number">
              <Input placeholder="e.g. TRF-20250115-001" {...register('referenceNumber')} />
            </FormField>

            <FormField label="Notes" className="col-span-2" error={errors.notes?.message}>
              <Textarea rows={3} error={!!errors.notes} {...register('notes')} />
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
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push('/dashboard/payment')}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={<Save size={13} />} loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
          Record Payment
        </Button>
      </div>
    </div>
  )
}
