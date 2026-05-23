'use client'

import type { UseFormReturn }    from 'react-hook-form'
import type { CreateInvoiceFormData } from '@/lib/validations/invoice'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Textarea } from '@/components/ui/Input'
import { CurrencyInput }          from '@/components/form/CurrencyInput'
import { cn }                     from '@/lib/utils'

type InvForm = UseFormReturn<CreateInvoiceFormData>
interface SectionProps { form: InvForm }

// const PAYMENT_TERMS_OPTIONS = [
//   { value: 'NET_14',  label: 'Net 14 days'  },
//   { value: 'NET_30',  label: 'Net 30 days'  },
//   { value: 'NET_45',  label: 'Net 45 days'  },
//   { value: 'NET_60',  label: 'Net 60 days'  },
//   { value: 'CUSTOM',  label: 'Custom terms' },
// ]

// ─── 1. Invoice Information ──────────────────────────────────────
export function InvoiceInfoSection({ form, linkedQSNumber }: SectionProps & { linkedQSNumber?: string }) {
  const { register, formState: { errors }, watch, setValue } = form

  return (
    <FormSection title="Invoice Information" description="Core invoice details and policy period" columns={2}>
      {/* Division toggle */}
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

      {/* Linked QS — read-only if from QS flow */}
      <FormField label="Linked QS Reference" required error={errors.qsId?.message}>
        {linkedQSNumber ? (
          <div className="form-input flex items-center gap-2 bg-[#f7f9fb] cursor-not-allowed">
            <span className="text-[12px] font-mono text-[#123d6b] font-semibold">{linkedQSNumber}</span>
            <span className="text-[11px] text-[#7a8fa3] ml-auto">Auto-linked</span>
          </div>
        ) : (
          <Input
            placeholder="e.g. QS-2025-0143"
            error={!!errors.qsId}
            {...register('qsId')}
          />
        )}
      </FormField>

      <FormField label="Issue Date" required error={errors.issueDate?.message}>
        <Input type="date" error={!!errors.issueDate} {...register('issueDate')} />
      </FormField>

      <FormField label="Due Date" required error={errors.dueDate?.message}>
        <Input type="date" error={!!errors.dueDate} {...register('dueDate')} />
      </FormField>
    </FormSection>
  )
}

// ─── 2. Billing Information ──────────────────────────────────────
export function BillingInfoSection({ form }: SectionProps) {
  const { register, formState: { errors } } = form
  return (
    <FormSection title="Billing Information" description="Insured details and billing address" columns={2}>
      <FormField label="Insured Name" required error={errors.insuredName?.message} className="col-span-2">
        <Input
          placeholder="e.g. PT Soechi Lines Tbk"
          error={!!errors.insuredName}
          {...register('insuredName')}
        />
      </FormField>
      <FormField label="Vessel Name">
        <Input placeholder="e.g. MV Soechi Cilacap" {...register('vesselName')} />
      </FormField>
      <FormField label="Billing Contact">
        <Input placeholder="+62 21 xxxxxxx" {...register('billingContact')} />
      </FormField>
      <FormField label="Billing Address" className="col-span-2">
        <Input placeholder="Full billing address" {...register('billingAddress')} />
      </FormField>
    </FormSection>
  )
}

// ─── 3. Payment / Financial Information ─────────────────────────
export function PaymentInfoSection({ form }: SectionProps) {
  const { register, formState: { errors }, watch, setValue } = form
  const currency  = watch('currency') || 'IDR'
  const subtotal  = watch('subtotal')  || 0
  const taxRate   = watch('taxRate')   || 0
  const discount  = watch('discount')  || 0
  const taxAmount = (subtotal * taxRate) / 100
  const total     = subtotal + taxAmount - discount

  return (
    <FormSection title="Payment Information" description="Amount, tax, and payment terms" columns={2}>
      {/* Currency */}
      <FormField label="Currency" required className="col-span-2">
        <div className="flex gap-2">
          {(['IDR', 'USD'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('currency', c, { shouldValidate: true })}
              className={cn(
                'w-24 h-9 rounded-md text-[12px] font-semibold border transition-all duration-100',
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

      {/* Subtotal */}
      <FormField label="Invoice Amount (Subtotal)" required error={errors.subtotal?.message}>
        <CurrencyInput
          currency={currency as 'IDR' | 'USD'}
          onChange={(val) => setValue('subtotal', val, { shouldValidate: true })}
        />
      </FormField>

      {/* Tax Rate */}
      <FormField label="Tax Rate (%)" hint="e.g. 11 for PPN 11%">
        <Input
          type="number"
          step="0.1"
          min="0"
          max="100"
          placeholder="0"
          {...register('taxRate', { valueAsNumber: true })}
        />
      </FormField>

      {/* Discount */}
      <FormField label="Discount" hint="Optional deduction">
        <CurrencyInput
          currency={currency as 'IDR' | 'USD'}
          onChange={(val) => setValue('discount', val)}
        />
      </FormField>

      {/* Total preview */}
      {subtotal > 0 && (
        <div className="col-span-2 flex items-center justify-between px-4 py-3 rounded-lg bg-[#f7f9fb] border border-[#d5e3ef]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-12">
              <span className="text-[11px] text-[#7a8fa3]">Subtotal</span>
              <span className="text-[12px] text-[#18273a] tabular-nums font-medium">
                {currency} {subtotal.toLocaleString()}
              </span>
            </div>
            {taxRate > 0 && (
              <div className="flex items-center justify-between gap-12">
                <span className="text-[11px] text-[#7a8fa3]">Tax ({taxRate}%)</span>
                <span className="text-[12px] text-[#18273a] tabular-nums font-medium">
                  {currency} {taxAmount.toLocaleString()}
                </span>
              </div>
            )}
            {discount > 0 && (
              <div className="flex items-center justify-between gap-12">
                <span className="text-[11px] text-[#7a8fa3]">Discount</span>
                <span className="text-[12px] text-[#8c1f1f] tabular-nums font-medium">
                  − {currency} {discount.toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <div className="text-right border-l border-[#d5e3ef] pl-4">
            <p className="text-[10px] text-[#7a8fa3] uppercase tracking-wider mb-0.5">Total</p>
            <p className="text-[17px] font-bold text-[#123d6b] tabular-nums">
              {currency} {total.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Payment Terms */}
      <FormField label="Payment Terms" className="col-span-2">
        <Textarea
          rows={2}
          placeholder="e.g. Payment due within 30 days of invoice date. Late payment subject to 1.5% monthly interest."
          {...register('paymentTerms')}
        />
      </FormField>
    </FormSection>
  )
}

// ─── 4. Bank Information ─────────────────────────────────────────
export function BankInfoSection({ form }: SectionProps) {
  const { register } = form

  return (
    <FormSection title="Bank Information" description="Payment destination for this invoice" columns={2}>
      <FormField label="Bank Name" required className="col-span-2">
        <Input placeholder="e.g. Bank Mandiri" {...register('bankInfo.bankName')} />
      </FormField>
      <FormField label="Account Number" required>
        <Input placeholder="e.g. 1234-5678-9012" {...register('bankInfo.accountNumber')} />
      </FormField>
      <FormField label="Account Name" required>
        <Input placeholder="e.g. PT Pandi Proteksi Marine Indonesia" {...register('bankInfo.accountName')} />
      </FormField>
      <FormField label="Bank Branch">
        <Input placeholder="e.g. Jakarta Pusat — Thamrin Branch" {...register('bankInfo.bankBranch')} />
      </FormField>
      <FormField label="SWIFT Code" hint="For international transfers">
        <Input placeholder="e.g. BMRIIDJA" {...register('bankInfo.swiftCode')} />
      </FormField>
    </FormSection>
  )
}

// ─── 5. Notes ────────────────────────────────────────────────────
export function InvoiceNotesSection({ form }: SectionProps) {
  const { register } = form
  return (
    <FormSection title="Internal Notes" description="For internal use only — not included in issued invoice">
      <FormField label="Notes">
        <Textarea
          rows={3}
          placeholder="Internal remarks, payment instructions, follow-up notes..."
          {...register('internalNotes')}
        />
      </FormField>
    </FormSection>
  )
}
