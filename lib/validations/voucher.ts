import { z } from 'zod'

export const createVoucherSchema = z.object({
  invoiceId:   z.string().min(1, 'Linked invoice is required'),
  division:    z.enum(['PI', 'HM'], { required_error: 'Division is required' }),

  paymentType: z.enum(
    ['BANK_TRANSFER', 'CHEQUE', 'RTGS', 'SWIFT', 'CASH'],
    { required_error: 'Payment type is required' }
  ),

  currency:      z.enum(['IDR', 'USD']),
  amount:        z.number({ invalid_type_error: 'Amount is required' })
                  .min(1, 'Amount must be greater than 0'),

  // Bank
  bankName:      z.string().min(1, 'Bank name is required'),
  bankBranch:    z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName:   z.string().min(1, 'Beneficiary name is required'),
  swiftCode:     z.string().optional(),

  // Processing
  processingDate: z.string().optional(),

  // Approval
  approvalPIC:   z.string().optional(),
  approvalNotes: z.string().optional(),

  // Notes
  internalNotes: z.string().optional(),
})

export type CreateVoucherFormData = z.infer<typeof createVoucherSchema>
