'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, BookOpen } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormModal, ConfirmModal } from '@/components/modal/BaseModal'
import { useToast } from '@/context/ToastContext'
import { useModal } from '@/hooks/useModal'
import { quotationTermHooks } from '@/hooks/useQuotations'
import { termFormSchema, type TermFormData } from '@/lib/validations/quotationNested'
import type { QuotationTerm } from '@/types/quotation'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
  terms:       QuotationTerm[]
  editable:    boolean
}

export function QuotationTermsSection({ quotationId, terms, editable }: Props) {
  const { success, error: toastError } = useToast()
  const formModal   = useModal<QuotationTerm>()
  const deleteModal = useModal<QuotationTerm>()

  const createMutation = quotationTermHooks.useCreate(quotationId)
  const updateMutation = quotationTermHooks.useUpdate(quotationId)
  const removeMutation = quotationTermHooks.useRemove(quotationId)

  const isEditing = !!formModal.data
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TermFormData>({
    resolver: zodResolver(termFormSchema),
  })

  const openCreate = () => { reset({ description: '' }); formModal.open() }
  const openEdit = (term: QuotationTerm) => {
    reset({ description: term.description ?? '' })
    formModal.open(term)
  }

  const onSubmit = handleSubmit((data) => {
    // termsConditionId is deliberately never sent — no backend
    // master-data endpoint exists to select a valid one (see
    // lib/validations/quotationNested.ts).
    const payload = { description: data.description || undefined }
    const mutation = isEditing
      ? updateMutation.mutateAsync({ id: formModal.data!.id, payload })
      : createMutation.mutateAsync(payload)

    mutation
      .then(() => { success(isEditing ? 'Term updated' : 'Term added'); formModal.close() })
      .catch((err: ApiError) => toastError('Failed to save term', err.message))
  })

  const handleDelete = () => {
    if (!deleteModal.data) return
    removeMutation.mutate(deleteModal.data.id, {
      onSuccess: () => { success('Term deleted'); deleteModal.close() },
      onError: (err) => toastError('Failed to delete term', (err as ApiError).message),
    })
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <BookOpen size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">Terms & Conditions</h3>
        </div>
        {editable && (
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={openCreate}>
            Add Term
          </Button>
        )}
      </div>
      <div className="card-body">
        {terms.length === 0 ? (
          <p className="text-[13px] text-[#b5cede]">
            No terms added yet{editable && ' — click "Add Term" to add one'}.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#eef2f6]">
            {terms.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                <span className="text-[13px] text-[#18273a]">
                  {t.termsCondition?.name && <span className="font-medium">{t.termsCondition.name}: </span>}
                  {t.description ?? <span className="text-[#b5cede]">—</span>}
                </span>
                {editable && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button type="button" onClick={() => openEdit(t)} className="p-1.5 rounded hover:bg-[#f1f3f5] text-[#4d5966]">
                      <Pencil size={13} />
                    </button>
                    <button type="button" onClick={() => deleteModal.open(t)} className="p-1.5 rounded hover:bg-[#fdecec] text-[#9b2020]">
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
        title={isEditing ? 'Edit Term' : 'Add Term'}
        submitLabel={isEditing ? 'Save Changes' : 'Add Term'}
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
        title="Delete term?"
        description="This term will be permanently removed from the quotation."
        confirmLabel="Delete"
        variant="danger"
        loading={removeMutation.isPending}
      />
    </section>
  )
}