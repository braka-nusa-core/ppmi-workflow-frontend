/**
 * lib/adapters/voucher.ts
 *
 * Maps frontend CreateVoucherFormData / UpdateVoucherPayload (camelCase)
 * to the backend's snake_case Zod-validated request body.
 *
 * Required backend fields confirmed from HTTP 400 ZodError:
 *   invoice_id, voucher_number, voucher_date, payment_type, status, remarks
 *
 * Pattern mirrors lib/adapters/qs.ts.
 */

import type { CreateVoucherPayload, UpdateVoucherPayload } from '@/types/voucher'
import type {
  BackendCreateVoucherPayload,
  BackendUpdateVoucherPayload,
  BackendVoucherStatus,
} from '@/types/backend/voucher'

// ─── DateTime helper ──────────────────────────────────────────────
/**
 * Convert a date-input value ("YYYY-MM-DD") to a full ISO-8601 DateTime
 * string required by Prisma ("YYYY-MM-DDTHH:mm:ss.sssZ").
 * Returns undefined for empty/null so optional fields are cleanly omitted.
 */
function dateInputToISO(dateStr: string | undefined | null): string | undefined {
  if (!dateStr) return undefined
  if (dateStr.includes('T')) return dateStr
  return `${dateStr}T00:00:00.000Z`
}

// ─── Create payload mapper ────────────────────────────────────────
/**
 * Map frontend CreateVoucherPayload → BackendCreateVoucherPayload.
 *
 * @param payload   Frontend form data (camelCase)
 * @param status    'DRAFT' for Save Draft, 'SUBMITTED' for Submit — required by backend
 */
export function mapCreateVoucherPayload(
  payload: CreateVoucherPayload,
  status: BackendVoucherStatus = 'DRAFT',
): BackendCreateVoucherPayload {
  return {
    // Required fields confirmed from backend ZodError
    invoice_id:     payload.invoiceId,
    voucher_number: '',                          // backend auto-generates; send empty string
    voucher_date:   new Date().toISOString(),    // today as ISO DateTime
    payment_type:   payload.paymentType,
    status,
    remarks:        payload.internalNotes?.trim() || '-', // required; default '-' if empty

    // Optional — amount & currency
    currency:       payload.currency       || undefined,
    amount:         payload.amount         ?? undefined,

    // Optional — bank details (snake_case)
    bank_name:      payload.bankName       || undefined,
    bank_branch:    payload.bankBranch     || undefined,
    account_number: payload.accountNumber  || undefined,
    account_name:   payload.accountName    || undefined,
    swift_code:     payload.swiftCode      || undefined,

    // Optional — dates (must be ISO DateTime)
    processing_date: dateInputToISO(payload.processingDate),

    // Optional — approval
    approval_pic:    payload.approvalPIC    || undefined,
    approval_notes:  payload.approvalNotes  || undefined,
  }
}

// ─── Update payload mapper ────────────────────────────────────────
/**
 * Map frontend UpdateVoucherPayload → BackendUpdateVoucherPayload.
 * Only includes fields that are explicitly set (PATCH semantics).
 */
export function mapUpdateVoucherPayload(
  payload: UpdateVoucherPayload,
): BackendUpdateVoucherPayload {
  const result: BackendUpdateVoucherPayload = {}

  if (payload.invoiceId    != null) result.invoice_id     = payload.invoiceId
  if (payload.paymentType  != null) result.payment_type   = payload.paymentType
  if (payload.status       != null) result.status         = payload.status
  if (payload.currency     != null) result.currency       = payload.currency
  if (payload.amount       != null) result.amount         = payload.amount

  // remarks: always include if internalNotes is present (even empty string → '-')
  if (payload.internalNotes != null) {
    result.remarks = payload.internalNotes.trim() || '-'
  }

  // Bank (only send if truthy — avoids wiping stored values with empty strings)
  if (payload.bankName      ) result.bank_name      = payload.bankName
  if (payload.bankBranch    ) result.bank_branch    = payload.bankBranch
  if (payload.accountNumber ) result.account_number = payload.accountNumber
  if (payload.accountName   ) result.account_name   = payload.accountName
  if (payload.swiftCode     ) result.swift_code     = payload.swiftCode

  // DateTime fields
  if (payload.processingDate) {
    result.processing_date = dateInputToISO(payload.processingDate)
  }

  // Approval
  if (payload.approvalPIC   ) result.approval_pic   = payload.approvalPIC
  if (payload.approvalNotes ) result.approval_notes = payload.approvalNotes

  return result
}