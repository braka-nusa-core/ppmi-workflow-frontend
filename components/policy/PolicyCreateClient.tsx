'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, Shield } from 'lucide-react'
import { createPolicySchema, type CreatePolicyFormData } from '@/lib/validations/policy'
import { createPolicy } from '@/lib/api/policy'
import { fetchQSDetail } from '@/lib/api/qs'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/config/routes'

export function PolicyCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  const quotationIdFromUrl = searchParams.get('quotationId') ?? ''

  // Pre-fill from an Approved/Policy-Issued QS when navigated from there
  // (same pattern as Shipment's invoiceId pre-fill from Invoice/Payment).
  const { data: qs } = useQuery({
    queryKey: ['qs-detail', quotationIdFromUrl],
    queryFn:  () => fetchQSDetail(quotationIdFromUrl),
    enabled:  !!quotationIdFromUrl,
  })

  const form = useForm<CreatePolicyFormData>({
    resolver: zodResolver(createPolicySchema),
    defaultValues: {
      quotationId:  quotationIdFromUrl,
      policyNumber: '',
      policyDate:   '',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = form

  useEffect(() => {
    if (quotationIdFromUrl) setValue('quotationId', quotationIdFromUrl, { shouldValidate: true })
  }, [quotationIdFromUrl, setValue])

  const createMutation = useMutation({
    mutationFn: (data: CreatePolicyFormData) => createPolicy(data),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['policy-list'] })
      success('Policy Created', 'The policy has been created. You can now add leader and members.')
      router.push(ROUTES.policy.detail(id))
    },
    onError: () => {
      toastError('Save failed', 'Could not create the policy. Ensure the quotation is Approved and does not already have a policy.')
    },
  })

  const onSubmit = (data: CreatePolicyFormData) => createMutation.mutate(data)

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title="New Policy"
          description={qs ? `Creating policy for ${qs.docNumber}` : 'Create a new policy placement record'}
          breadcrumbs={[
            { label: 'Policy Placement', href: ROUTES.policy.list },
            { label: 'New Policy' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        {qs && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
            <Shield size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#123d6b]">Linked to {qs.docNumber}</p>
              <p className="text-[11px] text-[#2d6495] mt-0.5">Quotation has been pre-filled. Review before submitting.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Policy Details" columns={2}>
            <FormField label="Quotation" required className="col-span-2" error={errors.quotationId?.message}>
              <Input
                value={qs?.docNumber ?? quotationIdFromUrl ?? ''}
                readOnly
                disabled
                className="bg-[#f7f9fb] cursor-not-allowed"
              />
              <input type="hidden" {...register('quotationId')} />
            </FormField>

            <FormField label="Policy Number" required error={errors.policyNumber?.message}>
              <Input placeholder="e.g. HM/2026/000123" error={!!errors.policyNumber} {...register('policyNumber')} />
            </FormField>

            <FormField label="Policy Date" required error={errors.policyDate?.message}>
              <Input type="date" error={!!errors.policyDate} {...register('policyDate')} />
            </FormField>
          </FormSection>

          <div className="h-20" />
        </form>
      </div>

      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #d5e3ef', boxShadow: '0 -4px 16px rgba(7,25,52,0.06)' }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(ROUTES.policy.list)}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={<Save size={13} />} loading={createMutation.isPending} onClick={handleSubmit(onSubmit)}>
          Create Policy
        </Button>
      </div>
    </div>
  )
}