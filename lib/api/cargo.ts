// FILE: lib/api/cargo.ts

// ═══════════════════════════════════════════════════════════════
// CARGO API LAYER
//
// Pure HTTP functions against the current backend's /cargo resource
// (ppmi-workflow-backend-2/src/cargo/cargo.controller.ts). Same shape
// as lib/api/hm.ts.
//
// Verified against the current backend source: only 3 Cargo-specific
// endpoints exist - GET/POST/PATCH /cargo/quotations/:quotationId.
// There is NO GET /cargo/quotations (list) endpoint on the backend -
// do not invent one. To list Cargo quotations, use the existing
// generic fetchQuotations() (lib/api/quotations.ts) and filter
// client-side on `cargoQuotation !== null` (QuotationListItem already
// carries that shallow flag, same as `hmQuotation` - see
// types/quotation.ts).
//
// `GET /cargo/template` also exists on the backend, but it runs the
// exact same qsTemplate.findFirst({ templateDomain: 'CARGO' }) query
// as the already-implemented, domain-generic
// GET /quotation-references/templates/:domain (lib/api/
// quotationReferences.ts, hooks/useQuotationReferences.ts, Phase 1).
// That shared fetcher/hook is reused as-is for Cargo's template - no
// separate /cargo/template wrapper is added here, same decision as
// lib/api/hm.ts made for H&M.
// ═══════════════════════════════════════════════════════════════

import { get, post, patch } from './client'
import { fromWire } from './wireMapper'
import type {
  CargoQuotationDetail,
  CreateCargoQuotationPayload,
  UpdateCargoQuotationPayload,
} from '@/types/cargo'

const BASE = '/cargo/quotations'

interface Envelope<T> {
  success: boolean
  message?: string
  data: T
}

/** GET /cargo/quotations/:quotationId - 404 if this quotation has no Cargo detail attached yet. */
export async function fetchCargoQuotation(quotationId: string): Promise<CargoQuotationDetail> {
  const res = await get<Envelope<unknown>>(`${BASE}/${quotationId}`)
  return fromWire<CargoQuotationDetail>(res.data)
}

/**
 * POST /cargo/quotations/:quotationId - attaches Cargo detail to an
 * ALREADY-CREATED base Quotation (step 2 of the two-step Cargo create
 * flow - step 1 is the existing createQuotation() in
 * lib/api/quotations.ts, with insuranceTypeId pointing at the CARGO
 * InsuranceType). 400s server-side if the quotation's insuranceType
 * code isn't 'CARGO', or if Cargo detail already exists for it.
 */
export async function createCargoQuotation(
  quotationId: string,
  payload: CreateCargoQuotationPayload
): Promise<CargoQuotationDetail> {
  const res = await post<Envelope<unknown>>(`${BASE}/${quotationId}`, payload)
  return fromWire<CargoQuotationDetail>(res.data)
}

/** PATCH /cargo/quotations/:quotationId - only allowed while the base Quotation's status is DRAFT or REVISION (enforced server-side via assertEditable). */
export async function updateCargoQuotation(
  quotationId: string,
  payload: UpdateCargoQuotationPayload
): Promise<CargoQuotationDetail> {
  const res = await patch<Envelope<unknown>>(`${BASE}/${quotationId}`, payload)
  return fromWire<CargoQuotationDetail>(res.data)
}