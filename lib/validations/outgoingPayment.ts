import { z } from 'zod'

/**
 * Matches POST /finance/ap/payments per the latest Finance API
 * Specification: { invoiceId, insuranceCompanyId, paymentDate,
 * amount, bankReference }.
 */
export const createOutgoingPaymentSchema = z.object({
  invoiceId:          z.string().min(1, 'Invoice is required'),
  insuranceCompanyId: z.string().min(1, 'Insurance company is required'),
  paymentDate:        z.string().min(1, 'Payment date is required'),
  amount:             z.number({ invalid_type_error: 'Amount is required' }).min(1, 'Amount must be greater than 0'),
  bankReference:      z.string().optional(),
})

export type CreateOutgoingPaymentFormData = z.infer<typeof createOutgoingPaymentSchema>
