import { z } from 'zod'

const paymentMethodEnum = z.enum(
  ['BANK_TRANSFER', 'RTGS', 'SWIFT', 'CHEQUE', 'CASH'],
  { required_error: 'Payment method is required' }
)

// Matches POST /finance/ar/payments per the latest Finance API
// Specification: { invoiceId, paymentDate, amount, paymentMethod,
// bankAccount, referenceNumber, notes }. Used for both the full
// Create page and the in-detail "record a payment" modal — under the
// flat per-payment-record model there's no separate "installment"
// operation; every payment against an invoice is the same shape.
export const recordPaymentSchema = z.object({
  paidAmount:      z.number({ invalid_type_error: 'Amount is required' }).min(1, 'Amount must be greater than 0'),
  paidDate:        z.string().min(1, 'Payment date is required'),
  paymentMethod:   paymentMethodEnum,
  bankAccount:     z.string().optional(),
  referenceNumber: z.string().optional(),
  notes:           z.string().optional(),
})

export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>

export const createPaymentSchema = z.object({
  invoiceId:       z.string().min(1, 'Invoice is required'),
  paidDate:        z.string().min(1, 'Payment date is required'),
  paidAmount:      z.number({ invalid_type_error: 'Amount is required' }).min(1, 'Amount must be greater than 0'),
  paymentMethod:   paymentMethodEnum,
  bankAccount:     z.string().optional(),
  referenceNumber: z.string().optional(),
  notes:           z.string().optional(),
})

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>

// NOTE: verify/flag are frontend-only workflow concepts — not part of
// the documented Incoming Payment API. Left unchanged; out of scope
// for this phase to redesign (see Phase 7 report, Technical Debt).
export const verifyPaymentSchema = z.object({
  verificationNotes: z.string().optional(),
})

export type VerifyPaymentFormData = z.infer<typeof verifyPaymentSchema>

export const flagPaymentSchema = z.object({
  flagReason: z.string().min(1, 'Reason is required'),
})

export type FlagPaymentFormData = z.infer<typeof flagPaymentSchema>