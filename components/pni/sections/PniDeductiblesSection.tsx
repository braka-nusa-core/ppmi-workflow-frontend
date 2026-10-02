// FILE: components/pni/sections/PniDeductiblesSection.tsx
'use client'

import { useFieldArray, useWatch, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { refOf } from '@/lib/pni/refs'

interface Props {
  control:   Control<any>
  register:  UseFormRegister<any>
  errors:    any
  setValue:  UseFormSetValue<any>
}

const SCOPE_OPTIONS = [
  { value: 'FLAT',             label: 'Flat (single amount)' },
  { value: 'CLAIM_CATEGORY',   label: 'Claim Category' },
  { value: 'ALL_VESSELS',      label: 'All Vessels' },
  { value: 'SELECTED_VESSELS', label: 'Selected Vessels' },
]

/**
 * Deductibles (PniDeductible) — always tied to one insurance block.
 * `claimCategory` only applies to CLAIM_CATEGORY scope; vessel
 * checkboxes only apply to SELECTED_VESSELS — matches the backend's
 * own enforced pairing (400 on any other combination), mirrored here
 * client-side by disabling the irrelevant fields rather than hiding
 * them, so a scope change never leaves stale hidden data behind.
 */
export function PniDeductiblesSection({ control, register, errors, setValue }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'deductibles' })
  const blocks: any[] = useWatch({ control, name: 'insuranceBlocks' }) ?? []
  const vessels: any[] = useWatch({ control, name: 'vessels' }) ?? []
  const deductibles: any[] = useWatch({ control, name: 'deductibles' }) ?? []

  const blockOptions = blocks.map((b, i) => ({ value: refOf(b), label: b.typeOfInsurance || `Block ${i + 1}` })).filter((o) => o.value)

  return (
    <FormSection title="Deductibles" description="Each deductible belongs to one insurance block." columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No deductibles added yet.</p>}
      {fields.map((field, index) => {
        const scope = deductibles[index]?.scope
        const isClaimCategory = scope === 'CLAIM_CATEGORY'
        const isSelectedVessels = scope === 'SELECTED_VESSELS'
        const selectedRefs: string[] = deductibles[index]?.vesselRefs ?? []

        return (
          <div key={field.id} className="border border-[#e2e5e9] rounded-md p-3 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-[#3a5068]">Deductible {index + 1}</span>
              <button type="button" onClick={() => remove(index)} className="text-[#c0392b]" aria-label="Remove deductible">
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Insurance Block" required error={errors.deductibles?.[index]?.insuranceBlockRef?.message}>
                <Select placeholder="Select block" options={blockOptions} {...register(`deductibles.${index}.insuranceBlockRef`)} />
              </FormField>
              <FormField label="Scope" required>
                <Select
                  options={SCOPE_OPTIONS}
                  {...register(`deductibles.${index}.scope`, {
                    onChange: () => setValue(`deductibles.${index}.vesselRefs`, []),
                  })}
                />
              </FormField>
              <FormField label="Claim Category" hint={!isClaimCategory ? 'Only used when scope is Claim Category' : undefined}>
                <Input placeholder="e.g. Crew, Cargo, Collision, F&FO" disabled={!isClaimCategory} {...register(`deductibles.${index}.claimCategory`)} />
              </FormField>
              <FormField label="Amount">
                <Input type="number" step="any" min={0} {...register(`deductibles.${index}.amount`, { valueAsNumber: true })} />
              </FormField>
              <FormField label="Currency">
                <Input placeholder="USD" maxLength={3} {...register(`deductibles.${index}.currency`)} />
              </FormField>
              <FormField label="Description" className="col-span-1">
                <Input {...register(`deductibles.${index}.description`)} />
              </FormField>
            </div>
            {isSelectedVessels && (
              <FormField label="Applies To Vessels" required error={errors.deductibles?.[index]?.vesselRefs?.message as string | undefined} className="mt-2">
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
                            const next = e.target.checked
                              ? [...selectedRefs, ref]
                              : selectedRefs.filter((r) => r !== ref)
                            setValue(`deductibles.${index}.vesselRefs`, next)
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
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Plus size={13} />}
        onClick={() => append({ insuranceBlockRef: '', scope: 'FLAT' })}
      >
        Add Deductible
      </Button>
    </FormSection>
  )
}