'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, Receipt, AlertTriangle } from 'lucide-react'
import { createOutgoingPaymentSchema, type CreateOutgoingPaymentFormData } from '@/lib/validations/outgoingPayment'
import { createOutgoingPayment, fetchInsurerObligations } from '@/lib/api/outgoingPayment'
import { fetchInvoiceDetail } from '@/lib/api/invoice'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/format'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/config/routes'

export function OutgoingPaymentCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  const invoiceIdParam = searchParams.get('invoiceId') ?? ''
  // policyId is required to compute per-insurer share ceilings, but no
  // module currently links here with it populated (Invoice has no
  // direct policyId field yet — see Phase 8 report, Unexpected
  // Findings). Accepted as an optional param so this degrades to
  // manual entry rather than failing when absent.
  const policyIdParam  = searchParams.get('policyId') ?? ''

  const { data: invoice } = useQuery({
    queryKey: ['invoice-detail', invoiceIdParam],
    queryFn:  () => fetchInvoiceDetail(invoiceIdParam),
    enabled:  !!invoiceIdParam,
  })

  const { data: obligations, isLoading: obligationsLoading } = useQuery({
    queryKey: ['insurer-obligations', invoiceIdParam, policyIdParam],
    queryFn:  () => fetchInsurerObligations(invoiceIdParam, policyIdParam),
    enabled:  !!invoiceIdParam && !!policyIdParam,
  })

  const form = useForm<CreateOutgoingPaymentFormData>({
    resolver: zodResolver(createOutgoingPaymentSchema),
    defaultValues: {
      invoiceId:          invoiceIdParam,
      insuranceCompanyId: '',
      paymentDate:        new Date().toISOString().slice(0, 10),
      amount:             0,
      bankReference:      '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form
  const selectedInsurerId = watch('insuranceCompanyId')
  const selectedObligation = obligations?.find((o) => o.insuranceCompanyId === selectedInsurerId)

  useEffect(() => {
    if (invoiceIdParam) setValue('invoiceId', invoiceIdParam)
  }, [invoiceIdParam, setValue])

  // Pre-fill amount to the selected insurer's remaining obligation
  useEffect(() => {
    if (selectedObligation) setValue('amount', selectedObligation.remainingAmount)
  }, [selectedObligation, setValue])

  const createMutation = useMutation({
    mutationFn: (data: CreateOutgoingPaymentFormData) => createOutgoingPayment(data),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['outgoing-payment-list'] })
      queryClient.invalidateQueries({ queryKey: ['insurer-obligations', invoiceIdParam, policyIdParam] })
      success('Payment Recorded', 'The outgoing payment has been created.')
      router.push(ROUTES.outgoingPayment.detail(id))
    },
    onError: () => {
      toastError('Save failed', 'Could not create the payment. Ensure the amount does not exceed the insurer\'s share of the invoice.')
    },
  })

  const onSubmit = (data: CreateOutgoingPaymentFormData) => createMutation.mutate(data)

  const insurerOptions = (obligations ?? []).map((o) => ({
    value: o.insuranceCompanyId,
    label: `${o.insuranceCompanyName} (${o.role}, ${o.sharePercentage}%) — ${formatCurrency(o.remainingAmount, 'IDR', { compact: true })} remaining`,
  }))

  const exceedsCeiling = selectedObligation != null && watch('amount') > selectedObligation.remainingAmount

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title="New Outgoing Payment"
          description={invoice ? `Paying an insurer for ${invoice.docNumber}` : 'Record a payment to an insurance company'}
          breadcrumbs={[
            { label: 'Outgoing Payment', href: ROUTES.outgoingPayment.list },
            { label: 'New Payment' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        {invoice && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
            <Receipt size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#123d6b]">Linked to {invoice.docNumber}</p>
              <p className="text-[11px] text-[#2d6495] mt-0.5">
                Invoice total: {formatCurrency(invoice.totalAmount, invoice.currency)}
              </p>
            </div>
          </div>
        )}

        {invoiceIdParam && !policyIdParam && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#fdf2e8', border: '1px solid #f0b87a' }}>
            <AlertTriangle size={14} className="text-[#7a3800] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#7a3800]">Share ceilings unavailable</p>
              <p className="text-[11px] text-[#7a3800] mt-0.5">
                No linked Policy Placement was provided, so per-insurer share amounts can&apos;t be
                pre-computed here. Enter the insurance company and amount manually — the server
                will still enforce the share ceiling on submit.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Payment Details" columns={2}>
            <FormField label="Invoice" required className="col-span-2">
              <Input
                value={invoice?.docNumber ?? invoiceIdParam}
                readOnly
                disabled
                className="bg-[#f7f9fb] cursor-not-allowed"
              />
              <input type="hidden" {...register('invoiceId')} />
            </FormField>

            <FormField label="Insurance Company" required className="col-span-2" error={errors.insuranceCompanyId?.message}>
              {obligations && obligations.length > 0 ? (
                <Select
                  options={insurerOptions}
                  placeholder="Select insurer"
                  error={!!errors.insuranceCompanyId}
                  {...register('insuranceCompanyId')}
                />
              ) : (
                <Input
                  placeholder="Insurance company ID"
                  error={!!errors.insuranceCompanyId}
                  {...register('insuranceCompanyId')}
                  disabled={obligationsLoading}
                />
              )}
            </FormField>

            <FormField label="Payment Date" required error={errors.paymentDate?.message}>
              <Input type="date" error={!!errors.paymentDate} {...register('paymentDate')} />
            </FormField>

            <FormField
              label="Amount"
              required
              error={errors.amount?.message ?? (exceedsCeiling ? 'Amount exceeds this insurer\'s remaining share' : undefined)}
              hint={selectedObligation ? `Max: ${formatCurrency(selectedObligation.remainingAmount, 'IDR')}` : undefined}
            >
              <Input
                type="number"
                min={0}
                error={!!errors.amount || exceedsCeiling}
                {...register('amount', { valueAsNumber: true })}
              />
            </FormField>

            <FormField label="Bank Reference" className="col-span-2" hint="Optional — bank transfer reference">
              <Input {...register('bankReference')} />
            </FormField>
          </FormSection>

          <div className="h-20" />
        </form>
      </div>

      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #d5e3ef', boxShadow: '0 -4px 16px rgba(7,25,52,0.06)' }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(ROUTES.outgoingPayment.list)}>
          Cancel
        </Button>
        <Button
          variant="primary" size="sm" icon={<Save size={13} />}
          loading={createMutation.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          Record Payment
        </Button>
      </div>
    </div>
  )
}