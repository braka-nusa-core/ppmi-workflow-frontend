'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { CreateQSFormData } from '@/lib/validations/qs'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/form/CurrencyInput'
import { cn } from '@/lib/utils'

type QSForm = UseFormReturn<CreateQSFormData>

// ─── Shared props ────────────────────────────────────────────────
interface SectionProps { form: QSForm }

// ─── 1. Policy Information ───────────────────────────────────────
export function PolicySection({ form }: SectionProps) {
  const { register, formState: { errors }, watch, setValue } = form

  return (
    <FormSection title="Policy Information" description="Core QS classification and policy period" columns={2}>
      {/* QS Type */}
      <FormField label="QS Type" required error={errors.type?.message}>
        <div className="flex gap-2">
          {(['NEW', 'RENEW'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue('type', t, { shouldValidate: true })}
              className={cn(
                'flex-1 h-9 rounded-md text-[12px] font-semibold border transition-all duration-100',
                watch('type') === t
                  ? 'bg-[#123d6b] text-white border-[#123d6b]'
                  : 'bg-white text-[#3a5068] border-[#b5cede] hover:border-[#7a8fa3]'
              )}
            >
              {t === 'NEW' ? 'New' : 'Renewal'}
            </button>
          ))}
        </div>
      </FormField>

      {/* Division */}
      <FormField label="Division" required error={errors.division?.message}>
        <div className="flex gap-2">
          {(['PI', 'HM'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setValue('division', d, { shouldValidate: true })}
              className={cn(
                'flex-1 h-9 rounded-md text-[12px] font-semibold border transition-all duration-100',
                watch('division') === d
                  ? 'bg-[#123d6b] text-white border-[#123d6b]'
                  : 'bg-white text-[#3a5068] border-[#b5cede] hover:border-[#7a8fa3]'
              )}
            >
              {d === 'PI' ? 'P&I' : 'H&M'}
            </button>
          ))}
        </div>
      </FormField>

      {/* Effective Date */}
      <FormField label="Effective Date" required error={errors.effectiveDate?.message}>
        <Input
          type="date"
          error={!!errors.effectiveDate}
          {...register('effectiveDate')}
        />
      </FormField>

      {/* Expiry Date */}
      <FormField label="Expiry Date" required error={errors.expiryDate?.message}>
        <Input
          type="date"
          error={!!errors.expiryDate}
          {...register('expiryDate')}
        />
      </FormField>

      {/* Broker */}
      <FormField
        label="Broker / Agent"
        hint="Leave blank if direct"
        className="col-span-2"
      >
        <Input
          placeholder="e.g. Marsh Indonesia, Aon Indonesia"
          {...register('broker')}
        />
      </FormField>
    </FormSection>
  )
}

// ─── 2. Insured Information ──────────────────────────────────────
export function InsuredSection({ form }: SectionProps) {
  const { register, formState: { errors } } = form

  return (
    <FormSection title="Insured Information" description="Policy holder and contact details" columns={2}>
      <FormField label="Insured Name" required error={errors.insuredName?.message} className="col-span-2">
        <Input
          placeholder="e.g. PT Arpeni Pratama Ocean Line"
          error={!!errors.insuredName}
          {...register('insuredName')}
        />
      </FormField>

      <FormField label="Address" className="col-span-2">
        <Input
          placeholder="Company address"
          {...register('insuredAddress')}
        />
      </FormField>

      <FormField label="Contact" hint="Phone or email">
        <Input
          placeholder="+62 21 xxxxxxx"
          {...register('insuredContact')}
        />
      </FormField>
    </FormSection>
  )
}

// ─── 3. Vessel Information ───────────────────────────────────────
const VESSEL_TYPES = [
  { value: 'General Cargo',  label: 'General Cargo'  },
  { value: 'Bulk Carrier',   label: 'Bulk Carrier'   },
  { value: 'Tanker',         label: 'Tanker'         },
  { value: 'Container Ship', label: 'Container Ship' },
  { value: 'Tug Boat',       label: 'Tug Boat'       },
  { value: 'Barge',          label: 'Barge'          },
  { value: 'RORO',           label: 'RoRo'           },
  { value: 'Passenger',      label: 'Passenger'      },
  { value: 'Other',          label: 'Other'          },
]

export function VesselSection({ form }: SectionProps) {
  const { register, formState: { errors }} = form

  return (
    <FormSection title="Vessel Information" description="Details of the insured vessel" columns={2}>
      <FormField label="Vessel Name" required error={errors.vesselName?.message} className="col-span-2">
        <Input
          placeholder="e.g. MV Artha Kencana"
          error={!!errors.vesselName}
          {...register('vesselName')}
        />
      </FormField>

      <FormField label="Vessel Type">
        <Select
          options={VESSEL_TYPES}
          placeholder="Select vessel type"
          {...register('vesselType')}
        />
      </FormField>

      <FormField label="Flag State">
        <Input
          placeholder="e.g. Indonesia, Panama, Marshall Islands"
          {...register('vesselFlag')}
        />
      </FormField>

      <FormField label="GRT (Gross Register Tonnage)" hint="Numeric value">
        <Input
          type="number"
          placeholder="e.g. 12480"
          {...register('vesselGRT', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="Year Built">
        <Input
          type="number"
          placeholder="e.g. 2018"
          min={1900}
          max={new Date().getFullYear()}
          {...register('vesselBuiltYear', { valueAsNumber: true })}
        />
      </FormField>

      <FormField label="IMO Number" hint="Format: IMO 1234567">
        <Input
          placeholder="IMO XXXXXXX"
          {...register('imoNumber')}
        />
      </FormField>
    </FormSection>
  )
}

// ─── 4. Insurance Information ────────────────────────────────────
const INSURANCE_TYPES = [
  { value: 'P&I',       label: 'Protection & Indemnity (P&I)' },
  { value: 'H&M',       label: 'Hull & Machinery (H&M)'       },
  { value: 'FD&D',      label: 'Freight, Demurrage & Defence'  },
  { value: 'War Risk',  label: 'War Risk'                      },
  { value: 'Cargo',     label: 'Cargo'                         },
  { value: 'Liability', label: 'Liability'                     },
]

export function InsuranceSection({ form }: SectionProps) {
  const { register, formState: { errors }, setValue } = form

  return (
    <FormSection title="Insurance Information" description="Coverage type and scope" columns={2}>
      <FormField label="Insurance Type" required error={errors.insuranceType?.message} className="col-span-2">
        <Select
          options={INSURANCE_TYPES}
          placeholder="Select insurance type"
          error={!!errors.insuranceType}
          {...register('insuranceType')}
        />
      </FormField>

      <FormField label="Coverage Detail / Scope" className="col-span-2">
        <Textarea
          rows={3}
          placeholder="Describe the scope of coverage, conditions, and any special clauses..."
          {...register('coverageDetail')}
        />
      </FormField>

      <FormField label="Deductible" hint="Amount in selected currency">
        <CurrencyInput
          currency="USD"
          onChange={(val) => setValue('deductible', val)}
          placeholder="0"
        />
      </FormField>
    </FormSection>
  )
}

// ─── 5. Premium Information ──────────────────────────────────────
export function PremiumSection({ form }: SectionProps) {
  const { register, formState: { errors }, setValue, watch } = form
  const currency = watch('currency') || 'IDR'

  return (
    <FormSection title="Premium Information" description="Currency, rate, and final premium amount" columns={2}>
      {/* Currency toggle */}
      <FormField label="Currency" required>
        <div className="flex gap-2">
          {(['IDR', 'USD'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('currency', c, { shouldValidate: true })}
              className={cn(
                'flex-1 h-9 rounded-md text-[12px] font-semibold border transition-all duration-100',
                currency === c
                  ? 'bg-[#123d6b] text-white border-[#123d6b]'
                  : 'bg-white text-[#3a5068] border-[#b5cede] hover:border-[#7a8fa3]'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </FormField>

      {/* Premium amount */}
      <FormField label="Premium Amount" required error={errors.premiumAmount?.message}>
        <CurrencyInput
          currency={currency as 'IDR' | 'USD'}
          onChange={(val) => setValue('premiumAmount', val, { shouldValidate: true })}
          placeholder={currency === 'IDR' ? '0' : '0.00'}
        />
      </FormField>

      {/* Exchange rate — only if USD */}
      {currency === 'USD' && (
        <FormField
          label="Exchange Rate (USD to IDR)"
          hint="Used for IDR equivalent calculation"
        >
          <Input
            type="number"
            placeholder="e.g. 15850"
            {...register('exchangeRate', { valueAsNumber: true })}
          />
        </FormField>
      )}
    </FormSection>
  )
}

// ─── 6. Internal Notes ───────────────────────────────────────────
export function NotesSection({ form }: SectionProps) {
  const { register } = form

  return (
    <FormSection title="Internal Notes" description="For internal use only — not visible to clients">
      <FormField label="Notes">
        <Textarea
          rows={4}
          placeholder="Internal remarks, special instructions, reference to previous policies, broker communication notes..."
          {...register('internalNotes')}
        />
      </FormField>
    </FormSection>
  )
}
