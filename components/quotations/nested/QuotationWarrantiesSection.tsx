'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, ShieldCheck } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormModal, ConfirmModal } from '@/components/modal/BaseModal'
import { useToast } from '@/context/ToastContext'
import { useModal } from '@/hooks/useModal'
import { quotationWarrantyHooks } from '@/hooks/useQuotations'
import { warrantyFormSchema, type WarrantyFormData } from '@/lib/validations/quotationNested'
import type { QuotationWarranty } from '@/types/quotation'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
  warranties:  QuotationWarranty[]
  editable:    boolean
}

export function QuotationWarrantiesSection({ quotationId, warranties, editable }: Props) {
  const { success, error: toastError } = useToast()
  const formModal   = useModal<QuotationWarranty>()
  const deleteModal = useModal<QuotationWarranty>()

  const createMutation = quotationWarrantyHooks.useCreate(quotationId)
  const updateMutation = quotationWarrantyHooks.useUpdate(quotationId)
  const removeMutation = quotationWarrantyHooks.useRemove(quotationId)

  const isEditing = !!formModal.data
  const { register, handleSubmit, reset, formState: { errors } } = useForm<WarrantyFormData>({
    resolver: zodResolver(warrantyFormSchema),
  })

  const openCreate = () => { reset({ description: '' }); formModal.open() }
  const openEdit = (warranty: QuotationWarranty) => {
    reset({ description: warranty.description ?? '' })
    formModal.open(warranty)
  }

  const onSubmit = handleSubmit((data) => {
    // warrantyId is deliberately never sent — no backend master-data
    // endpoint exists to select a valid one (see
    // lib/validations/quotationNested.ts).
    const payload = { description: data.description || undefined }
    const mutation = isEditing
      ? updateMutation.mutateAsync({ id: formModal.data!.id, payload })
      : createMutation.mutateAsync(payload)

    mutation
      .then(() => { success(isEditing ? 'Warranty updated' : 'Warranty added'); formModal.close() })
      .catch((err: ApiError) => toastError('Failed to save warranty', err.message))
  })

  const handleDelete = () => {
    if (!deleteModal.data) return
    removeMutation.mutate(deleteModal.data.id, {
      onSuccess: () => { success('Warranty deleted'); deleteModal.close() },
      onError: (err) => toastError('Failed to delete warranty', (err as ApiError).message),
    })
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <ShieldCheck size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">Warranties</h3>
        </div>
        {editable && (
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={openCreate}>
            Add Warranty
          </Button>
        )}
      </div>
      <div className="card-body">
        {warranties.length === 0 ? (
          <p className="text-[13px] text-[#b5cede]">
            No warranties added yet{editable && ' — click "Add Warranty" to add one'}.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#eef2f6]">
            {warranties.map((w) => (
              <li key={w.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-[#18273a]">
                  {w.warranty?.name && <span className="font-medium">{w.warranty.name}: </span>}
                  {w.description ?? <span className="text-[#b5cede]">—</span>}
                </span>
                {editable && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button type="button" onClick={() => openEdit(w)} className="p-1.5 rounded hover:bg-[#f1f3f5] text-[#4d5966]">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => deleteModal.open(w)} className="p-1.5 rounded hover:bg-[#fdecec] text-[#9b2020]">
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <FormModal
        open={formModal.isOpen}
        onClose={formModal.close}
        onSubmit={onSubmit}
        title={isEditing ? 'Edit Warranty' : 'Add Warranty'}
        submitLabel={isEditing ? 'Save Changes' : 'Add Warranty'}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <FormField label="Description" error={errors.description?.message}>
          <Textarea rows={3} error={!!errors.description} {...register('description')} />
        </FormField>
      </FormModal>

      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete warranty?"
        description="This warranty will be permanently removed from the quotation."
        confirmLabel="Delete"
        variant="danger"
        loading={removeMutation.isPending}
      />
    </section>
  )
}