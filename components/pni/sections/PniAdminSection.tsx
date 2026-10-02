// FILE: components/pni/sections/PniAdminSection.tsx
'use client'

import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  control:  Control<any>
  register: UseFormRegister<any>
  errors:   any
}

/** Installments (PniInstallment) — payment schedule for this quote. */
export function PniInstallmentsSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'installments' })
  return (
    <FormSection title="Installments" columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No installments added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-5 gap-2 items-end border border-[#e2e5e9] rounded-md p-2 mb-2">
          <FormField label="No." required error={errors.installments?.[index]?.installmentNo?.message}>
            <Input type="number" min={1} error={!!errors.installments?.[index]?.installmentNo} {...register(`installments.${index}.installmentNo`, { valueAsNumber: true })} />
          </FormField>
          <FormField label="Amount">
            <Input type="number" step="any" min={0} {...register(`installments.${index}.amount`, { valueAsNumber: true })} />
          </FormField>
          <FormField label="Currency">
            <Input placeholder="USD" maxLength={3} {...register(`installments.${index}.currency`)} />
          </FormField>
          <FormField label="Due Date">
            <Input type="date" {...register(`installments.${index}.dueDate`)} />
          </FormField>
          <button type="button" onClick={() => remove(index)} className="text-[#c0392b] h-9" aria-label="Remove installment">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => append({ installmentNo: fields.length + 1 })}>
        Add Installment
      </Button>
    </FormSection>
  )
}

/** Required Documents (PniRequiredDocument) — e.g. Certificate of Registry, Crew Contracts, Class Certificate. */
export function PniRequiredDocumentsSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'requiredDocuments' })
  return (
    <FormSection title="Required Documents" columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No required documents added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-4 gap-2 items-end border border-[#e2e5e9] rounded-md p-2 mb-2">
          <FormField label="Name" required className="col-span-2" error={errors.requiredDocuments?.[index]?.name?.message}>
            <Input error={!!errors.requiredDocuments?.[index]?.name} {...register(`requiredDocuments.${index}.name`)} />
          </FormField>
          <label className="flex items-center gap-1.5 text-xs text-[#3a5068] h-9">
            <input type="checkbox" defaultChecked {...register(`requiredDocuments.${index}.isRequired`)} />
            Required
          </label>
          <button type="button" onClick={() => remove(index)} className="text-[#c0392b] h-9" aria-label="Remove document">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => append({ name: '', isRequired: true })}>
        Add Required Document
      </Button>
    </FormSection>
  )
}

/** Organization Roles (PniOrganizationRole) — e.g. "PT. X as Manager", "PT. Y as Registered Owner" (Bhina's pattern). */
export function PniOrganizationRolesSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'organizationRoles' })
  return (
    <FormSection title="Organization Roles" columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No organization roles added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-4 gap-2 items-end border border-[#e2e5e9] rounded-md p-2 mb-2">
          <FormField label="Organization" className="col-span-2">
            <Input {...register(`organizationRoles.${index}.organization`)} />
          </FormField>
          <FormField label="Role" required error={errors.organizationRoles?.[index]?.role?.message}>
            <Input placeholder="e.g. Manager, Registered Owner" error={!!errors.organizationRoles?.[index]?.role} {...register(`organizationRoles.${index}.role`)} />
          </FormField>
          <button type="button" onClick={() => remove(index)} className="text-[#c0392b] h-9" aria-label="Remove organization role">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => append({ role: '' })}>
        Add Organization Role
      </Button>
    </FormSection>
  )
}