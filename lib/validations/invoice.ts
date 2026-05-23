import { z } from 'zod'

export const bankInfoSchema = z.object({
  bankName:      z.string().min(1, 'Bank name is required'),
  accountNumber: z.string().min(1, 'Account number is required'),
  accountName:   z.string().min(1, 'Account name is required'),
  bankBranch:    z.string().optional(),
  swiftCode:     z.string().optional(),
})

export const createInvoiceSchema = z.object({
  // Linked QS
  qsId:     z.string().min(1, 'Linked QS is required'),
  division: z.enum(['PI', 'HM'], { required_error: 'Division is required' }),

  // Billing
  insuredName:    z.string().min(1, 'Insured name is required'),
  vesselName:     z.string().optional(),
  billingAddress: z.string().optional(),
  billingContact: z.string().optional(),

  // Financial
  currency:    z.enum(['IDR', 'USD']),
  subtotal:    z.number({ invalid_type_error: 'Amount is required' })
                 .min(1, 'Amount must be greater than 0'),
  taxRate:     z.number().min(0).max(100).optional(),
  discount:    z.number().min(0).optional(),

  // Dates
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate:   z.string().min(1, 'Due date is required'),

  // Payment
  paymentTerms: z.string().optional(),
  bankInfo:     bankInfoSchema.optional(),

  // Notes
  internalNotes: z.string().optional(),
}).refine(
  (data) => {
    if (!data.issueDate || !data.dueDate) return true
    return new Date(data.dueDate) >= new Date(data.issueDate)
  },
  { message: 'Due date must be on or after issue date', path: ['dueDate'] }
)

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>
