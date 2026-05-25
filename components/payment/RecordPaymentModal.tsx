'use client'

import { useState }        from 'react'
import { useForm }         from 'react-hook-form'
import { zodResolver }     from '@hookform/resolvers/zod'
import { CreditCard }      from 'lucide-react'
import { recordPaymentSchema, type RecordPaymentFormData } from '@/lib/validations/payment'
import { BaseModal, ModalHeader, ModalBody, ModalFooter } from '@/components/modal/BaseModal'
import { Button }          from '@/components/ui/Button'
import { FormField }       from '@/components/form/FormField'
import { Input, Select }   from '@/components/ui/Input'
import { CurrencyInput }   from '@/components/form/CurrencyInput'
import { formatCurrency }  from '@/lib/format'
import type { PaymentListItem, PaymentInstallment } from '@/types/payment'

const METHOD_OPTIONS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'RTGS',          label: 'RTGS'          },
  { value: 'SWIFT',         label: 'SWIFT'         },
  { value: 'CHEQUE',        label: 'Cheque'        },
  { value: 'CASH',          label: 'Cash'          },
]

interface RecordPaymentModalProps {
  open:          boolean
  onClose:       () => void
  onSuccess:     () => void
  payment?:      PaymentListItem | null
  installment?:  PaymentInstallment | null
  isInstallment: boolean
}

export function RecordPaymentModal({
  open,
  onClose,
  onSuccess,
  payment,
  installment,
  isInstallment,
}: RecordPaymentModalProps) {
  const [isSubmitting, setSubmitting] = useState(false)

  const currency     = payment?.currency ?? 'IDR'
  const maxAmount    = isInstallment
    ? (installment?.amount ?? 0) - (installment?.paidAmount ?? 0)
    : (payment?.remainingAmount ?? 0)

  const form = useForm<RecordPaymentFormData>({
    resolver: zodResolver(recordPaymentSchema),
    defaultValues: {
      paidAmount:    maxAmount,
      paidDate:      new Date().toISOString().slice(0, 10),
      paymentMethod: 'BANK_TRANSFER',
    },
  })

  const { register, handleSubmit, formState: { errors }, setValue, reset } = form

  const onSubmit = async (data: RecordPaymentFormData) => {
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      reset()
      onSuccess()
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const title = isInstallment
    ? `Record Installment ${installment?.installmentNumber ?? ''}`
    : 'Record Payment'

  const description = isInstallment
    ? `${payment?.docNumber} — Installment ${installment?.installmentNumber}/${payment?.installmentCount}`
    : payment?.docNumber ?? ''

  return (
    <BaseModal open={open} onClose={handleClose} size="sm">
      <ModalHeader title={title} description={description} onClose={handleClose} />
      <ModalBody>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-4">

            {/* Amount summary */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: '#f7f9fb', border: '1px solid #d5e3ef' }}
            >
              <div>
                <p className="text-[10px] text-[#7a8fa3] uppercase tracking-wider">
                  {isInstallment ? 'Installment Due' : 'Outstanding Balance'}
                </p>
                <p className="text-[17px] font-bold text-[#18273a] tabular-nums">
                  {formatCurrency(maxAmount, currency)}
                </p>
              </div>
              <CreditCard size={20} className="text-[#b5cede]" strokeWidth={1.4} />
            </div>

            {/* Amount to pay */}
            <FormField
              label="Amount Paid"
              required
              error={errors.paidAmount?.message}
              hint={`Max: ${formatCurrency(maxAmount, currency)}`}
            >
              <CurrencyInput
                currency={currency}
                value={maxAmount}
                onChange={(val) => setValue('paidAmount', val, { shouldValidate: true })}
              />
            </FormField>

            {/* Payment date */}
            <FormField label="Payment Date" required error={errors.paidDate?.message}>
              <Input type="date" error={!!errors.paidDate} {...register('paidDate')} />
            </FormField>

            {/* Payment method */}
            <FormField label="Payment Method" required error={errors.paymentMethod?.message}>
              <Select
                options={METHOD_OPTIONS}
                placeholder="Select method"
                error={!!errors.paymentMethod}
                {...register('paymentMethod')}
              />
            </FormField>

            {/* Reference number */}
            <FormField
              label="Reference / Transaction Number"
              hint="Bank transfer reference or cheque number"
            >
              <Input placeholder="e.g. TRF-20250115-001" {...register('referenceNumber')} />
            </FormField>

            {/* Notes */}
            <FormField label="Notes">
              <Input placeholder="Optional payment notes" {...register('notes')} />
            </FormField>
          </div>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          loading={isSubmitting}
          icon={<CreditCard size={13} />}
          onClick={handleSubmit(onSubmit)}
        >
          Record Payment
        </Button>
      </ModalFooter>
    </BaseModal>
  )
}
