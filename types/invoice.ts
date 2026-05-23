import type { Division } from './workflow'

// ─── Invoice-specific statuses ───────────────────────────────────
export type InvoiceStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'SENT'
  | 'PAID'
  | 'OVERDUE'
  | 'CANCELLED'

export type InvoicePaymentStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'

// ─── Bank info ───────────────────────────────────────────────────
export interface BankInfo {
  bankName:      string
  accountNumber: string
  accountName:   string
  bankBranch?:   string
  swiftCode?:    string
}

// ─── Attachment ──────────────────────────────────────────────────
export interface InvoiceAttachment {
  id:         string
  filename:   string
  filesize:   number
  filetype:   string
  uploadedBy: string
  uploadedAt: string
  url?:       string
}

// ─── Activity ────────────────────────────────────────────────────
export type InvoiceActivityType =
  | 'created'
  | 'updated'
  | 'issued'
  | 'sent'
  | 'payment_received'
  | 'payment_partial'
  | 'overdue_flagged'
  | 'voucher_generated'
  | 'cancelled'
  | 'note_added'

export interface InvoiceActivity {
  id:          string
  type:        InvoiceActivityType
  description: string
  actor:       string
  timestamp:   string
  meta?: {
    fromStatus?: InvoiceStatus
    toStatus?:   InvoiceStatus
    amount?:     number
    currency?:   'IDR' | 'USD'
  }
}

// ─── Full Invoice Document ───────────────────────────────────────
export interface InvoiceDocument {
  id:             string
  docNumber:      string
  division:       Division
  status:         InvoiceStatus
  paymentStatus:  InvoicePaymentStatus

  // Linked documents
  qsId:           string
  qsNumber:       string
  voucherId?:     string
  voucherNumber?: string

  // Billing
  insuredName:     string
  vesselName?:     string
  billingAddress?: string
  billingContact?: string

  // Financial
  currency:        'IDR' | 'USD'
  subtotal:        number
  taxRate?:        number
  taxAmount?:      number
  discount?:       number
  totalAmount:     number
  paidAmount:      number
  remainingAmount: number

  // Dates
  issueDate:       string
  dueDate:         string
  sentDate?:       string
  paidDate?:       string

  // Payment info
  paymentTerms?:   string
  bankInfo?:       BankInfo

  // Notes & attachments
  internalNotes?:  string
  attachments?:    InvoiceAttachment[]

  // Meta
  createdBy:       string
  createdAt:       string
  updatedBy?:      string
  updatedAt:       string
  activity?:       InvoiceActivity[]
}

// ─── Invoice List Item (table row) ───────────────────────────────
export interface InvoiceListItem {
  id:             string
  docNumber:      string
  division:       Division
  qsNumber:       string
  insuredName:    string
  vesselName?:    string
  currency:       'IDR' | 'USD'
  totalAmount:    number
  paidAmount:     number
  remainingAmount:number
  dueDate:        string
  status:         InvoiceStatus
  paymentStatus:  InvoicePaymentStatus
  hasVoucher:     boolean
  voucherNumber?: string
  createdAt:      string
}

// ─── Create Invoice Payload ──────────────────────────────────────
export interface CreateInvoicePayload {
  qsId:            string
  division:        Division
  insuredName:     string
  vesselName?:     string
  billingAddress?: string
  billingContact?: string
  currency:        'IDR' | 'USD'
  subtotal:        number
  taxRate?:        number
  discount?:       number
  issueDate:       string
  dueDate:         string
  paymentTerms?:   string
  bankInfo?:       BankInfo
  internalNotes?:  string
}

export type UpdateInvoicePayload = Partial<CreateInvoicePayload> & {
  status?: InvoiceStatus
}

// ─── Filters ─────────────────────────────────────────────────────
export interface InvoiceFilters {
  search?:        string
  status?:        InvoiceStatus | ''
  paymentStatus?: InvoicePaymentStatus | ''
  division?:      Division | ''
  dueDateFrom?:   string
  dueDateTo?:     string
}
