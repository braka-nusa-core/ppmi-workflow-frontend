// FILE: components/pni/sections/PniVesselsSection.tsx
'use client'

import { useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createPniKey } from '@/lib/pni/refs'

interface Props {
  control:  Control<any>
  register: UseFormRegister<any>
  errors:   any
}

/** Vessels (PniVessel) — the fleet this P&I quotation covers. Referenced by key/id from Vessel Coverages, Deductibles, and Provisions elsewhere in the form. */
export function PniVesselsSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'vessels' })

  return (
    <FormSection
      title="Vessels"
      description="At least one vessel is required. Leave Class blank for unknown, or check “N/A” for Karya's explicit dash pattern."
      columns={1}
    >
      {fields.length === 0 && (
        <p className="text-xs text-[#9aa3ad]">No vessels added yet.</p>
      )}
      {fields.map((field, index) => (
        <div key={field.id} className="border border-[#e2e5e9] rounded-md p-3 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#3a5068]">Vessel {index + 1}</span>
            <button type="button" onClick={() => remove(index)} className="text-[#c0392b]" aria-label="Remove vessel">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Name" required className="col-span-2" error={errors.vessels?.[index]?.name?.message}>
              <Input error={!!errors.vessels?.[index]?.name} {...register(`vessels.${index}.name`)} />
            </FormField>
            <FormField label="IMO Number">
              <Input {...register(`vessels.${index}.imoNumber`)} />
            </FormField>
            <FormField label="Vessel Type">
              <Input {...register(`vessels.${index}.vesselType`)} />
            </FormField>
            <FormField label="Built Year">
              <Input type="number" {...register(`vessels.${index}.builtYear`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Flag">
              <Input {...register(`vessels.${index}.flag`)} />
            </FormField>
            <FormField label="Class">
              <Input {...register(`vessels.${index}.vesselClass`)} />
            </FormField>
            <FormField label="Class N/A" htmlFor={`vessels.${index}.classNotApplicable`}>
              <label className="flex items-center gap-2 h-9 text-xs text-[#3a5068]">
                <input
                  id={`vessels.${index}.classNotApplicable`}
                  type="checkbox"
                  {...register(`vessels.${index}.classNotApplicable`)}
                />
                Not applicable (shows “-”)
              </label>
            </FormField>
            <FormField label="Gross Tonnage">
              <Input type="number" step="any" min={0} {...register(`vessels.${index}.grossTonnage`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Port of Registry">
              <Input {...register(`vessels.${index}.portOfRegistry`)} />
            </FormField>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Plus size={13} />}
        onClick={() => append({ key: createPniKey(), name: '' })}
      >
        Add Vessel
      </Button>
    </FormSection>
  )
}