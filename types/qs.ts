import type { Division } from './workflow'

// ─── QS Specific Types ───────────────────────────────────────────

/**
 * Backend enum QSType: NEW | RENEWAL
 * CHANGED from 'RENEW' → 'RENEWAL' to match backend exactly.
 * Any component/form using 'RENEW' as a literal must be updated when
 * QS components are integrated (not in this phase).
 */
export type QSType = 'NEW' | 'RENEWAL'

export type InsuranceType =
  | 'P&I'
  | 'H&M'
  | 'FD&D'
  | 'War Risk'
  | 'Cargo'
  | 'Liability'

/**
 * Backend enum QSSTATUS: DRAFT | SUBMITTED | APPROVED | REJECTED
 * CHANGED from original PENDING/REVISION/COMPLETED:
 *   PENDING   → SUBMITTED
 *   REVISION  → REJECTED
 *   COMPLETED → removed (no backend equivalent)
 */
export type QSStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'REJECTED'

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
  createdBy?:     string   // CHANGED to optional — not in backend QS response (Log table only)
  createdAt:      string
  // ADDED — backend division UUID, returned in every QS response as division_id.
  // Required by updateQS() when changing division; carried through for convenience.
  divisionId?:    string
  updatedBy?:     string
  updatedAt:      string
  activity?:      QSActivity[]

  // ADDED — required by backend, not previously modeled in frontend
  member?:        string   // backend required field on create; optional here so
  leader?:        string   // existing detail-view rendering doesn't break
  policyNumber?:  string   // backend `policy_number`
  hasInvoice?:    boolean  // derived field; not in backend QS response directly
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

  // ADDED — backend always returns this; useful for table display
  policyNumber?:  string
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

  // Required by backend createQsSchema; collected in the QS Policy form section.
  member:         string
  leader:         string
  policyNumber:   string
  status?:        QSStatus
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