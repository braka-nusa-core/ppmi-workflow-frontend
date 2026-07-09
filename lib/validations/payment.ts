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
  voucherId:         z.string().min(1, 'Voucher is required'),
  installmentNumber: z.number({ invalid_type_error: 'Installment number is required' }).int().min(1, 'Installment number must be at least 1'),
  paymentDate:       z.string().optional(),
  dueDate:           z.string().min(1, 'Due date is required'),
  paidAmount:        z.number({ invalid_type_error: 'Paid amount is required' }).int().min(0, 'Paid amount cannot be negative'),
  remainingAmount:   z.number({ invalid_type_error: 'Remaining amount is required' }).int().min(0, 'Remaining amount cannot be negative'),
  remarks:           z.string().min(1, 'Remarks is required'),
  paymentProof:      z.string().optional(),
})

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>

export const verifyPaymentSchema = z.object({
  verificationNotes: z.string().optional(),
})

export type VerifyPaymentFormData = z.infer<typeof verifyPaymentSchema>

export const flagPaymentSchema = z.object({
  flagReason: z.string().min(1, 'Reason is required'),
})

export type FlagPaymentFormData = z.infer<typeof flagPaymentSchema>