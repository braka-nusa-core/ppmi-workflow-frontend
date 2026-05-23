import type { Division } from './workflow'

// ─── Voucher-specific enums ──────────────────────────────────────
export type VoucherStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'PROCESSED'
  | 'CANCELLED'

export type VoucherApprovalStatus =
  | 'WAITING'
  | 'APPROVED'
  | 'REJECTED'

export type VoucherPaymentType =
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'RTGS'
  | 'SWIFT'
  | 'CASH'

// ─── Approval record ─────────────────────────────────────────────
export interface VoucherApproval {
  id:          string
  approverName:string
  approverRole:string
  status:      VoucherApprovalStatus
  notes?:      string
  timestamp?:  string
}

// ─── Attachment ──────────────────────────────────────────────────
export interface VoucherAttachment {
  id:         string
  filename:   string
  filesize:   number
  filetype:   string
  uploadedBy: string
  uploadedAt: string
  url?:       string
}

// ─── Activity ────────────────────────────────────────────────────
export type VoucherActivityType =
  | 'created'
  | 'updated'
  | 'submitted'
  | 'approval_requested'
  | 'approved'
  | 'rejected'
  | 'processed'
  | 'payment_generated'
  | 'cancelled'
  | 'note_added'

export interface VoucherActivity {
  id:          string
  type:        VoucherActivityType
  description: string
  actor:       string
  timestamp:   string
  meta?: {
    fromStatus?: VoucherStatus
    toStatus?:   VoucherStatus
    amount?:     number
    currency?:   'IDR' | 'USD'
    approver?:   string
    notes?:      string
  }
}

// ─── Full Voucher Document ───────────────────────────────────────
export interface VoucherDocument {
  id:             string
  docNumber:      string
  division:       Division
  status:         VoucherStatus
  approvalStatus: VoucherApprovalStatus

  // Linked documents
  invoiceId:      string
  invoiceNumber:  string
  qsId:           string
  qsNumber:       string
  paymentId?:     string
  paymentNumber?: string

  // Insured info (from invoice)
  insuredName:    string
  vesselName?:    string

  // Payment info
  paymentType:    VoucherPaymentType
  currency:       'IDR' | 'USD'
  amount:         number

  // Bank info
  bankName:       string
  bankBranch?:    string
  accountNumber:  string
  accountName:    string   // beneficiary
  swiftCode?:     string

  // Processing
  processingDate?: string
  processedDate?:  string
  processedBy?:    string

  // Approval
  approval?:       VoucherApproval
  approvalPIC?:    string
  approvalNotes?:  string
  approvedBy?:     string
  approvedAt?:     string
  rejectedBy?:     string
  rejectedAt?:     string
  rejectionReason?:string

  // Notes & attachments
  internalNotes?:  string
  attachments?:    VoucherAttachment[]

  // Meta
  createdBy:       string
  createdAt:       string
  updatedBy?:      string
  updatedAt:       string
  activity?:       VoucherActivity[]
}

// ─── Voucher list item (table row) ──────────────────────────────
export interface VoucherListItem {
  id:             string
  docNumber:      string
  division:       Division
  invoiceNumber:  string
  qsNumber:       string
  insuredName:    string
  paymentType:    VoucherPaymentType
  bankName:       string
  currency:       'IDR' | 'USD'
  amount:         number
  status:         VoucherStatus
  approvalStatus: VoucherApprovalStatus
  hasPayment:     boolean
  paymentNumber?: string
  createdAt:      string
}

// ─── Create payload ──────────────────────────────────────────────
export interface CreateVoucherPayload {
  invoiceId:       string
  division:        Division
  paymentType:     VoucherPaymentType
  currency:        'IDR' | 'USD'
  amount:          number
  bankName:        string
  bankBranch?:     string
  accountNumber:   string
  accountName:     string
  swiftCode?:      string
  processingDate?: string
  approvalPIC?:    string
  approvalNotes?:  string
  internalNotes?:  string
}

export type UpdateVoucherPayload = Partial<CreateVoucherPayload> & {
  status?: VoucherStatus
}

// ─── Filters ─────────────────────────────────────────────────────
export interface VoucherFilters {
  search?:        string
  status?:        VoucherStatus | ''
  approvalStatus?:VoucherApprovalStatus | ''
  division?:      Division | ''
  paymentType?:   VoucherPaymentType | ''
}
