// FILE: components/pni/sections/PniProvisionsSection.tsx
'use client'

import { useFieldArray, useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { refOf } from '@/lib/pni/refs'

interface Props {
  control:  Control<any>
  register: UseFormRegister<any>
  errors:   any
  setValue: UseFormSetValue<any>
}

const TYPE_OPTIONS = [
  { value: 'CONDITION', label: 'Condition' },
  { value: 'CLAUSE',    label: 'Clause' },
  { value: 'EXCLUSION', label: 'Exclusion' },
  { value: 'WARRANTY',  label: 'Warranty' },
]
const SOURCE_OPTIONS = [
  { value: 'PREDEFINED', label: 'Predefined' },
  { value: 'CUSTOM',     label: 'Custom' },
]
const SCOPE_OPTIONS = [
  { value: 'QUOTE',            label: 'Whole Quote' },
  { value: 'ALL_VESSELS',      label: 'All Vessels' },
  { value: 'SELECTED_VESSELS', label: 'Selected Vessels' },
]

/**
 * Provisions (PniProvision) — conditions/clauses/exclusions/
 * warranties. No Terms & Conditions catalog exists on the backend
 * (confirmed in the earlier alignment audit), so `source: PREDEFINED`
 * vs `CUSTOM` is recorded as a plain classification here — there is
 * no picker to select predefined content from; `title`/`content` are
 * always freely entered either way.
 *
 * `insuranceBlockRef` left blank = quote-level (insuranceBlockId
 * null on the backend); selecting a block scopes it to that block.
 */
export function PniProvisionsSection({ control, register, errors, setValue }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'provisions' })
  const blocks: any[] = useWatch({ control, name: 'insuranceBlocks' }) ?? []
  const vessels: any[] = useWatch({ control, name: 'vessels' }) ?? []
  const provisions: any[] = useWatch({ control, name: 'provisions' }) ?? []

  const blockOptions = blocks.map((b, i) => ({ value: refOf(b), label: b.typeOfInsurance || `Block ${i + 1}` })).filter((o) => o.value)

  return (
    <FormSection title="Provisions (Conditions / Clauses / Exclusions / Warranties)" columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No provisions added yet.</p>}
      {fields.map((field, index) => {
        const scope = provisions[index]?.scope
        const isSelectedVessels = scope === 'SELECTED_VESSELS'
        const selectedRefs: string[] = provisions[index]?.vesselRefs ?? []

        return (
          <div key={field.id} className="border border-[#e2e5e9] rounded-md p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#3a5068]">Provision {index + 1}</span>
              <button type="button" onClick={() => remove(index)} className="text-[#c0392b]" aria-label="Remove provision">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Type" required>
                <Select options={TYPE_OPTIONS} {...register(`provisions.${index}.type`)} />
              </FormField>
              <FormField label="Source">
                <Select placeholder="Custom" options={SOURCE_OPTIONS} {...register(`provisions.${index}.source`)} />
              </FormField>
              <FormField label="Applies To">
                <Select placeholder="Whole Quote" options={SCOPE_OPTIONS} {...register(`provisions.${index}.scope`, { onChange: () => setValue(`provisions.${index}.vesselRefs`, []) })} />
              </FormField>
              <FormField label="Insurance Block" hint="Leave blank for a quote-level provision" className="col-span-1">
                <Select placeholder="Quote-level" options={blockOptions} {...register(`provisions.${index}.insuranceBlockRef`)} />
              </FormField>
              <FormField label="Title" required className="col-span-2" error={errors.provisions?.[index]?.title?.message}>
                <Input error={!!errors.provisions?.[index]?.title} {...register(`provisions.${index}.title`)} />
              </FormField>
              <FormField label="Content" className="col-span-2">
                <Textarea rows={2} {...register(`provisions.${index}.content`)} />
              </FormField>
              <FormField label="Reference">
                <Input {...register(`provisions.${index}.reference`)} />
              </FormField>
            </div>
            {isSelectedVessels && (
              <FormField label="Applies To Vessels" required error={errors.provisions?.[index]?.vesselRefs?.message as string | undefined} className="mt-2">
                <div className="flex flex-wrap gap-3">
                  {vessels.length === 0 && <span className="text-xs text-[#9aa3ad]">Add vessels above first.</span>}
                  {vessels.map((v, vi) => {
                    const ref = refOf(v)
                    if (!ref) return null
                    const checked = selectedRefs.includes(ref)
                    return (
                      <label key={ref} className="flex items-center gap-1.5 text-xs text-[#3a5068]">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked ? [...selectedRefs, ref] : selectedRefs.filter((r) => r !== ref)
                            setValue(`provisions.${index}.vesselRefs`, next)
                          }}
                        />
                        {v.name || `Vessel ${vi + 1}`}
                      </label>
                    )
                  })}
                </div>
              </FormField>
            )}
          </div>
        )
      })}
      <Button type="button" variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => append({ type: 'CLAUSE', title: '' })}>
        Add Provision
      </Button>
    </FormSection>
  )
}

/** Cover Restrictions (PniCoverRestriction) — Karya's explicit "COVER RESTRICTED TO" pattern (name + Part/Section reference), quote-level or block-scoped. */
export function PniCoverRestrictionsSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'coverRestrictions' })
  const blocks: any[] = useWatch({ control, name: 'insuranceBlocks' }) ?? []
  const blockOptions = blocks.map((b, i) => ({ value: refOf(b), label: b.typeOfInsurance || `Block ${i + 1}` })).filter((o) => o.value)

  return (
    <FormSection title="Cover Restrictions" description="e.g. Compulsory Wreck Removal, Pollution Liability, Sue & Labour — leave Insurance Block blank for a quote-level restriction." columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No cover restrictions added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-6 gap-2 items-end border border-[#e2e5e9] rounded-md p-2 mb-2">
          <FormField label="Name" required className="col-span-2" error={errors.coverRestrictions?.[index]?.name?.message}>
            <Input error={!!errors.coverRestrictions?.[index]?.name} {...register(`coverRestrictions.${index}.name`)} />
          </FormField>
          <FormField label="Part Ref.">
            <Input {...register(`coverRestrictions.${index}.partReference`)} />
          </FormField>
          <FormField label="Section Ref.">
            <Input {...register(`coverRestrictions.${index}.sectionReference`)} />
          </FormField>
          <FormField label="Insurance Block">
            <Select placeholder="Quote-level" options={blockOptions} {...register(`coverRestrictions.${index}.insuranceBlockRef`)} />
          </FormField>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[#3a5068] h-9">
              <input type="checkbox" defaultChecked {...register(`coverRestrictions.${index}.isSelected`)} />
              Selected
            </label>
            <button type="button" onClick={() => remove(index)} className="text-[#c0392b]" aria-label="Remove cover restriction">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => append({ name: '', isSelected: true })}>
        Add Cover Restriction
      </Button>
    </FormSection>
  )
}