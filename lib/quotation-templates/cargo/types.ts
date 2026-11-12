// FILE: lib/quotation-templates/cargo/types.ts
// Cargo quotation data shapes — form fields, document structure, template metadata.

import type { FieldValues } from 'react-hook-form'

/**
 * User-editable form data for Cargo quotation.
 * Maps to Quotation + CargoQuotation + QuotationTerm backend models.
 */
export interface CargoFormData extends FieldValues {
  // Quotation header (base)
  quotationNumber?: string
  quotationDate?: Date | string
  recipient?: string
  attentionTo?: string

  // Quotation insurance details (base)
  insured?: string
  insuredAddress?: string
  sumInsured?: number
  sumInsuredCurrency?: string
  rate?: number
  deductible?: number
  deductibleText?: string
  deductibleBasis?: string
  brokerage?: number

  // CargoQuotation details
  interestInsured?: string
  voyageFrom?: string
  voyageTo?: string
  etd?: Date | string
  eta?: Date | string
  conveyance?: string
  instituteCargoClause?: CargoInstituteClause

  // Signature / confirmation
  confirmedAcceptedBy?: string

  // Terms & conditions
  selectedTerms?: QuotationTermData[]
  additionalClauses?: QuotationTermData[]
}

/**
 * Quotation term — single row in terms table.
 * Maps to QuotationTerm backend model.
 */
export interface QuotationTermData {
  id?: string
  termsConditionId?: string
  description?: string
  section?: 'TERMS_CONDITIONS' | 'ADJUSTER_SURVEYOR'
  sortOrder?: number
  isSelected?: boolean
  isEditable?: boolean
  isRemovable?: boolean
  selectionGroup?: string
  conditionRule?: Record<string, unknown>
}

/**
 * Institute Cargo Clause enum — maps to backend CargoInstituteClause.
 * 6 main clause options on Page 2.
 */
export type CargoInstituteClause =
  | 'INSTITUTE_CARGO_A'
  | 'INSTITUTE_CARGO_B'
  | 'INSTITUTE_CARGO_C'
  | 'INSTITUTE_BULK_OIL'
  | 'INSTITUTE_COAL'
  | 'INSTITUTE_CARGO_AIR'

/**
 * Main clause entry — single radio option.
 */
export interface MainClauseEntry {
  id: string
  code: CargoInstituteClause
  label: string
  section: 'TERMS_CONDITIONS'
}

/**
 * Additional clause entry — checkbox option (39 total).
 */
export interface AdditionalClauseEntry {
  id: string
  code: string
  label: string
  section: 'TERMS_CONDITIONS'
}

/**
 * Cargo template metadata — provided to CargoEditor, CargoPreview, CargoPdfDocument.
 * Does NOT contain form data (that's CargoFormData).
 * Supplies insurer branding, clause catalog, validation rules.
 */
export interface CargoTemplate {
  templateId: string
  templateVersion: string
  insurerName: string
  mainClauses: readonly MainClauseEntry[]
  additionalClauses: readonly AdditionalClauseEntry[]
}

/**
 * Rendered document — 3-page structure for preview and PDF export.
 * Built from CargoFormData + CargoTemplate.
 */
export interface CargoDocumentPage {
  type: 'page1' | 'page2' | 'page3'
  content: CargoPageContent
}

export interface CargoPageContent {
  // Page 1: Header + Insurance Details
  quotationNumber?: string
  quotationDate?: string
  recipient?: string
  attentionTo?: string
  insured?: string
  insuredAddress?: string
  interestInsured?: string
  voyageFrom?: string
  voyageTo?: string
  etd?: string
  eta?: string
  conveyance?: string
  sumInsured?: number
  sumInsuredCurrency?: string
  rate?: number
  deductible?: number
  deductibleText?: string
  brokerage?: number

  // Page 2: Terms & Conditions
  mainClause?: CargoInstituteClause
  additionalClauses?: AdditionalClauseEntry[]

  // Page 3: Signature
  confirmedAcceptedBy?: string
  signedFor?: string // placeholder text (no backend field)
}

export interface CargoDocument {
  pages: CargoDocumentPage[]
  template: CargoTemplate
  formData: CargoFormData
}
