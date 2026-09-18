'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Pencil, Trash2, Ship, X } from 'lucide-react'
import { FormField } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { FormModal, ConfirmModal } from '@/components/modal/BaseModal'
import { useToast } from '@/context/ToastContext'
import { useModal } from '@/hooks/useModal'
import { quotationObjectHooks } from '@/hooks/useQuotations'
import { objectFormSchema, type ObjectFormData } from '@/lib/validations/quotationNested'
import type { QuotationObject } from '@/types/quotation'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId: string
  objects:     QuotationObject[]
  editable:    boolean
}

// `data` is a genuinely arbitrary JSON column on the backend (Prisma
// Json, z.any() on the DTO, no fixed shape anywhere in the codebase).
// Represented here as key/value text rows rather than a raw JSON
// textarea (error-prone) or an invented vessel-specific schema (not
// backed by any actual backend contract) — the smallest safe UI for
// truly arbitrary data, per Phase 3B scope.
function objectToRows(data: unknown): { key: string; value: string }[] {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
      key,
      value: value == null ? '' : String(value),
    }))
  }
  return []
}

function rowsToObject(rows: { key: string; value: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const row of rows) {
    if (row.key.trim()) out[row.key.trim()] = row.value
  }
  return out
}

export function QuotationObjectsSection({ quotationId, objects, editable }: Props) {
  const { success, error: toastError } = useToast()
  const formModal   = useModal<QuotationObject>()
  const deleteModal = useModal<QuotationObject>()

  const createMutation = quotationObjectHooks.useCreate(quotationId)
  const updateMutation = quotationObjectHooks.useUpdate(quotationId)
  const removeMutation = quotationObjectHooks.useRemove(quotationId)

  const isEditing = !!formModal.data
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<ObjectFormData>({
    resolver: zodResolver(objectFormSchema),
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'dataRows' })

  const openCreate = () => { reset({ objectType: '', dataRows: [] }); formModal.open() }
  const openEdit = (obj: QuotationObject) => {
    reset({ objectType: obj.objectType, dataRows: objectToRows(obj.data) })
    formModal.open(obj)
  }

  const onSubmit = handleSubmit((data) => {
    const payload = {
      objectType: data.objectType,
      data: data.dataRows.length > 0 ? rowsToObject(data.dataRows) : undefined,
    }
    const mutation = isEditing
      ? updateMutation.mutateAsync({ id: formModal.data!.id, payload })
      : createMutation.mutateAsync(payload)

    mutation
      .then(() => { success(isEditing ? 'Object updated' : 'Object added'); formModal.close() })
      .catch((err: ApiError) => toastError('Failed to save object', err.message))
  })

  const handleDelete = () => {
    if (!deleteModal.data) return
    removeMutation.mutate(deleteModal.data.id, {
      onSuccess: () => { success('Object deleted'); deleteModal.close() },
      onError: (err) => toastError('Failed to delete object', (err as ApiError).message),
    })
  }

  return (
    <section className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <Ship size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">Object / Risk Information</h3>
        </div>
        {editable && (
          <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={openCreate}>
            Add Object
          </Button>
        )}
      </div>
      <div className="card-body">
        {objects.length === 0 ? (
          <p className="text-[13px] text-[#b5cede]">
            No quotation objects added yet{editable && ' — click "Add Object" to add one'}.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {objects.map((obj) => (
              <div key={obj.id} className="border border-[#e3e9ef] rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#7a8fa3]">
                    {obj.objectType}
                  </p>
                  {editable && (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEdit(obj)} className="p-1.5 rounded hover:bg-[#f1f3f5] text-[#4d5966]">
                        <Pencil size={13} />
                      </button>
                      <button type="button" onClick={() => deleteModal.open(obj)} className="p-1.5 rounded hover:bg-[#fdecec] text-[#9b2020]">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
                {objectToRows(obj.data).length > 0 ? (
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {objectToRows(obj.data).map((row) => (
                      <div key={row.key}>
                        <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">{row.key}</dt>
                        <dd className="text-[13px] text-[#18273a]">{row.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="text-[13px] text-[#b5cede]">No additional data</p>
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
        title={isEditing ? 'Edit Object' : 'Add Object'}
        submitLabel={isEditing ? 'Save Changes' : 'Add Object'}
        loading={createMutation.isPending || updateMutation.isPending}
      >
        <div className="flex flex-col gap-4">
          <FormField label="Object Type" required error={errors.objectType?.message}>
            <Input placeholder="e.g. VESSEL" error={!!errors.objectType} {...register('objectType')} />
          </FormField>

          <FormField label="Additional Data">
            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input placeholder="Field name" {...register(`dataRows.${index}.key`)} />
                  <Input placeholder="Value" {...register(`dataRows.${index}.value`)} />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex-shrink-0 p-2 rounded hover:bg-[#fdecec] text-[#9b2020]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => append({ key: '', value: '' })}
              >
                Add Field
              </Button>
            </div>
          </FormField>
        </div>
      </FormModal>

      <ConfirmModal
        open={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Delete object?"
        description="This object will be permanently removed from the quotation."
        confirmLabel="Delete"
        variant="danger"
        loading={removeMutation.isPending}
      />
    </section>
  )
}