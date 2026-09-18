// ═══════════════════════════════════════════════════════════════
// QUOTATION STATUS DOMAIN HELPERS
//
// Centralized label/variant mapping for the real backend enum.
// Deliberately does NOT duplicate the backend's transition graph —
// only enough to render status and know which read-only badge
// styling to use. Workflow action availability is a later phase's
// concern (Phase 4), not this one.
// ═══════════════════════════════════════════════════════════════

import type { QuotationStatus } from '@/types/quotation'

export const QUOTATION_STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT:              'Draft',
  WAITING_APPROVAL:   'Waiting Approval',
  APPROVED:           'Approved',
  SENT_TO_INSURANCE:  'Sent to Insurance',
  REVISION:           'Revision',
  INSURANCE_APPROVED: 'Insurance Approved',
  POLICY_ISSUED:      'Policy Issued',
}

/** Maps to the existing Badge component's generic variant set (components/ui/Badge.tsx). */
export const QUOTATION_STATUS_BADGE_VARIANT: Record<
  QuotationStatus,
  'draft' | 'pending' | 'active' | 'approved' | 'rejected' | 'completed'
> = {
  DRAFT:              'draft',
  WAITING_APPROVAL:   'pending',
  APPROVED:           'approved',
  SENT_TO_INSURANCE:  'active',
  REVISION:           'rejected',
  INSURANCE_APPROVED: 'approved',
  POLICY_ISSUED:      'completed',
}

export function getQuotationStatusLabel(status: QuotationStatus): string {
  return QUOTATION_STATUS_LABELS[status] ?? status
}