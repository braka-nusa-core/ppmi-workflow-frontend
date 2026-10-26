// FILE: lib/quotation-templates/msig/types.ts
// ═══════════════════════════════════════════════════════════════
// MSIG TEMPLATE — TYPES
//
// Four separated concerns (Phase 3 prototype):
//   1. TEMPLATE  — fixed wording + element order      (template.ts)
//   2. FORM DATA — only the values a user may enter   (this file: MsigFormData)
//   3. DOCUMENT  — template + data → ordered blocks    (buildDocument.ts)
//   4. RENDERERS — HTML preview and PDF read ONLY the document model.
// Element ids (M01…M37) refer to the Phase 2 specification.
// ═══════════════════════════════════════════════════════════════

import type { PdfFooterColumn, PdfFooterSegment } from '../shared/types'

/** Existing PniClubFormat code (types/pni.ts) this template belongs to. */
export const MSIG_CLUB_FORMAT = 'MSIG_SPECIALTY_MARINE_NV' as const

// ─── Form data (the only user-editable values) ───────────────────

export interface MsigVessel {
  /** Local React key only. Maps to the backend key/ref pattern later. */
  id: string
  name: string
  type: string
  imoNumber: string
  vesselClass: string
  /** Prints “-” in the Class row (existing PniVessel.classNotApplicable). */
  classNotApplicable: boolean
  grossTonnage: string
  builtYear: string
  flag: string
  portOfRegistry: string
}

/** Amounts are kept exactly as typed; formatting happens in buildDocument. */
export interface MsigCoverageAmounts {
  maximumAmount: string
  deductibleAmount: string
  premiumAmount: string
}

export interface MsigFormData {
  reference: string            // M03 “Our Reference”
  assured: string              // M04 “Assured(s)”
  vessels: MsigVessel[]        // M05 “Insured Vessel” (repeatable)
  period: string               // M06 “Period”
  pni: MsigCoverageAmounts     // M21–M23 (P&I block)
  war: MsigCoverageAmounts     // M30–M32 (War P&I block) — independent of pni
  issueDate: string            // M35, yyyy-mm-dd
}

export type MsigTextField = 'reference' | 'assured' | 'period'
export type MsigCoverageKey = 'pni' | 'war'
export type MsigAmountKey = keyof MsigCoverageAmounts
export type MsigVesselFieldKey =
  | 'name' | 'type' | 'imoNumber' | 'class' | 'grossTonnage' | 'builtYear' | 'flag' | 'portOfRegistry'

// ─── Template (fixed wording) ────────────────────────────────────

/** Editor-only grouping; never printed. */
export type MsigSection = 'quotation' | 'pni' | 'war' | 'closing'

export interface MsigParagraph { text: string; bold?: boolean }
export type MsigFooterSegment = PdfFooterSegment
export type MsigFooterColumn = PdfFooterColumn

export type MsigTemplateElement =
  | { kind: 'title'; id: string; section: MsigSection; gapBefore?: number; text: string }
  | { kind: 'lead'; id: string; section: MsigSection; gapBefore?: number; text: string }
  | { kind: 'field'; id: string; section: MsigSection; gapBefore?: number; label: string; field: MsigTextField }
  | { kind: 'vessels'; id: string; section: MsigSection; gapBefore?: number; label: string }
  | { kind: 'text'; id: string; section: MsigSection; gapBefore?: number; /** full-width text with no label column (closing paragraph) */ fullWidth?: boolean; label?: string; labelAlign?: 'top' | 'middle'; paragraphs: MsigParagraph[] }
  | { kind: 'amount'; id: string; section: MsigSection; gapBefore?: number; label: string; currency: string; coverage: MsigCoverageKey; field: MsigAmountKey; remark: string }
  | { kind: 'signature'; id: string; section: MsigSection; gapBefore?: number; eoe: string; acceptLabel: string; signatoryLabel: string }

export interface MsigTemplate {
  templateId: string
  clubFormat: typeof MSIG_CLUB_FORMAT
  insurerName: string
  /** MOCK identifier for this prototype — not a PPMI-approved version label. */
  templateVersion: string
  sourceNote: string
  /** Printed in the place/date line: “<companyName>, <date>”. */
  companyName: string
  vesselFields: { label: string; key: MsigVesselFieldKey }[]
  footer: MsigFooterColumn[]
  elements: MsigTemplateElement[]
}

// ─── Document model (what renderers draw) ────────────────────────

/** `gapBefore` = extra space (pt) above the block, measured from the sample's row spacing. */
export type MsigDocBlock =
  | { type: 'title'; text: string }
  | { type: 'lead'; text: string }
  | { type: 'row'; id: string; gapBefore: number; fullWidth?: boolean; label?: string; labelAlign?: 'top' | 'middle'; paragraphs: MsigParagraph[] }
  | { type: 'vessel'; id: string; gapBefore: number; label: string; rows: { label: string; value: string }[] }
  | { type: 'amount'; id: string; gapBefore: number; label: string; currency: string; amount: string; remark: string }
  | { type: 'signature'; id: string; gapBefore: number; placeDate: string; eoe: string; acceptLabel: string; signatoryLabel: string }

export interface MsigDocument {
  blocks: MsigDocBlock[]
  footer: MsigFooterColumn[]
}