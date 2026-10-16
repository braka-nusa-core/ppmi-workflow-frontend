// FILE: components/demo/pages/DemoPaymentQueuePage.tsx
'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DataTable, type ColumnDef } from '@/components/table/DataTable'
import { TableFilters } from '@/components/table/TableFilters'
import { TableActions } from '@/components/table/TableActions'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { PaymentStatusBadge } from '@/components/payment/PaymentStatusBadge'
import { useDataTable } from '@/hooks/useDataTable'
import { ROUTES } from '@/config/routes'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDateShort } from '@/lib/format'
import { demoList } from '@/lib/demo/query'
import {
  getDemoOverdueQueue, getDemoVerificationQueue,
  type DemoOverdueRow, type VerificationView,
} from '@/lib/demo/financeDemoData'
import { useDemoNow } from '@/components/demo/DemoPagePrimitives'
import type { PaymentListItem, PaymentVerificationStatus } from '@/types/payment'

// ═══════════════════════════════════════════════════════════════
// DEMO OVERDUE / VERIFICATION QUEUES (NEXT_PUBLIC_DEMO_MODE=true only)
// Read-only filtered views of the demo Incoming Payment records:
//   overdue      → paymentStatus === 'OVERDUE'
//   verification → money received (paid > 0) grouped by verification state
// ═══════════════════════════════════════════════════════════════

const money = (n: number) => formatCurrency(n, 'IDR')

const VERIFICATION_BADGE: Record<PaymentVerificationStatus, { label: string; bg: string; text: string; border: string }> = {
  UNVERIFIED: { label: 'Awaiting verification', bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a' },
  FLAGGED:    { label: 'Flagged',               bg: '#fdecea', text: '#8c1f1f', border: '#f0a0a0' },
  VERIFIED:   { label: 'Verified',              bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4' },
}

function VerificationBadge({ status }: { status: PaymentVerificationStatus }) {
  const c = VERIFICATION_BADGE[status]
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border"
          style={{ background: c.bg, color: c.text, borderColor: c.border }}>{c.label}</span>
  )
}

const mono = 'text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight'
const invoiceLink = (row: PaymentListItem) => (
  <a href={ROUTES.invoice.detail(row.invoiceId)} onClick={(e) => e.stopPropagation()}
     className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline">{row.invoiceNumber}</a>
)

function overdueColumns(onView: (r: DemoOverdueRow) => void): ColumnDef<DemoOverdueRow>[] {
  return [
    { key: 'docNumber', header: 'Payment No.', width: 160, sticky: 'left', render: (r) => <span className={mono}>{r.docNumber}</span> },
    { key: 'invoiceNumber', header: 'Invoice Ref.', width: 136, render: invoiceLink },
    { key: 'insuredName', header: 'Insured', minWidth: 170, sortable: true, render: (r) => <span className="text-[13px] font-medium text-[#18273a]">{r.insuredName}</span> },
    { key: 'overdueAmount', header: 'Overdue amount', width: 140, align: 'right', sortable: true, render: (r) => <span className="text-[12px] font-medium text-[#8c1f1f] tabular-nums">{money(r.overdueAmount)}</span> },
    { key: 'daysOverdue', header: 'Days overdue', width: 120, align: 'right', sortable: true, render: (r) => <span className="text-[12px] font-semibold text-[#8c1f1f] tabular-nums">{r.daysOverdue}</span> },
    { key: 'remainingAmount', header: 'Remaining', width: 130, align: 'right', render: (r) => <span className="text-[12px] text-[#3a5068] tabular-nums">{money(r.remainingAmount)}</span> },
    { key: 'dueDate', header: 'Due Date', width: 110, sortable: true, render: (r) => <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(r.dueDate)}</span> },
    { key: 'paymentStatus', header: 'Status', width: 120, render: (r) => <PaymentStatusBadge status={r.paymentStatus} /> },
    { key: 'actions', header: '', width: 60, sticky: 'right', className: 'bg-white', render: (r) => <TableActions onView={() => onView(r)} /> },
  ]
}

function verificationColumns(onView: (r: PaymentListItem) => void): ColumnDef<PaymentListItem>[] {
  return [
    { key: 'docNumber', header: 'Payment No.', width: 160, sticky: 'left', render: (r) => <span className={mono}>{r.docNumber}</span> },
    { key: 'invoiceNumber', header: 'Invoice Ref.', width: 136, render: invoiceLink },
    { key: 'insuredName', header: 'Insured', minWidth: 170, sortable: true, render: (r) => <span className="text-[13px] font-medium text-[#18273a]">{r.insuredName}</span> },
    { key: 'totalAmount', header: 'Invoice total', width: 130, align: 'right', sortable: true, render: (r) => <span className="text-[12px] text-[#7a8fa3] tabular-nums">{money(r.totalAmount)}</span> },
    { key: 'paidAmount', header: 'Received', width: 130, align: 'right', sortable: true, render: (r) => <span className="text-[12px] font-medium text-[#1a5c38] tabular-nums">{money(r.paidAmount)}</span> },
    { key: 'remainingAmount', header: 'Remaining', width: 130, align: 'right', render: (r) => <span className="text-[12px] text-[#3a5068] tabular-nums">{money(r.remainingAmount)}</span> },
    { key: 'paymentStatus', header: 'Payment', width: 110, render: (r) => <PaymentStatusBadge status={r.paymentStatus} /> },
    { key: 'verificationStatus', header: 'Verification', width: 170, render: (r) => <VerificationBadge status={r.verificationStatus} /> },
    { key: 'actions', header: '', width: 60, sticky: 'right', className: 'bg-white', render: (r) => <TableActions onView={() => onView(r)} /> },
  ]
}

const TABS: { view: VerificationView; label: string }[] = [
  { view: 'pending',  label: 'Pending' },
  { view: 'flagged',  label: 'Flagged' },
  { view: 'verified', label: 'Verified' },
]

export function DemoPaymentQueuePage({ mode }: { mode: 'overdue' | 'verification' }) {
  const router = useRouter()
  const now    = useDemoNow()
  const table  = useDataTable({ defaultPageSize: 25 })
  const [view, setView] = useState<VerificationView>('pending')

  const isOverdue = mode === 'overdue'
  const onView    = (r: { id: string }) => router.push(ROUTES.payment.detail(r.id))

  const overdueRows = useMemo(() => (now && isOverdue ? getDemoOverdueQueue(now) : []), [now, isOverdue])
  const verifRows   = useMemo(() => (now && !isOverdue ? getDemoVerificationQueue(view, now) : []), [now, isOverdue, view])
  const counts      = useMemo(() => (now ? Object.fromEntries(TABS.map((t) => [t.view, getDemoVerificationQueue(t.view, now).length])) as Record<VerificationView, number> : null), [now])

  const searchFields = ['docNumber', 'invoiceNumber', 'insuredName', 'voucherNumber'] as const
  const overduePage  = useMemo(() => demoList(overdueRows, table.queryParams, { searchFields: [...searchFields] }), [overdueRows, table.queryParams]) // eslint-disable-line react-hooks/exhaustive-deps
  const verifPage    = useMemo(() => demoList(verifRows, table.queryParams, { searchFields: [...searchFields] }), [verifRows, table.queryParams])   // eslint-disable-line react-hooks/exhaustive-deps

  const header = isOverdue ? (
    <PageHeader title="Overdue Payments" description="Incoming payments past their due date, oldest first"
      breadcrumbs={[{ label: 'Finance' }, { label: 'Overdue' }]} />
  ) : (
    <PageHeader title="Finance Verification" description="Payments received from clients and their verification state"
      breadcrumbs={[{ label: 'Finance' }, { label: 'Verification' }]} />
  )
  if (!now || !counts) return <div className="page-container">{header}<LoadingSkeleton /></div>

  const total = (isOverdue ? overduePage : verifPage).pagination.total

  return (
    <div className="page-container">
      {header}

      <div className="data-table-wrapper">
        {!isOverdue && (
          <div className="flex items-center gap-1.5 px-4 pt-3" role="tablist" aria-label="Verification state">
            {TABS.map((t) => (
              <button
                key={t.view} type="button" role="tab" aria-selected={view === t.view}
                onClick={() => { setView(t.view); table.onClearFilters() }}
                className={cn(
                  'px-3 py-1.5 rounded text-[12px] font-medium border transition-colors',
                  view === t.view ? 'bg-[#e8f3fb] text-[#123d6b] border-[#93c4e5]' : 'bg-white text-[#3a5068] border-[#e2e9f0] hover:bg-[#f7f9fb]'
                )}
              >
                {t.label} <span className="tabular-nums text-[#7a8fa3]">({counts[t.view]})</span>
              </button>
            ))}
          </div>
        )}

        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search payment no., invoice ref., insured…"
          filters={[]}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />

        {isOverdue ? (
          <DataTable<DemoOverdueRow>
            columns={overdueColumns(onView)} data={overduePage.data} rowKey={(r) => r.id}
            sort={table.sort} onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)} onPageChange={table.onPageChange} onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={onView}
            emptyMessage="No overdue payments" emptyDescription="Every incoming payment is within its due date"
          />
        ) : (
          <DataTable<PaymentListItem>
            columns={verificationColumns(onView)} data={verifPage.data} rowKey={(r) => r.id}
            sort={table.sort} onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)} onPageChange={table.onPageChange} onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={onView}
            emptyMessage="No payments in this state" emptyDescription="Try another verification tab"
          />
        )}
      </div>
    </div>
  )
}