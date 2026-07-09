'use client'

import { useEffect }                 from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm }                   from 'react-hook-form'
import { zodResolver }               from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, Receipt }          from 'lucide-react'
import { createPaymentSchema, type CreatePaymentFormData } from '@/lib/validations/payment'
import { createPayment }             from '@/lib/api/payment'
import { fetchVoucherDetail }        from '@/lib/api/voucher'
import { Button }                    from '@/components/ui/Button'
import { PageHeader }                from '@/components/layout/PageHeader'
import { FormField, FormSection }    from '@/components/form/FormField'
import { Input, Textarea }           from '@/components/ui/Input'
import { useToast }                  from '@/context/ToastContext'

export function PaymentCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  const voucherIdParam = searchParams.get('voucherId') ?? ''

  // ── Fetch linked voucher (when navigated from Voucher detail/list) ─
  const { data: voucher } = useQuery({
    queryKey: ['voucher-detail', voucherIdParam],
    queryFn:  () => fetchVoucherDetail(voucherIdParam).then((r) => r.data),
    enabled:  !!voucherIdParam,
  })

  const form = useForm<CreatePaymentFormData>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      voucherId:         voucherIdParam,
      installmentNumber: 1,
      paymentDate:        '',
      dueDate:            '',
      paidAmount:         0,
      remainingAmount:    0,
      remarks:            '',
      paymentProof:       '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = form

  // Pre-fill remainingAmount from the linked voucher's amount once loaded
  useEffect(() => {
    if (!voucher) return
    setValue('voucherId', voucher.id)
    setValue('remainingAmount', voucher.amount)
  }, [voucher, setValue])

  // ── Create mutation ───────────────────────────────────────────
  // payment_status is always 'UNPAID' on create — the backend has no
  // draft/submit concept for Payment, unlike QS/Voucher.
  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentFormData) =>
      createPayment({
        voucherId:         data.voucherId,
        installmentNumber: data.installmentNumber,
        paymentDate:        data.paymentDate || undefined,
        dueDate:            data.dueDate,
        paidAmount:         data.paidAmount,
        remainingAmount:    data.remainingAmount,
        paymentStatus:      'UNPAID',
        remarks:            data.remarks,
        paymentProof:       data.paymentProof || undefined,
      }),
    onSuccess: (payment) => {
      queryClient.invalidateQueries({ queryKey: ['payment-list'] })
      if (voucherIdParam) {
        queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
        queryClient.invalidateQueries({ queryKey: ['voucher-detail', voucherIdParam] })
      }
      success('Payment Created', `${payment.docNumber} has been created successfully.`)
      router.push(`/dashboard/payment/${payment.id}`)
    },
    onError: () => {
      toastError('Save failed', 'Could not create the payment. Please check your inputs and try again.')
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
          description={voucher ? `Creating payment installment for ${voucher.docNumber}` : 'Create a new payment installment'}
          breadcrumbs={[
            { label: 'Payment', href: '/dashboard/payment' },
            { label: 'New Payment' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">

        {/* Voucher pre-fill banner */}
        {voucher && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
            <Receipt size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#123d6b]">Linked to {voucher.docNumber}</p>
              <p className="text-[11px] text-[#2d6495] mt-0.5">
                Remaining amount has been pre-filled from the voucher. Review before submitting.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Payment Details" columns={2}>
            {/* voucher_id — prefilled, read-only, not typed by the user */}
            <FormField label="Voucher" required className="col-span-2">
              <Input
                value={voucher?.docNumber ?? voucherIdParam}
                readOnly
                disabled
                className="bg-[#f7f9fb] cursor-not-allowed"
              />
              <input type="hidden" {...register('voucherId')} />
            </FormField>

            <FormField label="Installment Number" required error={errors.installmentNumber?.message}>
              <Input
                type="number"
                min={1}
                error={!!errors.installmentNumber}
                {...register('installmentNumber', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Payment Status" hint="New payments always start as Unpaid">
              <Input value="Unpaid" readOnly disabled className="bg-[#f7f9fb] cursor-not-allowed" />
            </FormField>

            <FormField label="Payment Date" hint="Leave blank if not yet paid" error={errors.paymentDate?.message}>
              <Input type="date" error={!!errors.paymentDate} {...register('paymentDate')} />
            </FormField>

            <FormField label="Due Date" required error={errors.dueDate?.message}>
              <Input type="date" error={!!errors.dueDate} {...register('dueDate')} />
            </FormField>

            <FormField label="Paid Amount" required error={errors.paidAmount?.message}>
              <Input
                type="number"
                min={0}
                error={!!errors.paidAmount}
                {...register('paidAmount', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Remaining Amount" required error={errors.remainingAmount?.message}>
              <Input
                type="number"
                min={0}
                error={!!errors.remainingAmount}
                {...register('remainingAmount', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Payment Proof" hint="Optional — file reference or URL" className="col-span-2" error={errors.paymentProof?.message}>
              <Input error={!!errors.paymentProof} {...register('paymentProof')} />
            </FormField>

            <FormField label="Remarks" required className="col-span-2" error={errors.remarks?.message}>
              <Textarea rows={3} error={!!errors.remarks} {...register('remarks')} />
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
          Create Payment
        </Button>
      </div>
    </div>
  )
}