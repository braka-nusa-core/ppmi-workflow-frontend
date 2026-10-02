// FILE: lib/api/hm.ts

// ═══════════════════════════════════════════════════════════════
// H&M API LAYER
//
// Pure HTTP functions against the current backend's /hm resource
// (ppmi-workflow-backend-2/src/hm/hm.controller.ts). Same shape as
// lib/api/pni.ts.
//
// Verified against the current backend source: only 3 H&M-specific
// endpoints exist — GET/POST/PATCH /hm/quotations/:quotationId. There
// is NO GET /hm/quotations (list) endpoint on the backend — do not
// invent one. To list H&M quotations, use the existing generic
// fetchQuotations() (lib/api/quotations.ts) and filter client-side on
// `hmQuotation !== null` (QuotationListItem already carries that
// shallow flag — see types/quotation.ts).
//
// `GET /hm/template` also exists on the backend, but it runs the
// exact same qsTemplate.findFirst({ templateDomain: 'HULL_MACHINERY' })
// query as the already-implemented, domain-generic
// GET /quotation-references/templates/:domain (lib/api/
// quotationReferences.ts, hooks/useQuotationReferences.ts, built in
// Phase 1). That shared fetcher/hook is reused as-is for H&M's
// template — no separate /hm/template wrapper is added here, per the
// "reuse the shared reference API where it already covers the need"
// instruction.
// ═══════════════════════════════════════════════════════════════

import { get, post, patch } from './client'
import { fromWire } from './wireMapper'
import type {
  HmQuotationDetail,
  CreateHmQuotationPayload,
  UpdateHmQuotationPayload,
} from '@/types/hm'

const BASE = '/hm/quotations'

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
}

/** GET /hm/quotations/:quotationId — 404 if this quotation has no H&M detail attached yet. */
export async function fetchHmQuotation(quotationId: string): Promise<HmQuotationDetail> {
  const res = await get<Envelope<unknown>>(`${BASE}/${quotationId}`)
  return fromWire<HmQuotationDetail>(res.data)
}

/**
 * POST /hm/quotations/:quotationId — attaches H&M detail to an
 * ALREADY-CREATED base Quotation (step 2 of the two-step H&M create
 * flow — step 1 is the existing createQuotation() in
 * lib/api/quotations.ts, with insuranceTypeId pointing at the H&M
 * InsuranceType). 400s server-side if the quotation's insuranceType
 * code isn't 'HM', or if H&M detail already exists for it.
 */
export async function createHmQuotation(
  quotationId: string,
  payload: CreateHmQuotationPayload
): Promise<HmQuotationDetail> {
  const res = await post<Envelope<unknown>>(`${BASE}/${quotationId}`, payload)
  return fromWire<HmQuotationDetail>(res.data)
}

/** PATCH /hm/quotations/:quotationId — only allowed while the base Quotation's status is DRAFT or REVISION (enforced server-side via assertEditable). */
export async function updateHmQuotation(
  quotationId: string,
  payload: UpdateHmQuotationPayload
): Promise<HmQuotationDetail> {
  const res = await patch<Envelope<unknown>>(`${BASE}/${quotationId}`, payload)
  return fromWire<HmQuotationDetail>(res.data)
}