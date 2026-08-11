'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X, ClipboardList, AlertTriangle } from 'lucide-react'
import { createRfiSchema, type CreateRfiFormData } from '@/lib/validations/rfi'
import { createRfi } from '@/lib/api/rfi'
import { fetchPolicyDetail } from '@/lib/api/policy'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/config/routes'

export function RfiCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  const policyIdFromUrl = searchParams.get('policyId') ?? ''

  // Pre-fill from a completed Policy Placement, same pattern as
  // Policy's own create-from-QS pre-fill in Phase 3.
  const { data: policy } = useQuery({
    queryKey: ['policy-detail', policyIdFromUrl],
    queryFn:  () => fetchPolicyDetail(policyIdFromUrl),
    enabled:  !!policyIdFromUrl,
  })

  const form = useForm<CreateRfiFormData>({
    resolver: zodResolver(createRfiSchema),
    defaultValues: { policyId: policyIdFromUrl },
  })

  const { register, handleSubmit, formState: { errors }, setValue } = form

  useEffect(() => {
    if (policyIdFromUrl) setValue('policyId', policyIdFromUrl, { shouldValidate: true })
  }, [policyIdFromUrl, setValue])

  const createMutation = useMutation({
    mutationFn: (data: CreateRfiFormData) => createRfi(data),
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['rfi-list'] })
      success('RFI Created', 'The request has been created as a draft. Complete the checklist before submitting.')
      router.push(ROUTES.rfi.detail(id))
    },
    onError: () => {
      toastError('Save failed', 'Could not create the RFI. Ensure the policy is Placement Completed and has no other active RFI.')
    },
  })

  const onSubmit = (data: CreateRfiFormData) => createMutation.mutate(data)

  const policyNotReady = !!policy && policy.status !== 'PLACEMENT_COMPLETED' && policy.status !== 'READY_FOR_RFI'

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title="New Request For Invoice"
          description={policy ? `Creating RFI for ${policy.policyNumber}` : 'Create a new invoice request'}
          breadcrumbs={[
            { label: 'Request For Invoice', href: ROUTES.rfi.list },
            { label: 'New RFI' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        {policy && !policyNotReady && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
            <ClipboardList size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#123d6b]">Linked to {policy.policyNumber}</p>
              <p className="text-[11px] text-[#2d6495] mt-0.5">Placement has been pre-filled. Review before submitting.</p>
            </div>
          </div>
        )}

        {policy && policyNotReady && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#fdf2e8', border: '1px solid #f0b87a' }}>
            <AlertTriangle size={14} className="text-[#7a3800] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-[#7a3800]">Placement not yet completed</p>
              <p className="text-[11px] text-[#7a3800] mt-0.5">
                {policy.policyNumber} is still {policy.status.replace(/_/g, ' ').toLowerCase()}. Complete the placement (leader, members, share = 100%) before creating an RFI.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Request Details" columns={2}>
            <FormField label="Policy" required className="col-span-2" error={errors.policyId?.message}>
              <Input
                value={policy?.policyNumber ?? policyIdFromUrl ?? ''}
                readOnly
                disabled
                className="bg-[#f7f9fb] cursor-not-allowed"
              />
              <input type="hidden" {...register('policyId')} />
            </FormField>
          </FormSection>

          <div className="h-20" />
        </form>
      </div>

      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #d5e3ef', boxShadow: '0 -4px 16px rgba(7,25,52,0.06)' }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(ROUTES.rfi.list)}>
          Cancel
        </Button>
        <Button
          variant="primary" size="sm" icon={<Save size={13} />}
          loading={createMutation.isPending}
          disabled={policyNotReady}
          onClick={handleSubmit(onSubmit)}
        >
          Create RFI
        </Button>
      </div>
    </div>
  )
}