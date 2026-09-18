'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormModal, ConfirmModal } from '@/components/modal/BaseModal'
import { useToast } from '@/context/ToastContext'
import { useModal } from '@/hooks/useModal'
import { quotationCoverageHooks } from '@/hooks/useQuotations'
import { coverageFormSchema, type CoverageFormData } from '@/lib/validations/quotationNested'
import type { QuotationCoverage } from '@/types/quotation'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
  coverages:   QuotationCoverage[]
  editable:    boolean
}

function formatDecimal(value: string | null): string {
  if (value === null || value === '') return '—'
  const num = Number(value)
  return Number.isFinite(num) ? num.toLocaleString('id-ID') : value
}

function CoverageFormFields({
  register,
  errors,
}: {
  register: ReturnType<typeof useForm<CoverageFormData>>['register']
  errors: ReturnType<typeof useForm<CoverageFormData>>['formState']['errors']
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField label="Coverage Type" error={errors.coverageType?.message}>
        <Input error={!!errors.coverageType} {...register('coverageType')} />
      </FormField>
      <FormField label="Value" error={errors.value?.message}>
        <Input type="number" step="any" min={0} error={!!errors.value} {...register('value', { valueAsNumber: true })} />
      </FormField>
      <FormField label="Description" className="col-span-2" error={errors.description?.message}>
        <Textarea rows={2} error={!!errors.description} {...register('description')} />
      </FormField>
    </div>
  )
}

export function QuotationCoveragesSection({ quotationId, coverages, editable }: Props) {
  const { success, error: toastError } = useToast()
  const formModal   = useModal<QuotationCoverage>()
  const deleteModal = useModal<QuotationCoverage>()

  const createMutation = quotationCoverageHooks.useCreate(quotationId)
  const updateMutation = quotationCoverageHooks.useUpdate(quotationId)
  const removeMutation = quotationCoverageHooks.useRemove(quotationId)

  const isEditing = !!formModal.data
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CoverageFormData>({
    resolver: zodResolver(coverageFormSchema),
  })

  const openCreate = () => { reset({ coverageType: '', description: '', value: undefined }); formModal.open() }
  const openEdit = (coverage: QuotationCoverage) => {
    reset({
      coverageType: coverage.coverageType ?? '',
      description:  coverage.description ?? '',
      value:        coverage.value !== null && !Number.isNaN(Number(coverage.value)) ? Number(coverage.value) : undefined,
    })
    formModal.open(coverage)
  }

  const onSubmit = handleSubmit((data) => {
    const payload = {
      coverageType: data.coverageType || undefined,
      description:  data.description || undefined,
      value:        data.value,
    }
    const mutation = isEditing
      ? updateMutation.mutateAsync({ id: formModal.data!.id, payload })
      : createMutation.mutateAsync(payload)

    mutation
      .then(() => {
        success(isEditing ? 'Coverage updated' : 'Coverage added')
        formModal.close()
      })
      .catch((err: ApiError) => toastError('Failed to save coverage', err.message))
  })

  const handleDelete = () => {
    if (!deleteModal.data) return
    removeMutation.mutate(deleteModal.data.id, {
      onSuccess: () => { success('Coverage deleted'); deleteModal.close() },
      onError: (err) => toastError('Failed to delete coverage', (err as ApiError).message),
    })
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <Shield size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">Coverage</h3>
        </div>
        {editable && (
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={openCreate}>
            Add Coverage
          </Button>
        )}
      </div>
      <div className="card-body">
        {coverages.length === 0 ? (
          <p className="text-[13px] text-[#b5cede]">
            No coverage items added yet{editable && ' — click "Add Coverage" to add one'}.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[#eef2f6]">
            {coverages.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 items-center py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a8fa3]">Type</p>
                  <p className="text-[13px] text-[#18273a]">{c.coverageType ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a8fa3]">Description</p>
                  <p className="text-[13px] text-[#18273a]">{c.description ?? '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a8fa3]">Value</p>
                  <p className="text-[13px] text-[#18273a] font-mono">{formatDecimal(c.value)}</p>
                </div>
                {editable && (
                  <div className="flex gap-1">
                    <button type="button" onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-[#f1f3f5] text-[#4d5966]">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => deleteModal.open(c)} className="p-1.5 rounded hover:bg-[#fdecec] text-[#9b2020]">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal
        open={formModal.isOpen}
        onClose={formModal.close}
        onSubmit={onSubmit}
        title={isEditing ? 'Edit Coverage' : 'Add Coverage'}
        submitLabel={isEditing ? 'Save Changes' : 'Add Coverage'}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <CoverageFormFields register={register} errors={errors} />
      </FormModal>

      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete coverage?"
        description="This coverage item will be permanently removed from the quotation."
        confirmLabel="Delete"
        variant="danger"
        loading={removeMutation.isPending}
      />
    </section>
  )
}