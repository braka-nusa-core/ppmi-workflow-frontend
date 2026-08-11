'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, X } from 'lucide-react'
import { updateRfiSchema, type UpdateRfiFormData } from '@/lib/validations/rfi'
import { fetchRfiDetail, updateRfi } from '@/lib/api/rfi'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { useToast } from '@/context/ToastContext'
import { ROUTES } from '@/config/routes'

interface RfiEditClientProps {
  id: string
}

export function RfiEditClient({ id }: RfiEditClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()

  const { data: rfi, isLoading, isError, refetch } = useQuery({
    queryKey: ['rfi-detail', id],
    queryFn:  () => fetchRfiDetail(id),
  })

  const form = useForm<UpdateRfiFormData>({
    resolver: zodResolver(updateRfiSchema),
    defaultValues: { policyId: '' },
  })

  const { register, handleSubmit, reset, formState: { errors } } = form

  useEffect(() => {
    if (rfi) reset({ policyId: rfi.policyId })
  }, [rfi, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRfiFormData) => updateRfi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfi-detail', id] })
      queryClient.invalidateQueries({ queryKey: ['rfi-list'] })
      success('RFI Updated', 'The request has been updated successfully.')
      router.push(ROUTES.rfi.detail(id))
    },
    onError: () => {
      toastError('Save failed', 'Could not update the RFI. This may no longer be editable once submitted to Finance.')
    },
  })

  const onSubmit = (data: UpdateRfiFormData) => updateMutation.mutate(data)

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !rfi) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState message="Failed to load RFI" description="The request record could not be loaded." onRetry={() => refetch()} />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit RFI ${rfi.id}`}
          breadcrumbs={[
            { label: 'Request For Invoice', href: ROUTES.rfi.list },
            { label: rfi.id, href: ROUTES.rfi.detail(id) },
            { label: 'Edit' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormSection title="Request Details" columns={2}>
            <FormField label="Policy" className="col-span-2">
              <Input value={rfi.policyNumber ?? rfi.policyId} readOnly disabled className="bg-[#f7f9fb] cursor-not-allowed" />
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
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(ROUTES.rfi.detail(id))}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" icon={<Save size={13} />} loading={updateMutation.isPending} onClick={handleSubmit(onSubmit)}>
          Save Changes
        </Button>
      </div>
    </div>
  )
}