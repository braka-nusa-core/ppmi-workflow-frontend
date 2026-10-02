// ═══════════════════════════════════════════════════════════════
// P&I API LAYER
//
// Pure HTTP functions against the current backend's /pni resource
// (ppmi-workflow-backend-2/src/pni/pni.controller.ts). Same shape as
// lib/api/quotations.ts — no React Query, no UI logic here.
//
// Endpoints implemented here are exactly what exists in
// pni.controller.ts today: club-formats, club-formats/:clubFormat/
// template, quotations (list/get/create/update). There is no
// separate submit/approve/etc. for P&I — those are the shared
// /quotations/:id/* workflow endpoints in lib/api/quotations.ts.
// ═══════════════════════════════════════════════════════════════

import { get, post, patch } from './client'
import { fromWire } from './wireMapper'
import type {
  PniClubFormatOption,
  PniTemplate,
  PniQuotationListItem,
  PniQuotationDetail,
  CreatePniQuotationPayload,
  UpdatePniQuotationPayload,
} from '@/types/pni'

const BASE = '/pni'

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
}

// ─── Reference data ─────────────────────────────────────────────

/** GET /pni/club-formats — the 3 supported P&I club formats (hardcoded on the backend, not a DB table). */
export async function fetchPniClubFormats(): Promise<PniClubFormatOption[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/club-formats`)
  return fromWire<PniClubFormatOption[]>(res.data)
}

/** GET /pni/club-formats/:clubFormat/template — QsTemplate rows for one club format. */
export async function fetchPniClubFormatTemplate(
  clubFormat: string
): Promise<PniTemplate[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/club-formats/${clubFormat}/template`)
  return fromWire<PniTemplate[]>(res.data)
}

// ─── Quotations ──────────────────────────────────────────────────

/** GET /pni/quotations — list, slim shape (id/clubFormat/referenceNumber only for the P&I detail). */
export async function fetchPniQuotations(): Promise<PniQuotationListItem[]> {
  const res = await get<Envelope<unknown[]>>(`${BASE}/quotations`)
  return fromWire<PniQuotationListItem[]>(res.data)
}

/** GET /pni/quotations/:quotationId — full P&I detail (vessels, insurance blocks, deductibles, provisions, etc.). 404 if this quotation has no P&I detail. */
export async function fetchPniQuotation(quotationId: string): Promise<PniQuotationDetail> {
  const res = await get<Envelope<unknown>>(`${BASE}/quotations/${quotationId}`)
  return fromWire<PniQuotationDetail>(res.data)
}

/**
 * POST /pni/quotations — creates the base Quotation AND the P&I
 * detail (plus any nested vessels/blocks/etc. included in the
 * payload) in a single call. This is the ONLY create path for P&I —
 * do not call createQuotation() from lib/api/quotations.ts for P&I,
 * there is no way to attach P&I detail to a quotation afterward.
 */
export async function createPniQuotation(
  payload: CreatePniQuotationPayload
): Promise<PniQuotationDetail> {
  const res = await post<Envelope<unknown>>(`${BASE}/quotations`, payload)
  return fromWire<PniQuotationDetail>(res.data)
}

/**
 * PATCH /pni/quotations/:quotationId — upserts nested children
 * (entries with `id` update that row, entries without `id` create a
 * new one) and hard-deletes anything listed under `remove`. Only
 * allowed while the base Quotation's status is DRAFT or REVISION,
 * enforced server-side.
 */
export async function updatePniQuotation(
  quotationId: string,
  payload: UpdatePniQuotationPayload
): Promise<PniQuotationDetail> {
  const res = await patch<Envelope<unknown>>(`${BASE}/quotations/${quotationId}`, payload)
  return fromWire<PniQuotationDetail>(res.data)
}