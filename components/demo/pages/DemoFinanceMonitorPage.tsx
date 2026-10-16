// FILE: components/demo/pages/DemoFinanceMonitorPage.tsx
'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { FinanceMonitorPanel } from '@/components/overview/FinanceMonitorPanel'
import { ROUTES } from '@/config/routes'
import { formatNumber } from '@/lib/format'
import { getDemoFinanceReport } from '@/lib/demo/financeDemoData'
import { getDemoOverview } from '@/lib/demo/overviewDemoData'
import { DemoKpi, DemoSection, DemoTable, idr, idrCompact, useDemoNow } from '@/components/demo/DemoPagePrimitives'

// ═══════════════════════════════════════════════════════════════
// DEMO PAYMENT MONITOR (NEXT_PUBLIC_DEMO_MODE=true only)
// Read-only. All figures derive from the shared demo registry — the same
// records as the Invoice, Incoming Payment and Outgoing Payment demo pages.
// ═══════════════════════════════════════════════════════════════

export function DemoFinanceMonitorPage() {
  const now = useDemoNow()
  const data = useMemo(() => (now ? { r: getDemoFinanceReport(now), o: getDemoOverview(now) } : null), [now])

  const header = (
    <PageHeader
      title="Payment Monitor"
      description="Payment tracking, installment monitoring, and finance verification"
      breadcrumbs={[{ label: 'Finance' }, { label: 'Payment Monitor' }]}
    />
  )
  if (!data) return <div className="page-container">{header}<LoadingSkeleton /></div>

  const { r, o } = data
  const ver = (k: string) => r.verification.find((v) => v.key === k)!
  const overdueAging = r.aging.filter((a) => a.key !== 'not_due')
  const agingTotal   = r.aging.reduce((s, a) => s + a.amount, 0)
  const passed       = r.checks.filter((c) => c.ok).length

  return (
    <div className="page-container">
      {header}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <DemoKpi label="Total invoiced"        value={idrCompact(r.totals.invoiced)}    sub={`${r.totals.invoices} invoices`} href={ROUTES.invoice.list} />
        <DemoKpi label="Collected"             value={idrCompact(r.totals.collected)}   sub="Received from clients" tone="success" href={ROUTES.payment.list} />
        <DemoKpi label="Outstanding"           value={idrCompact(r.totals.outstanding)} sub={`${o.finance.unpaidInvoices} unpaid or partial invoices`} tone="warning" href={ROUTES.payment.list} />
        <DemoKpi label="Overdue"               value={idrCompact(o.finance.overdueTotal)} sub={`${o.finance.overduePayments} payments past due`} tone="danger" href={ROUTES.finance.overdue} />
        <DemoKpi label="Due within 7 days"     value={idrCompact(o.finance.upcomingDue7dTotal)} sub={`${o.finance.upcomingDue7d} payments`} href={ROUTES.payment.list} />
        <DemoKpi label="Awaiting verification" value={String(ver('UNVERIFIED').count)}  sub={`${idrCompact(ver('UNVERIFIED').received)} received`} tone="warning" href={ROUTES.finance.verification} />
        <DemoKpi label="Flagged for review"    value={String(ver('FLAGGED').count)}     sub={`${idrCompact(ver('FLAGGED').received)} received`} tone="danger" href={ROUTES.finance.verification} />
        <DemoKpi label="Insurer payments outstanding" value={idrCompact(r.insurerTotals.outstanding)} sub={`${idrCompact(r.insurerTotals.paid)} of ${idrCompact(r.insurerTotals.obligation)} paid`} href={ROUTES.outgoingPayment.list} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 mb-4">
        <DemoSection title="Receivables aging" description="Outstanding balance by days past due">
          <DemoTable
            rows={r.aging} rowKey={(a) => a.key}
            columns={[
              { header: 'Bucket', render: (a) => a.label, footer: 'Total outstanding' },
              { header: 'Payments', align: 'right', render: (a) => formatNumber(a.count), footer: formatNumber(r.aging.reduce((s, a) => s + a.count, 0)) },
              { header: 'Amount', align: 'right', render: (a) => idr(a.amount), footer: idr(agingTotal) },
            ]}
          />
        </DemoSection>

        <DemoSection title="Collection status" description="Incoming payments by status">
          <DemoTable
            rows={r.paymentStatus} rowKey={(s) => s.key}
            columns={[
              { header: 'Status', render: (s) => s.label, footer: 'Total' },
              { header: 'Count', align: 'right', render: (s) => formatNumber(s.count), footer: formatNumber(r.paymentStatus.reduce((a, s) => a + s.count, 0)) },
              { header: 'Remaining', align: 'right', render: (s) => idr(s.remaining), footer: idr(r.paymentStatus.reduce((a, s) => a + s.remaining, 0)) },
            ]}
          />
        </DemoSection>

        <DemoSection
          title="Verification snapshot" description="Money received, by Finance verification state"
          right={<Link href={ROUTES.finance.verification} className="text-[11px] font-medium text-[#123d6b] hover:underline">Open queue</Link>}
        >
          <DemoTable
            rows={r.verification} rowKey={(v) => v.key}
            columns={[
              { header: 'State', render: (v) => v.label, footer: 'Total' },
              { header: 'Payments', align: 'right', render: (v) => formatNumber(v.count), footer: formatNumber(r.verification.reduce((a, v) => a + v.count, 0)) },
              { header: 'Received', align: 'right', render: (v) => idr(v.received), footer: idr(r.verification.reduce((a, v) => a + v.received, 0)) },
            ]}
          />
        </DemoSection>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4 mb-4">
        <div className="min-w-0">
          <FinanceMonitorPanel summary={o.finance} overdueItems={o.overdueItems} upcomingItems={o.upcomingPayments} />
        </div>
        <DemoSection
          title="Insurer payables" description="Outgoing payments against insurer shares of fully verified collections"
          right={<Link href={ROUTES.outgoingPayment.list} className="text-[11px] font-medium text-[#123d6b] hover:underline">Open outgoing payments</Link>}
        >
          <DemoTable
            rows={r.insurers} rowKey={(i) => i.id}
            columns={[
              { header: 'Insurer', wrap: true, render: (i) => i.name, footer: 'Total' },
              { header: 'Obligation', align: 'right', render: (i) => idr(i.obligation), footer: idr(r.insurerTotals.obligation) },
              { header: 'Paid', align: 'right', render: (i) => idr(i.paid), footer: idr(r.insurerTotals.paid) },
              { header: 'Outstanding', align: 'right', render: (i) => idr(i.outstanding), footer: idr(r.insurerTotals.outstanding) },
            ]}
          />
        </DemoSection>
      </div>

      <p className="text-[11px] text-[#7a8fa3]">
        Overdue in aging ({idr(overdueAging.reduce((s, a) => s + a.amount, 0))}) and outstanding in aging ({idr(agingTotal)}) reconcile with the Incoming Payment records —{' '}
        {passed}/{r.checks.length} reconciliation checks pass (see Reports).
      </p>
    </div>
  )
}