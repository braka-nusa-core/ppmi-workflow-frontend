// FILE: lib/demo/financeDemoData.ts
// ═══════════════════════════════════════════════════════════════
// DEMO DATA — FINANCE MONITOR, REPORTS, OVERDUE & VERIFICATION (NOT REAL DATA)
//
// Every figure is DERIVED from the shared demo registry
// (lib/demo/registry.ts) — the same records the Invoice, Incoming
// Payment, Outgoing Payment, Policy and Shipment demo pages list. Nothing
// here is stored, fetched, or invented separately, so totals always
// reconcile with the records a client can open (see `reconcile()`).
// ═══════════════════════════════════════════════════════════════

import type { Division } from '@/types/workflow'
import type { InvoiceStatus } from '@/types/invoice'
import type { PaymentDocument, PaymentListItem, PaymentStatus, PaymentVerificationStatus } from '@/types/payment'
import { getDemoDataset } from '@/lib/demo/registry'
import { getDemoOverview } from '@/lib/demo/overviewDemoData'

const DAY = 86_400_000

export const DIVISION_LABEL: Record<Division, string> = { PI: 'P&I', HM: 'H&M', CARGO: 'Cargo' }

export interface DemoAmountRow {
  key:       string
  label:     string
  count:     number
  total:     number   // gross amount
  paid:      number
  remaining: number
}

export interface DemoCountRow { key: string; label: string; count: number; amount?: number }

export interface DemoInsurerRow {
  id: string; name: string
  obligation: number; paid: number; outstanding: number
}

export interface DemoOverdueRow extends PaymentListItem { daysOverdue: number; overdueAmount: number }

export interface DemoReconciliationCheck { label: string; left: number; right: number; ok: boolean }

export interface DemoFinanceReport {
  asOf:        string
  currency:    'IDR'
  totals:      { invoices: number; invoiced: number; collected: number; outstanding: number }
  invoiceStatus: DemoAmountRow[]
  paymentStatus: DemoAmountRow[]
  aging:         { key: string; label: string; count: number; amount: number }[]
  verification:  { key: PaymentVerificationStatus | 'NONE'; label: string; count: number; received: number }[]
  divisions:     DemoAmountRow[]
  clients:       DemoAmountRow[]
  insurers:      DemoInsurerRow[]
  insurerTotals: { obligation: number; paid: number; outstanding: number }
  pipeline: {
    policies:  DemoCountRow[]
    rfis:      DemoCountRow[]
    vouchers:  DemoCountRow[]
    outgoing:  DemoCountRow[]
    shipments: number
  }
  checks:        DemoReconciliationCheck[]
}

const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + f(x), 0)

/** Earliest unpaid due date (first unpaid instalment, else the payment due date). */
function nextDue(p: PaymentDocument): string {
  return p.installments?.find((s) => s.status !== 'PAID')?.dueDate ?? p.dueDate
}

function daysPast(iso: string, nowMs: number) { return Math.round((nowMs - Date.parse(iso)) / DAY) }

/** Past-due part of the balance: unpaid past-due instalments, else the whole balance. */
function overduePart(p: PaymentDocument, nowMs: number): number {
  if (p.installments) {
    return sum(p.installments.filter((s) => s.status !== 'PAID' && Date.parse(s.dueDate) < nowMs), (s) => s.amount)
  }
  return p.remainingAmount
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Draft', ISSUED: 'Issued', UNPAID: 'Unpaid', PARTIAL: 'Partial', PAID: 'Paid', OVERDUE: 'Overdue',
  WAITING_POLICY: 'Waiting policy', POLICY_CREATED: 'Policy created', PLACEMENT_IN_PROGRESS: 'Placement in progress',
  PLACEMENT_COMPLETED: 'Placement completed', READY_FOR_RFI: 'Ready for RFI',
  WAITING_FINANCE: 'Waiting Finance', PROCESSED: 'Processed', PENDING: 'Pending', CLOSED: 'Closed',
  WAITING_PAYMENT: 'Waiting payment', PARTIAL_PAYMENT: 'Partial payment', FULLY_PAID: 'Fully paid',
}
const label = (k: string) => STATUS_LABEL[k] ?? k

function countRows(items: { status: string; amount?: number }[], order: string[]): DemoCountRow[] {
  return order.map((k) => {
    const rows = items.filter((i) => i.status === k)
    return { key: k, label: label(k), count: rows.length, amount: rows.some((r) => r.amount !== undefined) ? sum(rows, (r) => r.amount ?? 0) : undefined }
  })
}

export function getDemoFinanceReport(now: Date = new Date()): DemoFinanceReport {
  const ds    = getDemoDataset(now)
  const nowMs = now.getTime()

  // ── Invoices ──────────────────────────────────────────────
  const invoiceOrder: InvoiceStatus[] = ['DRAFT', 'ISSUED', 'UNPAID', 'PARTIAL', 'PAID']
  const invoiceStatus: DemoAmountRow[] = invoiceOrder.map((st) => {
    const rows = ds.invoices.filter((i) => i.status === st)
    return { key: st, label: label(st), count: rows.length, total: sum(rows, (i) => i.totalAmount),
             paid: sum(rows, (i) => i.paidAmount), remaining: sum(rows, (i) => i.remainingAmount) }
  })
  const totals = {
    invoices:    ds.invoices.length,
    invoiced:    sum(ds.invoices, (i) => i.totalAmount),
    collected:   sum(ds.invoices, (i) => i.paidAmount),
    outstanding: sum(ds.invoices, (i) => i.remainingAmount),
  }

  // ── Incoming payments by status ───────────────────────────
  const payOrder: PaymentStatus[] = ['UNPAID', 'PARTIAL', 'OVERDUE', 'PAID']
  const paymentStatus: DemoAmountRow[] = payOrder.map((st) => {
    const rows = ds.payments.filter((p) => p.paymentStatus === st)
    return { key: st, label: label(st), count: rows.length, total: sum(rows, (p) => p.totalAmount),
             paid: sum(rows, (p) => p.paidAmount), remaining: sum(rows, (p) => p.remainingAmount) }
  })

  // ── Receivables aging (outstanding balance by days past due) ──
  const buckets = [
    { key: 'not_due', label: 'Not yet due',     count: 0, amount: 0 },
    { key: 'd1_7',    label: '1–7 days overdue', count: 0, amount: 0 },
    { key: 'd8_30',   label: '8–30 days overdue', count: 0, amount: 0 },
    { key: 'd31p',    label: '31+ days overdue', count: 0, amount: 0 },
  ]
  const put = (key: string, amount: number) => { const b = buckets.find((x) => x.key === key)!; b.count += 1; b.amount += amount }
  ds.payments.filter((p) => p.remainingAmount > 0).forEach((p) => {
    const late = overduePart(p, nowMs) > 0 && (p.paymentStatus === 'OVERDUE')
    const overdueAmt = late ? overduePart(p, nowMs) : 0
    if (overdueAmt > 0) {
      const d = daysPast(nextDue(p), nowMs)
      put(d <= 7 ? 'd1_7' : d <= 30 ? 'd8_30' : 'd31p', overdueAmt)
    }
    if (p.remainingAmount - overdueAmt > 0) put('not_due', p.remainingAmount - overdueAmt)
  })

  // ── Verification snapshot (money received so far) ─────────
  const verRows: DemoFinanceReport['verification'] = [
    { key: 'VERIFIED',   label: 'Verified',              count: 0, received: 0 },
    { key: 'UNVERIFIED', label: 'Awaiting verification', count: 0, received: 0 },
    { key: 'FLAGGED',    label: 'Flagged for review',    count: 0, received: 0 },
    { key: 'NONE',       label: 'No payment received',   count: 0, received: 0 },
  ]
  ds.payments.forEach((p) => {
    const key = p.paidAmount === 0 ? 'NONE' : p.verificationStatus
    const r = verRows.find((x) => x.key === key)!; r.count += 1; r.received += p.paidAmount
  })

  // ── By division and by client ─────────────────────────────
  const divisions: DemoAmountRow[] = (['PI', 'HM', 'CARGO'] as Division[]).map((dv) => {
    const rows = ds.invoices.filter((i) => i.division === dv)
    return { key: dv, label: DIVISION_LABEL[dv], count: rows.length, total: sum(rows, (i) => i.totalAmount),
             paid: sum(rows, (i) => i.paidAmount), remaining: sum(rows, (i) => i.remainingAmount) }
  })
  const clientNames = Array.from(new Set(ds.invoices.map((i) => i.insuredName))).sort()
  const clients: DemoAmountRow[] = clientNames.map((name) => {
    const rows = ds.invoices.filter((i) => i.insuredName === name)
    return { key: name, label: name, count: rows.length, total: sum(rows, (i) => i.totalAmount),
             paid: sum(rows, (i) => i.paidAmount), remaining: sum(rows, (i) => i.remainingAmount) }
  }).sort((a, b) => b.remaining - a.remaining || b.total - a.total)

  // ── Insurer payables: obligation = invoice total × share, once the client payment is verified in full ──
  const insurerMap = new Map<string, DemoInsurerRow>()
  const row = (id: string, name: string) => {
    if (!insurerMap.has(id)) insurerMap.set(id, { id, name, obligation: 0, paid: 0, outstanding: 0 })
    return insurerMap.get(id)!
  }
  ds.invoices.forEach((inv) => {
    const pay = ds.payments.find((p) => p.invoiceId === inv.id)
    if (!pay || pay.paymentStatus !== 'PAID' || pay.verificationStatus !== 'VERIFIED') return
    const pol = ds.policies.find((p) => p.policyNumber === inv.policyNumber)
    pol?.participants.forEach((pt) => { row(pt.insuranceCompanyId, pt.insuranceCompanyName ?? '').obligation += inv.totalAmount * pt.sharePercentage / 100 })
  })
  ds.outgoing.forEach((o) => { row(o.insuranceCompanyId, o.insuranceCompanyName).paid += o.amount })
  const insurers = Array.from(insurerMap.values()).map((r) => ({ ...r, outstanding: r.obligation - r.paid })).sort((a, b) => a.name.localeCompare(b.name))
  const insurerTotals = {
    obligation: sum(insurers, (r) => r.obligation), paid: sum(insurers, (r) => r.paid), outstanding: sum(insurers, (r) => r.outstanding),
  }

  // ── Pipeline counts (for the Reports page) ────────────────
  const pipeline = {
    policies: countRows(ds.policies.map((p) => ({ status: p.status })),
      ['POLICY_CREATED', 'PLACEMENT_IN_PROGRESS', 'PLACEMENT_COMPLETED', 'READY_FOR_RFI']),
    rfis: countRows(ds.rfis.map((r) => ({ status: r.status })), ['DRAFT', 'WAITING_FINANCE', 'PROCESSED']),
    vouchers: countRows(ds.vouchers.map((v) => ({ status: v.status, amount: v.amount })), ['DRAFT', 'PENDING', 'CLOSED']),
    outgoing: countRows(ds.outgoing.map((o) => ({ status: o.status, amount: o.amount })), ['WAITING_PAYMENT', 'PARTIAL_PAYMENT', 'FULLY_PAID']),
    shipments: ds.shipments.length,
  }

  // ── Reconciliation (computed, never hard-coded) ───────────
  const ov = getDemoOverview(now).finance
  const chk = (l: string, a: number, b: number): DemoReconciliationCheck => ({ label: l, left: a, right: b, ok: Math.round(a) === Math.round(b) })
  const checks: DemoReconciliationCheck[] = [
    chk('Invoiced total = Σ incoming payment totals', totals.invoiced, sum(ds.payments, (p) => p.totalAmount)),
    chk('Collected = Σ received across verification states', totals.collected, sum(verRows, (r) => r.received)),
    chk('Outstanding = Σ aging buckets', totals.outstanding, sum(buckets, (b) => b.amount)),
    chk('Outstanding = invoiced − collected', totals.outstanding, totals.invoiced - totals.collected),
    chk('Invoice-status totals = invoiced', sum(invoiceStatus, (r) => r.total), totals.invoiced),
    chk('Payment-status totals = invoiced', sum(paymentStatus, (r) => r.total), totals.invoiced),
    chk('Division totals = invoiced', sum(divisions, (r) => r.total), totals.invoiced),
    chk('Client totals = invoiced', sum(clients, (r) => r.total), totals.invoiced),
    chk('Insurer payments = Σ outgoing payment records', insurerTotals.paid, sum(ds.outgoing, (o) => o.amount)),
    chk('Overdue (aging) = Overview overdue total', buckets.filter((b) => b.key !== 'not_due').reduce((s, b) => s + b.amount, 0), ov.overdueTotal),
    chk('Outstanding = Overview unpaid total', totals.outstanding, ov.unpaidTotal),
  ]

  return {
    asOf: now.toISOString(), currency: 'IDR', totals, invoiceStatus, paymentStatus,
    aging: buckets, verification: verRows, divisions, clients, insurers, insurerTotals, pipeline, checks,
  }
}

// ─── Overdue & Verification queues ─────────────────────────────────
export function getDemoOverdueQueue(now: Date = new Date()): DemoOverdueRow[] {
  const ds    = getDemoDataset(now)
  const nowMs = now.getTime()
  return ds.paymentList
    .filter((p) => p.paymentStatus === 'OVERDUE')
    .map((p) => {
      const doc = ds.payments.find((x) => x.id === p.id)!
      return { ...p, daysOverdue: Math.max(1, daysPast(nextDue(doc), nowMs)), overdueAmount: overduePart(doc, nowMs) }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
}

export type VerificationView = 'pending' | 'flagged' | 'verified'

/** Payments with money received, split by Finance verification state. */
export function getDemoVerificationQueue(view: VerificationView, now: Date = new Date()): PaymentListItem[] {
  const want: PaymentVerificationStatus = view === 'pending' ? 'UNVERIFIED' : view === 'flagged' ? 'FLAGGED' : 'VERIFIED'
  return getDemoDataset(now).paymentList.filter((p) => p.paidAmount > 0 && p.verificationStatus === want)
}