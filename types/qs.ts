import type { Division } from './workflow'

// ─── QS Specific Types ───────────────────────────────────────────
export type QSType = 'NEW' | 'RENEW'

export type InsuranceType =
  | 'P&I'
  | 'H&M'
  | 'FD&D'
  | 'War Risk'
  | 'Cargo'
  | 'Liability'

export type QSStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REVISION'
  | 'COMPLETED'

export interface QSDocument {
  id:            string
  docNumber:     string
  division:      Division
  status:        QSStatus
  type:          QSType
  effectiveDate: string
  expiryDate:    string
  broker?:       string
  insuredName:    string
  insuredAddress?: string
  insuredContact?: string
  vesselName:     string
  vesselFlag?:    string
  vesselType?:    string
  vesselGRT?:     number
  vesselBuiltYear?: number
  imoNumber?:     string
  insuranceType:  InsuranceType
  coverageDetail?: string
  deductible?:    number
  currency:       'IDR' | 'USD'
  premiumAmount:  number
  exchangeRate?:  number
  premiumIDR?:    number
  attachments?:   QSAttachment[]
  internalNotes?: string
  invoiceId?:     string
  invoiceNumber?: string
  createdBy:      string
  createdAt:      string
  updatedBy?:     string
  updatedAt:      string
  activity?:      QSActivity[]
}

export interface QSListItem {
  id:             string
  docNumber:      string
  type:           QSType
  division:       Division
  insuredName:    string
  vesselName:     string
  insuranceType:  InsuranceType
  currency:       'IDR' | 'USD'
  premiumAmount:  number
  status:         QSStatus
  createdAt:      string
  updatedAt:      string
  hasInvoice:     boolean
  invoiceNumber?: string
}

export interface QSAttachment {
  id:         string
  filename:   string
  filesize:   number
  filetype:   string
  uploadedBy: string
  uploadedAt: string
  url?:       string
}

export type QSActivityType =
  | 'created'
  | 'updated'
  | 'status_changed'
  | 'submitted'
  | 'approved'
  | 'revision_requested'
  | 'invoice_generated'
  | 'note_added'
  | 'attachment_added'

export interface QSActivity {
  id:          string
  type:        QSActivityType
  description: string
  actor:       string
  timestamp:   string
  meta?: {
    fromStatus?: QSStatus
    toStatus?:   QSStatus
    field?:      string
    oldValue?:   string
    newValue?:   string
  }
}

export interface CreateQSPayload {
  type:            QSType
  division:        Division
  insuredName:     string
  insuredAddress?: string
  insuredContact?: string
  vesselName:      string
  vesselFlag?:     string
  vesselType?:     string
  vesselGRT?:      number
  vesselBuiltYear?: number
  imoNumber?:      string
  insuranceType:   InsuranceType
  coverageDetail?: string
  deductible?:     number
  broker?:         string
  currency:        'IDR' | 'USD'
  premiumAmount:   number
  exchangeRate?:   number
  effectiveDate:   string
  expiryDate:      string
  internalNotes?:  string
}

export type UpdateQSPayload = Partial<CreateQSPayload> & {
  status?: QSStatus
}

export interface QSFilters {
  search?:        string
  status?:        QSStatus | ''
  division?:      Division | ''
  type?:          QSType | ''
  insuranceType?: InsuranceType | ''
  dateFrom?:      string
  dateTo?:        string
}
