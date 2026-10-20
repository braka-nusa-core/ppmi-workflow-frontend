// ═══════════════════════════════════════════════════════════════
// QUOTATION REFERENCES API LAYER
//
// Pure HTTP functions against the current backend's
// /quotation-references resource
// (ppmi-workflow-backend-2/src/quotations/quotation-references.controller.ts).
// This is generic master data shared by any domain (H&M/Cargo
// templates, and adjuster/surveyor contact lists used by H&M and
// Cargo quotations) — NOT a domain-specific /pni, /hm, or /cargo
// API. Those belong to their own Phase 2 modules.
//
// No Terms & Conditions / Warranty catalog endpoint exists on the
// backend today — do not add fetchers for those here until one
// actually exists.
// ═══════════════════════════════════════════════════════════════

import { get } from './client'
import { fromWire } from './wireMapper'
import type { QuotationReferenceContact, QsTemplate } from '@/types/quotation'

const BASE = '/quotation-references'

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
}

/** GET /quotation-references/adjusters — active adjusters only, name-sorted server-side. */
export async function fetchQuotationAdjusters(): Promise<QuotationReferenceContact[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/adjusters`)
  return fromWire<QuotationReferenceContact[]>(res.data)
}

/** GET /quotation-references/surveyors — active surveyors only, name-sorted server-side. */
export async function fetchQuotationSurveyors(): Promise<QuotationReferenceContact[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/surveyors`)
  return fromWire<QuotationReferenceContact[]>(res.data)
}

/**
 * GET /quotation-references/templates/:domain
 * `domain` MUST be 'HULL_MACHINERY' or 'CARGO' — the backend 400s on
 * anything else (P&I has its own /pni/club-formats/:clubFormat/template
 * endpoint, not this one). Throws (404) if no template row exists yet.
 */
export async function fetchQuotationTemplate(
  domain: 'HULL_MACHINERY' | 'CARGO'
): Promise<QsTemplate> {
  const res = await get<Envelope<unknown>>(`${BASE}/templates/${domain}`)
  return fromWire<QsTemplate>(res.data)
}