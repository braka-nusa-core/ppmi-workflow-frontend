// FILE: components/hm/sections/HmInstallmentsSection.tsx
'use client'

import { useFieldArray, useWatch, type Control, type UseFormRegister } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface Props {
  control:  Control<any>
  register: UseFormRegister<any>
  errors:   any
}

/**
 * Installments (HmQuotationInstallment) — the H&M Word doc's 4×25%
 * schedule is a DEFAULT observed in the source, not a hard rule; the
 * backend only enforces exactly 4 rows at SUBMIT time, and only when
 * `premiumPaymentEnabled` is true (see technical-quotation-
 * validation.service.ts, mirrored in lib/validations/hm.ts). The
 * "Bisa di hapus" pattern from the Word doc is the
 * `premiumPaymentEnabled` toggle below, not a per-row delete of the
 * whole section — unchecking it means "no installment schedule for
 * this quote" without requiring the rows themselves to be removed.
 */
export function HmInstallmentsSection({ control, register, errors }: Props) {
  const { fields, append, remove } = useFieldArray({ control, name: 'installments' })
  const premiumPaymentEnabled = useWatch({ control, name: 'premiumPaymentEnabled' })
  const installmentCount = fields.length

  return (
    <FormSection title="Premium Payment" columns={1}>
      <FormField label="Premium Payment Enabled" htmlFor="premiumPaymentEnabled">
        <label className="flex items-center gap-2 h-9 text-xs text-[#3a5068]">
          <input id="premiumPaymentEnabled" type="checkbox" {...register('premiumPaymentEnabled')} />
          Show an installment schedule for this quotation
        </label>
      </FormField>

      {premiumPaymentEnabled && (
        <>
          {installmentCount > 0 && installmentCount !== 4 && (
            <p className="text-[11px] text-[#9b6a1f] bg-[#fdf6e8] border border-[#f0dfb8] rounded-md px-2 py-1">
              {installmentCount} installment{installmentCount === 1 ? '' : 's'} — exactly 4 are required before this quotation can be submitted for approval.
            </p>
          )}
          {fields.length === 0 && <p className="text-xs text-[#9aa3ad]">No installments added yet.</p>}
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-6 gap-2 items-end border border-[#e2e5e9] rounded-md p-2 mb-2">
              <FormField label="No." required error={errors.installments?.[index]?.installmentNo?.message}>
                <Input type="number" min={1} error={!!errors.installments?.[index]?.installmentNo} {...register(`installments.${index}.installmentNo`, { valueAsNumber: true })} />
              </FormField>
              <FormField label="Percentage" hint="0-100">
                <Input type="number" step="any" min={0} max={100} {...register(`installments.${index}.percentage`, { valueAsNumber: true })} />
              </FormField>
              <FormField label="Due After (days)">
                <Input type="number" min={0} {...register(`installments.${index}.dueAfterDays`, { valueAsNumber: true })} />
              </FormField>
              <FormField label="Amount">
                <Input type="number" step="any" min={0} {...register(`installments.${index}.amount`, { valueAsNumber: true })} />
              </FormField>
              <FormField label="Currency">
                <Input placeholder="USD" maxLength={3} {...register(`installments.${index}.currency`)} />
              </FormField>
              <div className="flex items-end justify-between gap-2">
                <FormField label="Due Date">
                  <Input type="date" {...register(`installments.${index}.dueDate`)} />
                </FormField>
                <button type="button" onClick={() => remove(index)} className="text-[#c0392b] h-9" aria-label="Remove installment">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Plus size={13} />}
            onClick={() => append({ installmentNo: fields.length + 1, percentage: 25 })}
          >
            Add Installment
          </Button>
        </>
      )}
    </FormSection>
  )
}