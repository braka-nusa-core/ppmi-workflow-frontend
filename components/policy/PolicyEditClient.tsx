'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X } from 'lucide-react'
import { updatePolicySchema, type UpdatePolicyFormData } from '@/lib/validations/policy'
import { fetchPolicyDetail, updatePolicy } from '@/lib/api/policy'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/config/routes'

interface PolicyEditClientProps {
  id: string
}

export function PolicyEditClient({ id }: PolicyEditClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()

  const { data: policy, isLoading, isError, refetch } = useQuery({
    queryKey: ['policy-detail', id],
    queryFn:  () => fetchPolicyDetail(id),
  })

  const form = useForm<UpdatePolicyFormData>({
    resolver: zodResolver(updatePolicySchema),
    defaultValues: { quotationId: '', policyNumber: '', policyDate: '' },
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  useEffect(() => {
    if (policy) {
      reset({
        quotationId:  policy.quotationId,
        policyNumber: policy.policyNumber,
        policyDate:   policy.policyDate,
      })
    }
  }, [policy, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdatePolicyFormData) => updatePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['policy-list'] })
      success('Policy Updated', 'The policy has been updated successfully.')
      router.push(ROUTES.policy.detail(id))
    },
    onError: () => {
      toastError('Save failed', 'Could not update the policy. This may no longer be editable once Ready For RFI.')
    },
  })

  const onSubmit = (data: UpdatePolicyFormData) => updateMutation.mutate(data)

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !policy) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState message="Failed to load policy" description="The policy record could not be loaded." onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit ${policy.policyNumber}`}
          breadcrumbs={[
            { label: 'Policy Placement', href: ROUTES.policy.list },
            { label: policy.policyNumber, href: ROUTES.policy.detail(id) },
            { label: 'Edit' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Policy Details" columns={2}>
            <FormField label="Quotation" className="col-span-2">
              <Input value={policy.quotationNumber ?? policy.quotationId} readOnly disabled className="bg-[#f7f9fb] cursor-not-allowed" />
              <input type="hidden" {...register('quotationId')} />
            </FormField>

            <FormField label="Policy Number" required error={errors.policyNumber?.message}>
              <Input error={!!errors.policyNumber} {...register('policyNumber')} />
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
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(ROUTES.policy.detail(id))}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={<Save size={13} />} loading={updateMutation.isPending} onClick={handleSubmit(onSubmit)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}