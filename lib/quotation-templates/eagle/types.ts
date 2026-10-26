// FILE: lib/quotation-templates/eagle/types.ts
// ═══════════════════════════════════════════════════════════════
// EAGLE OCEAN MARINE TEMPLATE — TYPES
// Same four-layer split as MSIG (template / form data / document model /
// renderers), but Eagle keeps its OWN element kinds: boxed section bars,
// a hand-broken clause grid, three bordered tables and a two-table
// information page. Only genuinely shared pieces live in ../shared.
// ═══════════════════════════════════════════════════════════════

import type { PdfFooterColumn } from '../shared/types'

/** Existing PniClubFormat code (types/pni.ts) this template belongs to. */
export const EAGLE_CLUB_FORMAT = 'EAGLE_OCEAN_MARINE' as const

// ─── Source wording (clauses.ts) ─────────────────────────────────

/** `gapBefore` = measured space (pt) above the line/paragraph; `indent` = hanging list indent (pt). */
export interface EagleClauseParagraph { text: string; gapBefore: number; indent?: number }

export type EagleBodyElement =
  | { kind: 'bar'; id: string; text: string }
  | { kind: 'row'; id: string; labelLines: string[]; pitch: number; paragraphs: EagleClauseParagraph[] }

// ─── Form data (only what a user may enter) ──────────────────────

/** Typed numbers that sit inside fixed clauses ({{slot}} in clauses.ts). */
export type EagleAmountSlot =
  | 'crewLimit' | 'wdcdSubLimit' | 'crewClaims' | 'cargoClaims'
  | 'collisionClaims' | 'ffoClaims' | 'otherClaims' | 'totalLoss'

export interface EagleRole { id: string; organisation: string; role: string }

export interface EagleVessel {
  /** Local React key only. */
  id: string
  /** The “Id” column of the vessel table (e.g. 48085). Origin unconfirmed. */
  vesselId: string
  name: string
  imoNumber: string
  grossTonnage: string
  builtYear: string
  vesselType: string
  flag: string
  vesselClass: string
  annualPremium: string
  limit: string
  /** Co-assured rows for this vessel: “<organisation> as <role>”. */
  roles: EagleRole[]
}

export interface EagleFormData {
  reference: string         // “QUOTATION No.”
  applicant: string
  address: string
  vesselHeading: string     // text before “and/or as per schedule attached”
  period: string
  limitAmount: string       // “Limits: USD …”
  issueDate: string         // yyyy-mm-dd, printed DD-MON-YYYY
  amounts: Record<EagleAmountSlot, string>
  /** The unlabelled sum row under “Annual Premium USD”. Typed, never computed. */
  premiumTotal: string
  vessels: EagleVessel[]
}

// ─── Template ────────────────────────────────────────────────────

export interface EagleHeaderRow {
  label: string
  /** Editable value… */
  field?: 'applicant' | 'address' | 'vesselHeading' | 'period' | 'limitAmount'
  /** …or fixed value. */
  fixed?: string
  prefix?: string
  suffix?: string
  /** value is a whole-number amount */
  amount?: boolean
}

export interface EagleTableColumn { label: string; width: number; align: 'left' | 'right'; key: string }

export interface EagleTemplate {
  templateId: string
  clubFormat: typeof EAGLE_CLUB_FORMAT
  insurerName: string
  /** MOCK identifier for this prototype — not a PPMI-approved version label. */
  templateVersion: string
  sourceNote: string
  title: string
  quotationNoLabel: string
  headerRows: EagleHeaderRow[]
  intro: EagleClauseParagraph[]
  signature: { byLabel: string; signatoryLabel: string }
  insurerParagraphs: EagleClauseParagraph[]
  fairPresentation: EagleClauseParagraph[]
  body: EagleBodyElement[]
  fairRepeat: EagleClauseParagraph[]
  information: { bar: string; vesselColumns: EagleTableColumn[]; caption: string; premiumColumns: EagleTableColumn[] }
  acceptance: { label: string; signatoryLabel: string }
  disclaimer: EagleClauseParagraph[]
  coassureds: { bar: string; columns: [string, string, string]; cover: string; roleJoiner: string }
  footer: PdfFooterColumn[]
  amountSlots: { slot: EagleAmountSlot; label: string }[]
}

// ─── Document model (what renderers draw) ────────────────────────

export interface EagleDocParagraph { text: string; gapBefore: number; indent?: number }

export type EagleDocBlock =
  | { type: 'title'; text: string }
  | { type: 'refLine'; label: string; value: string }
  | { type: 'headerRows'; rows: { label: string; value: string }[] }
  | { type: 'paragraphs'; id: string; gapBefore: number; pitch: number; fontSize?: number; paragraphs: EagleDocParagraph[] }
  | { type: 'dateSignature'; date: string; byLabel: string; signatoryLabel: string }
  | { type: 'bar'; id: string; text: string; bold?: boolean; gapBefore: number }
  | { type: 'row'; id: string; labelLines: string[]; pitch: number; paragraphs: EagleDocParagraph[] }
  | { type: 'table'; id: string; gapBefore: number; caption?: string; columns: EagleTableColumn[]; rows: string[][]; total?: { column: number; value: string } }
  | { type: 'acceptance'; label: string; signatoryLabel: string }
  | { type: 'coassureds'; columns: [string, string, string]; rows: { vessel: string; cover: string; lines: string[] }[] }

export interface EagleDocument {
  blocks: EagleDocBlock[]
  footer: PdfFooterColumn[]
}