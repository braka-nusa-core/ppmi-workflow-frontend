import { z } from 'zod'

// ─── Shared field schemas ────────────────────────────────────────
const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`)

const optionalString = () =>
  z.string().optional()

const positiveAmount = (label = 'Amount') =>
  z.number({ invalid_type_error: `${label} must be a number` })
    .min(0, `${label} must be 0 or greater`)

const isoDate = (label: string) =>
  z.string().min(1, `${label} is required`)

// ─── Login Schema ────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ─── Create QS Schema ────────────────────────────────────────────
export const createQSSchema = z.object({
  division:     z.enum(['PI', 'HM'], { required_error: 'Division is required' }),
  clientName:   requiredString('Client name'),
  clientAddress:optionalString(),
  vesselName:   optionalString(),
  vesselFlag:   optionalString(),
  currency:     z.enum(['IDR', 'USD']),
  totalAmount:  positiveAmount('Total amount'),
  exchangeRate: z.number().optional(),
  issueDate:    isoDate('Issue date'),
  validUntil:   optionalString(),
  notes:        optionalString(),
  description:  optionalString(),
})

export type CreateQSFormData = z.infer<typeof createQSSchema>

// ─── Create Invoice Schema ───────────────────────────────────────
export const createInvoiceSchema = z.object({
  qsId:         requiredString('Quotation Sheet'),
  division:     z.enum(['PI', 'HM']),
  clientName:   requiredString('Client name'),
  vesselName:   optionalString(),
  currency:     z.enum(['IDR', 'USD']),
  subtotal:     positiveAmount('Subtotal'),
  tax:          z.number().optional(),
  taxRate:      z.number().min(0).max(100).optional(),
  discount:     z.number().optional(),
  issueDate:    isoDate('Issue date'),
  dueDate:      isoDate('Due date'),
  notes:        optionalString(),
  paymentTerms: optionalString(),
})

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>

// ─── Create Voucher Schema ───────────────────────────────────────
export const createVoucherSchema = z.object({
  invoiceId:     requiredString('Invoice'),
  division:      z.enum(['PI', 'HM']),
  currency:      z.enum(['IDR', 'USD']),
  amount:        positiveAmount('Amount'),
  bankName:      optionalString(),
  accountNumber: optionalString(),
  accountName:   optionalString(),
  issueDate:     isoDate('Issue date'),
  notes:         optionalString(),
})

export type CreateVoucherFormData = z.infer<typeof createVoucherSchema>

// ─── Create Payment Schema ───────────────────────────────────────
export const createPaymentSchema = z.object({
  voucherId:       requiredString('Voucher'),
  division:        z.enum(['PI', 'HM']),
  currency:        z.enum(['IDR', 'USD']),
  totalAmount:     positiveAmount('Total amount'),
  dueDate:         isoDate('Due date'),
  isInstallment:   z.boolean(),
  installmentCount:z.number().min(2).max(24).optional(),
  paymentMethod:   optionalString(),
  notes:           optionalString(),
})

export type CreatePaymentFormData = z.infer<typeof createPaymentSchema>

// ─── Record Installment Schema ───────────────────────────────────
export const recordInstallmentSchema = z.object({
  paidAmount:      positiveAmount('Paid amount'),
  paidDate:        isoDate('Payment date'),
  referenceNumber: optionalString(),
})

export type RecordInstallmentFormData = z.infer<typeof recordInstallmentSchema>

// ─── Change Password Schema ──────────────────────────────────────
export const changePasswordSchema = z.object({
  currentPassword: requiredString('Current password'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters'),
  confirmPassword: requiredString('Confirm password'),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] }
)

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// ─── Create User Schema ──────────────────────────────────────────
export const createUserSchema = z.object({
  name:     requiredString('Name'),
  email:    z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role:     z.enum(['viewer', 'editor', 'finance', 'administrator']),
  division: z.enum(['PI', 'HM']).optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
