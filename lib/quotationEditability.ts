import type { AuthUser } from '@/types/auth'
import type { QuotationStatus } from '@/types/quotation'

const EDITABLE_STATUSES: QuotationStatus[] = ['DRAFT', 'REVISION']

export function isStatusEditable(status: QuotationStatus): boolean {
  return EDITABLE_STATUSES.includes(status)
}

export function isTechnicalUnitOwner(
  quotation: { technicalUnit: { name: string } | null },
  user: AuthUser | null
): boolean {
  if (!user) return false
  if (user.isSuperAdmin) return true
  return !!quotation.technicalUnit && user.organizationUnit?.name === quotation.technicalUnit.name
}

/**
 * UX-only editability check, shared by QuotationEditClient (Phase 3A)
 * and the nested Objects/Coverages/Terms/Warranties sections (Phase 3B),
 * so the two phases agree on what "editable" means. Built from the two
 * exported checks above so any UI that needs to explain *why* editing
 * is unavailable (see QuotationEditClient) can reuse the exact same
 * logic instead of re-deriving it — a real drift bug found during the
 * Phase 3D integration audit, where QuotationEditClient had recomputed
 * a slightly different, independently-maintained copy of this check
 * purely to build its "reason" message.
 *
 * IMPORTANT — verified against the actual backend source this phase:
 * the main /quotations PATCH/DELETE endpoints DO enforce both the
 * status check and technicalUnitId ownership server-side
 * (quotations.service.ts: assertTechnicalOwnership). However, the four
 * nested sub-resource endpoints (objects/coverages/terms/warranties)
 * do NOT — their controllers only require the coarse `quotation:update`
 * permission, with no status or ownership check in their services at
 * all. This function still applies the same UX rule to the nested
 * sections for a consistent editing experience, but be aware this is
 * currently the ONLY thing preventing a `quotation:update`-holding user
 * from editing another unit's or a non-draft quotation's nested data —
 * there is no backend enforcement to fall back on for these four
 * endpoints today. See the Phase 3B report for the full detail.
 */
export function isQuotationEditableByUser(
  quotation: { status: QuotationStatus; technicalUnit: { name: string } | null },
  user: AuthUser | null
): boolean {
  return isStatusEditable(quotation.status) && isTechnicalUnitOwner(quotation, user)
}