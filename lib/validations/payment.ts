import { z } from 'zod'

const paymentMethodEnum = z.enum(
  ['BANK_TRANSFER', 'RTGS', 'SWIFT', 'CHEQUE', 'CASH'],
  { required_error: 'Payment method is required' }
)

export const recordPaymentSchema = z.object({
  paidAmount:      z.number({ invalid_type_error: 'Amount is required' }).min(1, 'Amount must be greater than 0'),
  paidDate:        z.string().min(1, 'Payment date is required'),
  paymentMethod:   paymentMethodEnum,
  referenceNumber: z.string().optional(),
  notes:           z.string().optional(),
})

export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>

export const recordInstallmentSchema = z.object({
  paidAmount:      z.number({ invalid_type_error: 'Amount is required' }).min(1, 'Amount must be greater than 0'),
  paidDate:        z.string().min(1, 'Payment date is required'),
  paymentMethod:   paymentMethodEnum,
  referenceNumber: z.string().optional(),
  notes:           z.string().optional(),
})

export type RecordInstallmentFormData = z.infer<typeof recordInstallmentSchema>

export const createPaymentSchema = z.object({
  voucherId:     z.string().min(1, 'Voucher is required'),
  division:      z.enum(['PI', 'HM'], { required_error: 'Division is required' }),
  currency:      z.enum(['IDR', 'USD']),
  totalAmount:   z.number({ invalid_type_error: 'Amount is required' }).min(1, 'Amount must be greater than 0'),
  dueDate:       z.string().min(1, 'Due date is required'),
  isInstallment: z.boolean(),
  installmentCount: z.number().min(2).max(24).optional(),
  internalNotes: z.string().optional(),
}).refine(
  (d) => !d.isInstallment || (d.installmentCount && d.installmentCount >= 2),
  { message: 'Installment count must be at least 2', path: ['installmentCount'] }
)

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>

export const verifyPaymentSchema = z.object({
  verificationNotes: z.string().optional(),
})

export type VerifyPaymentFormData = z.infer<typeof verifyPaymentSchema>

export const flagPaymentSchema = z.object({
  flagReason: z.string().min(1, 'Reason is required'),
})

export type FlagPaymentFormData = z.infer<typeof flagPaymentSchema>
