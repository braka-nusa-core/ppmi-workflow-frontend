// FILE: lib/quotation-templates/cargo/format.ts
// Cargo form validation — business rules for all fields.
// Rate handling: display as % (0-100), store as decimal (0.0000-1.0000).

import { z } from 'zod'
import type { CargoFormData } from './types'

// ─── Rate conversion helpers ────────────────────────────────────
// Backend stores rate as Decimal(15,4) — 0.0125 = 1.25%
// Frontend displays as percentage — user types 1.25%

/**
 * Convert decimal (backend) to percentage (display).
 * Example: "0.0125" → 1.25
 */
export function decimalToPercentage(decimalStr: string | null | undefined): number | undefined {
  if (!decimalStr) return undefined
  const decimal = parseFloat(decimalStr)
  if (Number.isNaN(decimal)) return undefined
  return decimal * 100
}

/**
 * Convert percentage (display) to decimal (backend).
 * Example: 1.25 → "0.0125"
 * IMPORTANT: Clamps to [0, 100] range (0.0000-1.0000 decimal).
 */
export function percentageToDecimal(percentNum: number | null | undefined): string | null {
  if (percentNum === null || percentNum === undefined) return null
  const clamped = Math.max(0, Math.min(100, percentNum))
  const decimal = clamped / 100
  return decimal.toFixed(4)
}

// ─── Zod schema ────────────────────────────────────────────────

const cargoValidationSchema = z.object({
  quotationNumber: z.string().optional(),
  quotationDate: z.union([z.date(), z.string()]).optional(),
  recipient: z.string().optional(),
  attentionTo: z.string().optional(),
  insured: z.string().optional(),
  insuredAddress: z.string().optional(),
  sumInsured: z.number().positive('Sum insured must be positive').optional(),
  sumInsuredCurrency: z.string().optional(),
  // rate stored as percentage in form (0-100), converted on save
  rate: z.number().min(0, 'Rate must be 0 or higher').max(100, 'Rate cannot exceed 100%').optional(),
  deductible: z.number().min(0, 'Deductible must be 0 or higher').optional(),
  deductibleText: z.string().optional(),
  deductibleBasis: z.string().optional(),
  brokerage: z.number().min(0, 'Brokerage must be 0 or higher').max(100, 'Brokerage cannot exceed 100%').optional(),
  interestInsured: z.string().optional(),
  voyageFrom: z.string().optional(),
  voyageTo: z.string().optional(),
  etd: z.union([z.date(), z.string()]).optional(),
  eta: z.union([z.date(), z.string()]).optional(),
  conveyance: z.string().optional(),
  instituteCargoClause: z.enum(['INSTITUTE_CARGO_A', 'INSTITUTE_CARGO_B', 'INSTITUTE_CARGO_C', 'INSTITUTE_BULK_OIL', 'INSTITUTE_COAL', 'INSTITUTE_CARGO_AIR']).optional(),
  confirmedAcceptedBy: z.string().optional(),
  selectedTerms: z.array(z.unknown()).optional(),
  additionalClauses: z.array(z.unknown()).optional(),
})

/**
 * Validate Cargo form data.
 * Returns array of error messages (empty = valid).
 */
export function validateCargoData(data: CargoFormData): string[] {
  const result = cargoValidationSchema.safeParse(data)
  if (result.success) return []
  return result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`)
}
