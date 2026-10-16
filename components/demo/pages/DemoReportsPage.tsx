// FILE: components/demo/pages/DemoReportsPage.tsx
'use client'

import { useMemo } from 'react'
import { Check, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { formatNumber } from '@/lib/format'
import { getDemoFinanceReport, type DemoAmountRow, type DemoCountRow } from '@/lib/demo/financeDemoData'
import { DemoKpi, DemoSection, DemoTable, idr, idrCompact, useDemoNow, type DemoColumn } from '@/components/demo/DemoPagePrimitives'

// ═══════════════════════════════════════════════════════════════
// DEMO REPORTS (NEXT_PUBLIC_DEMO_MODE=true only) — read-only.
// Every table is computed from the same demo records as the module lists
// (Policy, RFI, Voucher, Invoice, Incoming/Outgoing Payment, Shipment);
// each carries a Total row and the checks at the bottom are computed live.
// ═══════════════════════════════════════════════════════════════

const sumBy = <T,>(rows: T[], f: (r: T) => number) => rows.reduce((s, r) => s + f(r), 0)

function amountColumns(first: string, rows: DemoAmountRow[]): DemoColumn<DemoAmountRow>[] {
  return [
    { header: first, render: (r) => r.label, footer: 'Total' },
    { header: 'Count', align: 'right', render: (r) => formatNumber(r.count), footer: formatNumber(sumBy(rows, (r) => r.count)) },
    { header: 'Invoiced', align: 'right', render: (r) => idr(r.total), footer: idr(sumBy(rows, (r) => r.total)) },
    { header: 'Collected', align: 'right', render: (r) => idr(r.paid), footer: idr(sumBy(rows, (r) => r.paid)) },
    { header: 'Outstanding', align: 'right', render: (r) => idr(r.remaining), footer: idr(sumBy(rows, (r) => r.remaining)) },
  ]
}

function countColumns(first: string, rows: DemoCountRow[]): DemoColumn<DemoCountRow>[] {
  const hasAmount = rows.some((r) => r.amount !== undefined)
  const cols: DemoColumn<DemoCountRow>[] = [
    { header: first, render: (r) => r.label, footer: 'Total' },
    { header: 'Count', align: 'right', render: (r) => formatNumber(r.count), footer: formatNumber(sumBy(rows, (r) => r.count)) },
  ]
  if (hasAmount) cols.push({ header: 'Amount', align: 'right', render: (r) => idr(r.amount ?? 0), footer: idr(sumBy(rows, (r) => r.amount ?? 0)) })
  return cols
}

export function DemoReportsPage() {
  const now = useDemoNow()
  const r   = useMemo(() => (now ? getDemoFinanceReport(now) : null), [now])

  const header = (
    <PageHeader title="Reports" description="Operational reports and analytics" breadcrumbs={[{ label: 'Reports' }]} />
  )
  if (!r) return <div className="page-container">{header}<LoadingSkeleton /></div>

  const passed = r.checks.filter((c) => c.ok).length

  return (
    <div className="page-container">
      {header}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <DemoKpi label="Total invoiced" value={idrCompact(r.totals.invoiced)}    sub={`${r.totals.invoices} invoices`} />
        <DemoKpi label="Collected"      value={idrCompact(r.totals.collected)}   tone="success" sub="Received from clients" />
        <DemoKpi label="Outstanding"    value={idrCompact(r.totals.outstanding)} tone="warning" sub="Invoiced − collected" />
        <DemoKpi label="Paid to insurers" value={idrCompact(r.insurerTotals.paid)} sub={`${idrCompact(r.insurerTotals.outstanding)} still payable`} />
      </div>

      <p className="text-[11px] text-[#7a8fa3] mb-3">
        Operational pipeline — number of records in each module, by status.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4 mb-4">
        <DemoSection title="Policy Placement">
          <DemoTable rows={r.pipeline.policies} rowKey={(x) => x.key} columns={countColumns('Status', r.pipeline.policies)} />
        </DemoSection>
        <DemoSection title="Request For Invoice">
          <DemoTable rows={r.pipeline.rfis} rowKey={(x) => x.key} columns={countColumns('Status', r.pipeline.rfis)} />
        </DemoSection>
        <DemoSection title="Vouchers">
          <DemoTable rows={r.pipeline.vouchers} rowKey={(x) => x.key} columns={countColumns('Status', r.pipeline.vouchers)} />
        </DemoSection>
        <DemoSection title="Outgoing payments" description={`${r.pipeline.shipments} policy-document shipments dispatched`}>
          <DemoTable rows={r.pipeline.outgoing} rowKey={(x) => x.key} columns={countColumns('Status', r.pipeline.outgoing)} />
        </DemoSection>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 mb-4">
        <DemoSection title="Invoices" description="Invoices by status">
          <DemoTable rows={r.invoiceStatus} rowKey={(x) => x.key} columns={amountColumns('Status', r.invoiceStatus)} />
        </DemoSection>
        <DemoSection title="Incoming payments" description="Incoming payments by status">
          <DemoTable rows={r.paymentStatus} rowKey={(x) => x.key} columns={amountColumns('Status', r.paymentStatus)} />
        </DemoSection>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 mb-4">
        <DemoSection title="Receivables by division" description="Invoices grouped by business division">
          <DemoTable rows={r.divisions} rowKey={(x) => x.key} columns={amountColumns('Division', r.divisions)} />
        </DemoSection>
        <DemoSection title="Receivables aging" description="Outstanding balance by days past due">
          <DemoTable
            rows={r.aging} rowKey={(a) => a.key}
            columns={[
              { header: 'Bucket', render: (a) => a.label, footer: 'Total' },
              { header: 'Payments', align: 'right', render: (a) => formatNumber(a.count), footer: formatNumber(sumBy(r.aging, (a) => a.count)) },
              { header: 'Amount', align: 'right', render: (a) => idr(a.amount), footer: idr(sumBy(r.aging, (a) => a.amount)) },
            ]}
          />
        </DemoSection>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 mb-4">
        <DemoSection title="Receivables by client" description="Largest outstanding balance first">
          <DemoTable rows={r.clients} rowKey={(x) => x.key} columns={amountColumns('Client', r.clients)} />
        </DemoSection>
        <DemoSection title="Insurer payables" description="Share of fully verified collections vs outgoing payments">
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

      <DemoSection
        title="Reconciliation"
        description={`${passed} of ${r.checks.length} checks pass — computed from the demo records, not hard-coded`}
      >
        <DemoTable
          rows={r.checks} rowKey={(c) => c.label}
          columns={[
            { header: 'Check', render: (c) => c.label },
            { header: 'Left', align: 'right', render: (c) => idr(c.left) },
            { header: 'Right', align: 'right', render: (c) => idr(c.right) },
            { header: 'Result', render: (c) => c.ok
              ? <span className="inline-flex items-center gap-1 text-[#1a5c38]"><Check size={13} /> Reconciled</span>
              : <span className="inline-flex items-center gap-1 text-[#8c1f1f]"><X size={13} /> Mismatch</span> },
          ]}
        />
      </DemoSection>
    </div>
  )
}