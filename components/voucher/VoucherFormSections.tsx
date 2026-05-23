'use client'

import type { UseFormReturn }    from 'react-hook-form'
import type { CreateVoucherFormData } from '@/lib/validations/voucher'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { CurrencyInput }          from '@/components/form/CurrencyInput'
import { cn }                     from '@/lib/utils'

type VForm = UseFormReturn<CreateVoucherFormData>
interface SectionProps { form: VForm }

const PAYMENT_TYPE_OPTIONS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'RTGS',          label: 'RTGS (Real Time Gross Settlement)' },
  { value: 'SWIFT',         label: 'SWIFT (International Transfer)' },
  { value: 'CHEQUE',        label: 'Cheque' },
  { value: 'CASH',          label: 'Cash' },
]

// ─── 1. Voucher Information ──────────────────────────────────────
export function VoucherInfoSection({
  form,
  linkedInvoiceNumber,
  linkedQSNumber,
}: SectionProps & { linkedInvoiceNumber?: string; linkedQSNumber?: string }) {
  const { register, formState: { errors }, watch, setValue } = form

  return (
    <FormSection title="Voucher Information" description="Core voucher details and linked documents" columns={2}>
      {/* Division */}
      <FormField label="Division" required error={errors.division?.message}>
        <div className="flex gap-2">
          {(['PI', 'HM'] as const).map((d) => (
            <button
              key={d} type="button"
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

      {/* Linked Invoice */}
      <FormField label="Linked Invoice" required error={errors.invoiceId?.message}>
        {linkedInvoiceNumber ? (
          <div className="form-input flex items-center gap-2 bg-[#f7f9fb] cursor-not-allowed">
            <span className="text-[12px] font-mono text-[#123d6b] font-semibold">{linkedInvoiceNumber}</span>
            <span className="text-[11px] text-[#7a8fa3] ml-auto">Auto-linked</span>
          </div>
        ) : (
          <Input placeholder="e.g. INV-2025-0138" error={!!errors.invoiceId} {...register('invoiceId')} />
        )}
      </FormField>

      {/* Linked QS (read-only display) */}
      {linkedQSNumber && (
        <FormField label="Linked QS" hint="Auto-populated from invoice">
          <div className="form-input flex items-center gap-2 bg-[#f7f9fb] cursor-not-allowed">
            <span className="text-[12px] font-mono text-[#7a8fa3]">{linkedQSNumber}</span>
          </div>
        </FormField>
      )}

      {/* Processing Date */}
      <FormField label="Target Processing Date" hint="Requested date for payment processing">
        <Input type="date" {...register('processingDate')} />
      </FormField>
    </FormSection>
  )
}

// ─── 2. Payment Information ──────────────────────────────────────
export function VoucherPaymentSection({ form }: SectionProps) {
  const { register, formState: { errors }, watch, setValue } = form
  const currency = watch('currency') || 'IDR'

  return (
    <FormSection title="Payment Information" description="Payment method, currency, and amount" columns={2}>
      {/* Payment Type */}
      <FormField label="Payment Type" required error={errors.paymentType?.message} className="col-span-2">
        <Select
          options={PAYMENT_TYPE_OPTIONS}
          placeholder="Select payment method"
          error={!!errors.paymentType}
          {...register('paymentType')}
        />
      </FormField>

      {/* Currency toggle */}
      <FormField label="Currency" required>
        <div className="flex gap-2">
          {(['IDR', 'USD'] as const).map((c) => (
            <button
              key={c} type="button"
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

      {/* Amount */}
      <FormField label="Payment Amount" required error={errors.amount?.message}>
        <CurrencyInput
          currency={currency as 'IDR' | 'USD'}
          onChange={(val) => setValue('amount', val, { shouldValidate: true })}
        />
      </FormField>
    </FormSection>
  )
}

// ─── 3. Bank / Beneficiary Information ──────────────────────────
export function VoucherBankSection({ form }: SectionProps) {
  const { register, formState: { errors } } = form

  return (
    <FormSection title="Bank & Beneficiary Information" description="Destination account for this payment" columns={2}>
      <FormField label="Bank Name" required error={errors.bankName?.message} className="col-span-2">
        <Input placeholder="e.g. Bank Mandiri" error={!!errors.bankName} {...register('bankName')} />
      </FormField>
      <FormField label="Account Number" required error={errors.accountNumber?.message}>
        <Input placeholder="e.g. 1234-5678-9012" error={!!errors.accountNumber} {...register('accountNumber')} />
      </FormField>
      <FormField label="Beneficiary Name" required error={errors.accountName?.message}>
        <Input placeholder="e.g. PT Soechi Lines Tbk" error={!!errors.accountName} {...register('accountName')} />
      </FormField>
      <FormField label="Bank Branch">
        <Input placeholder="e.g. Jakarta Pusat — Thamrin Branch" {...register('bankBranch')} />
      </FormField>
      <FormField label="SWIFT Code" hint="Required for international SWIFT transfers">
        <Input placeholder="e.g. BMRIIDJA" {...register('swiftCode')} />
      </FormField>
    </FormSection>
  )
}

// ─── 4. Approval Information ─────────────────────────────────────
export function VoucherApprovalSection({ form }: SectionProps) {
  const { register } = form

  return (
    <FormSection title="Approval Information" description="Designated approver and instructions" columns={2}>
      <FormField label="Approval PIC" hint="Person responsible for approving this voucher" className="col-span-2">
        <Input placeholder="e.g. Dewi Rahmawati" {...register('approvalPIC')} />
      </FormField>
      <FormField label="Approval Notes" className="col-span-2">
        <Textarea
          rows={2}
          placeholder="Instructions or context for the approver..."
          {...register('approvalNotes')}
        />
      </FormField>
    </FormSection>
  )
}

// ─── 5. Notes ────────────────────────────────────────────────────
export function VoucherNotesSection({ form }: SectionProps) {
  const { register } = form
  return (
    <FormSection title="Internal Notes" description="For internal finance team use only">
      <FormField label="Notes">
        <Textarea
          rows={3}
          placeholder="Processing notes, exchange rate confirmation, treasury instructions..."
          {...register('internalNotes')}
        />
      </FormField>
    </FormSection>
  )
}
