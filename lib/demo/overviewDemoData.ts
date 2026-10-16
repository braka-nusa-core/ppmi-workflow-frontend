// FILE: lib/demo/overviewDemoData.ts
// ═══════════════════════════════════════════════════════════════
// DEMO DATA — OVERVIEW DOWNSTREAM MODULES (NOT REAL DATA)
//
// Phase C: every figure here is DERIVED from the shared demo registry
// (lib/demo/registry.ts), the same source the Policy / RFI / Voucher /
// Invoice / Payment / Outgoing Payment / Shipment demo pages read. So
// counts, amounts, due dates and document numbers on the Overview always
// match what the client sees after clicking through.
//
// Quotation (QS) figures are NOT here — they come from the real
// GET /quotations response (lib/adapters/quotationOverview.ts).
// ═══════════════════════════════════════════════════════════════

import { ROUTES } from '@/config/routes'
import type { FinanceSummary, OverdueItem, UpcomingPaymentItem } from '@/types/overview'
import type { PaymentDocument } from '@/types/payment'
import { getDemoDataset } from '@/lib/demo/registry'

export type DemoActivityKind =
  | 'placement'
  | 'rfi'
  | 'voucher'
  | 'invoice'
  | 'payment'
  | 'overdue'
  | 'installment'

export interface DemoActivity {
  id:          string
  kind:        DemoActivityKind
  title:       string
  description: string
  actor:       string
  docNumber:   string
  timestamp:   string   // ISO
}

export type DemoModuleKey = 'PLACEMENT' | 'VOUCHER' | 'RFI' | 'INVOICE' | 'PAYMENT'

export interface DemoModuleSummary {
  key:        DemoModuleKey
  label:      string
  href:       string
  inProgress: number
  completed:  number
  attention:  number
}

export interface DemoOverview {
  modules:          DemoModuleSummary[]
  activity:         DemoActivity[]
  finance:          FinanceSummary
  overdueItems:     OverdueItem[]
  upcomingPayments: UpcomingPaymentItem[]
}

const DAY = 86_400_000

/** Amount currently overdue on a payment: unpaid past-due instalments, else the remaining balance. */
function overdueAmount(p: PaymentDocument, nowMs: number): number {
  if (p.installments) {
    return p.installments
      .filter((s) => s.status !== 'PAID' && Date.parse(s.dueDate) < nowMs)
      .reduce((sum, s) => sum + s.amount, 0)
  }
  return p.remainingAmount
}

/** Earliest unpaid due date of a payment (first unpaid instalment, else the payment due date). */
function nextDueDate(p: PaymentDocument): string {
  const next = p.installments?.find((s) => s.status !== 'PAID')
  return next?.dueDate ?? p.dueDate
}

export function getDemoOverview(now: Date = new Date()): DemoOverview {
  const ds    = getDemoDataset(now)
  const nowMs = now.getTime()

  const overduePayments = ds.payments.filter((p) => p.paymentStatus === 'OVERDUE')
  const openPayments    = ds.payments.filter((p) => p.paymentStatus !== 'PAID')

  const overdueItems: OverdueItem[] = overduePayments
    .map((p) => {
      const due = nextDueDate(p)
      return {
        id: p.id, docNumber: p.invoiceNumber, clientName: p.insuredName, division: p.division,
        amount: overdueAmount(p, nowMs), currency: p.currency, dueDate: due,
        daysOverdue: Math.max(1, Math.round((nowMs - Date.parse(due)) / DAY)),
        paymentStatus: 'OVERDUE' as const,
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)

  const upcomingPayments: UpcomingPaymentItem[] = openPayments
    .filter((p) => p.paymentStatus !== 'OVERDUE')
    .map((p) => {
      const due = nextDueDate(p)
      return {
        id: p.id, docNumber: p.invoiceNumber, clientName: p.insuredName, division: p.division,
        amount: p.installments ? (p.installments.find((s) => s.status !== 'PAID')?.amount ?? p.remainingAmount) : p.remainingAmount,
        currency: p.currency, dueDate: due, daysLeft: Math.round((Date.parse(due) - nowMs) / DAY),
      }
    })
    .filter((u) => u.daysLeft >= 0 && u.daysLeft <= 7)
    .sort((a, b) => a.daysLeft - b.daysLeft)

  const finance: FinanceSummary = {
    unpaidInvoices:      ds.invoices.filter((i) => i.remainingAmount > 0).length,
    unpaidTotal:         ds.invoices.reduce((s, i) => s + i.remainingAmount, 0),
    overduePayments:     overdueItems.length,
    overdueTotal:        overdueItems.reduce((s, i) => s + i.amount, 0),
    upcomingDue7d:       upcomingPayments.length,
    upcomingDue7dTotal:  upcomingPayments.reduce((s, i) => s + i.amount, 0),
    activeInstallments:  ds.payments.filter((p) => p.isInstallment && p.remainingAmount > 0).length,
    installmentsPending: ds.payments.reduce(
      (s, p) => s + (p.installments?.filter((x) => x.status !== 'PAID').length ?? 0), 0),
    currency:            'IDR',
  }

  // ── Module counters (rules documented per line) ───────────────
  const placementOpen = ds.policies.filter((p) =>
    p.status === 'WAITING_POLICY' || p.status === 'POLICY_CREATED' || p.status === 'PLACEMENT_IN_PROGRESS')
  const modules: DemoModuleSummary[] = [
    {
      key: 'PLACEMENT', label: 'Policy Placement', href: ROUTES.policy.list,
      inProgress: placementOpen.length, completed: ds.policies.length - placementOpen.length,
      attention:  placementOpen.filter((p) => (p.totalShare ?? 0) < 100).length,            // share not yet 100%
    },
    {
      key: 'VOUCHER', label: 'Voucher', href: ROUTES.voucher.list,
      inProgress: ds.vouchers.filter((v) => v.status !== 'CLOSED').length,
      completed:  ds.vouchers.filter((v) => v.status === 'CLOSED').length,
      attention:  ds.vouchers.filter((v) => v.status === 'PENDING').length,                // awaiting approval
    },
    {
      key: 'RFI', label: 'Request For Invoice', href: ROUTES.rfi.list,
      inProgress: ds.rfis.filter((r) => r.status === 'DRAFT' || r.status === 'WAITING_FINANCE').length,
      completed:  ds.rfis.filter((r) => r.status === 'PROCESSED').length,
      attention:  ds.rfis.filter((r) => r.status === 'DRAFT').length,                      // still a draft
    },
    {
      key: 'INVOICE', label: 'Invoice', href: ROUTES.invoice.list,
      inProgress: finance.unpaidInvoices,
      completed:  ds.invoices.filter((i) => i.remainingAmount === 0).length,
      attention:  overduePayments.length,                                                  // overdue
    },
    {
      key: 'PAYMENT', label: 'Payment', href: ROUTES.payment.list,
      inProgress: openPayments.length,
      completed:  ds.payments.length - openPayments.length,
      attention:  overduePayments.length,                                                  // overdue
    },
  ]

  // ── Recent activity: newest events across all downstream records ──
  const events: DemoActivity[] = []
  ds.policies.forEach((p) => {
    const done = p.status === 'PLACEMENT_COMPLETED' || p.status === 'READY_FOR_RFI'
    events.push({
      id: `act-${p.id}`, kind: 'placement', docNumber: p.policyNumber, timestamp: p.updatedAt,
      title: done ? 'Policy placement completed' : 'Policy created',
      description: `${p.insured} — ${p.quotationNumber}`,
      actor: ds.policyHistory[p.id]?.[0]?.performedBy ?? 'Teknik',
    })
  })
  ds.rfis.forEach((r) => events.push({
    id: `act-${r.id}`, kind: 'rfi', docNumber: r.id,
    timestamp: r.submittedAt ?? r.createdAt,
    title: r.submittedAt ? 'RFI submitted' : 'RFI drafted',
    description: `${r.insured} — policy ${r.policyNumber}`, actor: r.requestedBy,
  }))
  ds.vouchers.forEach((v) => events.push({
    id: `act-${v.id}`, kind: 'voucher', docNumber: v.docNumber, timestamp: v.updatedAt,
    title: v.status === 'CLOSED' ? 'Voucher issued' : 'Voucher awaiting approval',
    description: `${v.insuredName} — ${v.rfiNumber}`, actor: v.processedBy ?? v.createdBy,
  }))
  ds.invoices.forEach((i) => events.push({
    id: `act-${i.id}`, kind: 'invoice', docNumber: i.docNumber, timestamp: i.issueDate,
    title: 'Invoice issued', description: `${i.insuredName} — ${i.voucherInvoiceNumber}`, actor: i.createdBy,
  }))
  ds.payments.forEach((p) => {
    p.activity.forEach((a) => events.push({
      id: `act-${a.id}`,
      kind: p.isInstallment ? 'installment' : p.verificationStatus === 'FLAGGED' ? 'overdue' : 'payment',
      docNumber: p.docNumber, timestamp: a.createdAt,
      title: p.isInstallment ? 'Instalment recorded'
        : p.verificationStatus === 'VERIFIED' ? 'Payment verified'
        : p.verificationStatus === 'FLAGGED'  ? 'Payment flagged for review'
        : 'Payment received — awaiting verification',
      description: `${p.insuredName} — ${p.invoiceNumber}`, actor: a.performedBy,
    }))
    if (p.paymentStatus === 'OVERDUE') events.push({
      id: `act-od-${p.id}`, kind: 'overdue', docNumber: p.invoiceNumber, timestamp: nextDueDate(p),
      title: 'Payment overdue', description: p.insuredName, actor: 'System',
    })
  })
  ds.outgoing.forEach((o) => events.push({
    id: `act-${o.id}`, kind: 'payment', docNumber: o.docNumber, timestamp: o.paymentDate,
    title: 'Insurer payment recorded', description: `${o.insuranceCompanyName} — ${o.invoiceNumber}`, actor: o.createdBy,
  }))
  ds.shipments.forEach((s) => events.push({
    id: `act-${s.id}`, kind: 'payment', docNumber: s.docNumber, timestamp: s.shippingDate,
    title: 'Policy documents dispatched', description: `${s.courier} — ${s.invoiceNumber}`, actor: 'Finance Team',
  }))

  const activity = events
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 7)

  return { modules, activity, finance, overdueItems, upcomingPayments }
}