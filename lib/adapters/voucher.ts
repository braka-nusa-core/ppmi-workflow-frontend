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

import type {
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherDocument,
  VoucherListItem,
  VoucherStatus,
} from '@/types/voucher'
import type {
  BackendCreateVoucherPayload,
  BackendUpdateVoucherPayload,
  BackendVoucherStatus,
  BackendVoucherListItem,
  BackendVoucherDetail,
} from '@/types/backend/voucher'

// ─── toISO helper (response side) ──────────────────────────────────
/** Prisma DateTime may arrive as a Date or an ISO string — normalize to string. */
function toISO(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) return value.toISOString()
  return value
}

// ─── Backend VoucherStatus ↔ frontend VoucherStatus ────────────────
// Identical value sets (both DRAFT/PENDING/CLOSED). Kept as an explicit
// pass-through function, mirroring qs.ts's toFrontendStatus, so any future
// divergence between the two enums is isolated to this one place.
function toFrontendVoucherStatus(status: BackendVoucherStatus): VoucherStatus {
  return status as VoucherStatus
}

// ════════════════════════════════════════════════════════════════
// RESPONSE ADAPTERS  (backend → frontend)
// ════════════════════════════════════════════════════════════════

/**
 * Map a single BackendVoucherListItem → VoucherListItem (one table row).
 *
 * The backend's listVouchers()/getVoucher() include only `invoice` (id,
 * invoice_number) and `bank` (id, name) — there is no `qs`, `payments`, or
 * `division` relation on this response. Fields with no backend source are
 * defaulted below rather than left to throw, consistent with how
 * lib/adapters/qs.ts handles fields absent from its own backend response
 * (e.g. `hasInvoice: false`).
 */
export function mapVoucherListItem(item: BackendVoucherListItem): VoucherListItem {
  return {
    id:             item.id,
    docNumber:      item.id,                       // id IS the doc number (VCH-YYYYMMDD-NNN)
    division:       'PI',                           // Not in backend response — no division relation on Voucher
    invoiceNumber:  item.invoice?.invoice_number ?? '',
    qsNumber:       '',                              // Not in backend response — no qs relation on Voucher
    insuredName:    '',                              // Not in backend response — no qs/invoice insured data included
    paymentType:    item.payment_type,
    bankName:       item.bank?.name ?? '',
    currency:       item.currency as 'IDR' | 'USD',
    amount:         item.amount,
    status:         toFrontendVoucherStatus(item.status),
    hasPayment:     false,                           // Not in backend response — payments relation not included
    paymentNumber:  undefined,
    createdAt:      toISO(item.created_at),
  }
}

/** Map BackendVoucherDetail → VoucherDocument (detail page). */
export function mapVoucherDetail(item: BackendVoucherDetail): VoucherDocument {
  return {
    id:             item.id,
    docNumber:      item.id,
    division:       'PI',                           // Not in backend response
    status:         toFrontendVoucherStatus(item.status),

    // Linked documents
    invoiceId:      item.invoice_id,
    invoiceNumber:  item.invoice?.invoice_number ?? '',
    qsId:           '',                              // Not in backend response — no qs relation on Voucher
    qsNumber:       '',                              // Not in backend response
    paymentId:      undefined,                       // Not in backend response — payments relation not included
    paymentNumber:  undefined,

    // Insured info (from invoice) — not available on this response
    insuredName:    '',
    vesselName:     undefined,

    // Payment info
    paymentType:    item.payment_type,
    currency:       item.currency as 'IDR' | 'USD',
    amount:         item.amount,

    // Bank info — only bank.id/bank.name are selected on the backend;
    // account number/name/branch/swift are not part of this response
    bankName:       item.bank?.name ?? '',
    bankBranch:     undefined,
    accountNumber:  '',
    accountName:    '',
    swiftCode:      undefined,

    // Processing — not in backend response
    processingDate: undefined,
    processedDate:  undefined,
    processedBy:    undefined,

    // Approval — not in backend response
    approvalPIC:     undefined,
    approvalNotes:   undefined,
    approvedBy:      undefined,
    approvedAt:      undefined,
    rejectedBy:      undefined,
    rejectedAt:      undefined,
    rejectionReason: undefined,

    // Notes & attachments
    internalNotes:  item.remarks,
    attachments:    [],

    // Meta — createdBy/updatedBy not in backend response
    createdBy:      '',
    createdAt:      toISO(item.created_at),
    updatedBy:      undefined,
    updatedAt:      toISO(item.updated_at),
    activity:       [],
  }
}

// ─── DateTime helper (request side) ────────────────────────────────
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
 * @param status    'DRAFT' for Save Draft, 'PENDING' for Submit — required by backend
 */
export function mapCreateVoucherPayload(
  payload: CreateVoucherPayload,
  status: BackendVoucherStatus = 'DRAFT',
): BackendCreateVoucherPayload {
  return {
    // Required fields confirmed from backend ZodError
    invoice_id:     payload.invoiceId,
    voucher_number: payload.voucherNumber,       // user-entered; backend does not auto-generate this
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