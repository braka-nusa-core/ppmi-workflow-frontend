// FILE: components/pni/sections/PniInsuranceBlocksSection.tsx
'use client'

import { useFieldArray, useWatch, type Control, type UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createPniKey, refOf } from '@/lib/pni/refs'

interface Props {
  control:  Control<any>
  register: UseFormRegister<any>
  errors:   any
}

const PREMIUM_BASIS_OPTIONS = [
  { value: 'PER_ANNUM',                     label: 'Per Annum' },
  { value: 'PER_VESSEL_PER_ANNUM',          label: 'Per Vessel, Per Annum' },
  { value: 'PRO_RATA',                      label: 'Pro Rata' },
  { value: 'INCLUDED_NO_ADDITIONAL_CHARGE', label: 'Included, No Additional Charge' },
  { value: 'OTHER',                         label: 'Other' },
]

/**
 * Insurance Blocks (PniInsuranceBlock) — one or more per quote. Doc 3
 * (Karya)'s "War Protection and Indemnity Cover" as a distinct,
 * separately-priced (or zero-priced) block deferring to another block
 * is represented here via `inheritsFromBlockRef`, not a hardcoded
 * "War P&I" concept — any block can inherit from any other.
 */
export function PniInsuranceBlocksSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'insuranceBlocks' })
  const blocks: any[] = useWatch({ control, name: 'insuranceBlocks' }) ?? []

  const blockOptions = (excludeIndex: number) =>
    blocks
      .map((b, i) => ({ ref: refOf(b), label: b.typeOfInsurance || `Block ${i + 1}`, i }))
      .filter((b) => b.i !== excludeIndex && b.ref)
      .map((b) => ({ value: b.ref, label: b.label }))

  return (
    <FormSection
      title="Insurance Blocks"
      description="At least one block is required (e.g. the main P&I cover). Add another block for a rider such as War P&I, optionally inheriting terms from an existing block."
      columns={1}
    >
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No insurance blocks added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="border border-[#e2e5e9] rounded-md p-3 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-[#3a5068]">Block {index + 1}</span>
            <button type="button" onClick={() => remove(index)} className="text-[#c0392b]" aria-label="Remove block">
              <Trash2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Type of Insurance"
              required
              className="col-span-2"
              error={errors.insuranceBlocks?.[index]?.typeOfInsurance?.message}
            >
              <Input
                placeholder="e.g. Protection & Indemnity for Shipowners - Class 1"
                error={!!errors.insuranceBlocks?.[index]?.typeOfInsurance}
                {...register(`insuranceBlocks.${index}.typeOfInsurance`)}
              />
            </FormField>
            <FormField label="Security">
              <Input {...register(`insuranceBlocks.${index}.security`)} />
            </FormField>
            <FormField label="Policy Wording Reference">
              <Input {...register(`insuranceBlocks.${index}.policyWordingReference`)} />
            </FormField>
            <FormField label="Trading Area">
              <Input {...register(`insuranceBlocks.${index}.tradingArea`)} />
            </FormField>
            <FormField label="Inherits From Block" hint="Defers terms to another block — e.g. a War P&I rider deferring to the main cover.">
              <Select
                placeholder="None"
                options={blockOptions(index)}
                {...register(`insuranceBlocks.${index}.inheritsFromBlockRef`)}
              />
            </FormField>
            <FormField label="Payment Warranty Text" className="col-span-2">
              <Input {...register(`insuranceBlocks.${index}.paymentWarrantyText`)} />
            </FormField>
            <FormField label="Maximum Insured">
              <Input type="number" step="any" min={0} {...register(`insuranceBlocks.${index}.maximumInsured`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Currency">
              <Input placeholder="USD" maxLength={3} {...register(`insuranceBlocks.${index}.currency`)} />
            </FormField>
            <FormField label="Premium" hint="Can be 0 — e.g. a rider included at no additional charge.">
              <Input type="number" step="any" min={0} {...register(`insuranceBlocks.${index}.premium`, { valueAsNumber: true })} />
            </FormField>
            <FormField label="Premium Basis">
              <Select placeholder="Per Annum" options={PREMIUM_BASIS_OPTIONS} {...register(`insuranceBlocks.${index}.premiumBasis`)} />
            </FormField>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        size="sm"
        icon={<Plus size={13} />}
        onClick={() => append({ key: createPniKey(), typeOfInsurance: '' })}
      >
        Add Insurance Block
      </Button>
    </FormSection>
  )
}

/** Vessel Coverages (PniVesselCoverage) — pairs a vessel with an insurance block, with a per-pair premium/limit. Kept as its own top-level array (matching the backend's flat `vesselCoverages[]` payload shape) rather than nested under either side. */
export function PniVesselCoveragesSection({ control, register }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'vesselCoverages' })
  const vessels: any[] = useWatch({ control, name: 'vessels' }) ?? []
  const blocks: any[] = useWatch({ control, name: 'insuranceBlocks' }) ?? []

  const vesselOptions = vessels.map((v, i) => ({ value: refOf(v), label: v.name || `Vessel ${i + 1}` })).filter((o) => o.value)
  const blockOptions = blocks.map((b, i) => ({ value: refOf(b), label: b.typeOfInsurance || `Block ${i + 1}` })).filter((o) => o.value)

  return (
    <FormSection title="Vessel Coverages" description="Which vessel(s) each insurance block covers, and at what per-vessel premium/limit." columns={1}>
      {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No vessel coverages added yet.</p>}
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-5 gap-2 items-end border border-[#e2e5e9] rounded-md p-2 mb-2">
          <FormField label="Vessel">
            <Select placeholder="Select vessel" options={vesselOptions} {...register(`vesselCoverages.${index}.vesselRef`)} />
          </FormField>
          <FormField label="Insurance Block">
            <Select placeholder="Select block" options={blockOptions} {...register(`vesselCoverages.${index}.insuranceBlockRef`)} />
          </FormField>
          <FormField label="Annual Premium">
            <Input type="number" step="any" min={0} {...register(`vesselCoverages.${index}.annualPremium`, { valueAsNumber: true })} />
          </FormField>
          <FormField label="Limit Amount">
            <Input type="number" step="any" min={0} {...register(`vesselCoverages.${index}.limitAmount`, { valueAsNumber: true })} />
          </FormField>
          <button type="button" onClick={() => remove(index)} className="text-[#c0392b] h-9" aria-label="Remove vessel coverage">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => append({ vesselRef: '', insuranceBlockRef: '' })}>
        Add Vessel Coverage
      </Button>
    </FormSection>
  )
}