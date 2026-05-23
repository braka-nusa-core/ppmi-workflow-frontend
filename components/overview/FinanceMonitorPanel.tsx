import {
  AlertTriangle,
  Clock,
  CreditCard,
  TrendingDown,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import type { FinanceSummary, OverdueItem, UpcomingPaymentItem } from '@/types/overview'
import { DivisionBadge } from '@/components/ui/Badge'
import Link from 'next/link'

// ─── Finance Summary Row ─────────────────────────────────────────
interface FinanceMetricRowProps {
  icon:      React.ElementType
  iconBg:    string
  iconColor: string
  label:     string
  count:     number
  countUnit: string
  total:     string
  href:      string
  urgent?:   boolean
}

function FinanceMetricRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  count,
  countUnit,
  total,
  href,
  urgent,
}: FinanceMetricRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-5 py-3.5',
        'hover:bg-[#f7f9fb] transition-colors duration-100',
        'border-b border-[#f0f4f7] last:border-0',
        urgent && 'bg-[#fffaf9]'
      )}
    >
      <div className={cn(
        'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
        iconBg
      )}>
        <Icon size={13} className={iconColor} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#18273a] leading-tight">{label}</p>
        <p className="text-[11px] text-[#7a8fa3] mt-0.5">
          {count} {countUnit}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn(
          'text-[12px] font-semibold tabular-nums',
          urgent ? 'text-[#8c1f1f]' : 'text-[#18273a]'
        )}>
          {total}
        </span>
        <ArrowRight size={12} className="text-[#b5cede]" />
      </div>
    </Link>
  )
}

// ─── Overdue Table ───────────────────────────────────────────────
interface OverdueListProps {
  items: OverdueItem[]
}

function OverdueList({ items }: OverdueListProps) {
  if (items.length === 0) {
    return (
      <p className="text-[12px] text-[#7a8fa3] py-4 text-center">
        No overdue payments
      </p>
    )
  }

  return (
    <div className="divide-y divide-[#f0f4f7]">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 px-5 py-3 hover:bg-[#fffaf9] transition-colors duration-100"
        >
          {/* Overdue days indicator */}
          <div className="flex-shrink-0 text-center" style={{ width: 36 }}>
            <p className="text-[14px] font-bold text-[#8c1f1f] leading-none">
              {item.daysOverdue}
            </p>
            <p className="text-[9px] text-[#8c1f1f] font-medium">days</p>
          </div>

          {/* Doc info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-semibold text-[#18273a]">
                {item.docNumber}
              </span>
              <DivisionBadge division={item.division} />
            </div>
            <p className="text-[11px] text-[#3a5068] truncate">
              {item.clientName}
            </p>
          </div>

          {/* Amount */}
          <div className="flex-shrink-0 text-right">
            <p className="text-[12px] font-semibold text-[#8c1f1f] tabular-nums">
              {formatCurrency(item.amount, item.currency, { compact: true })}
            </p>
            <p className="text-[10px] text-[#7a8fa3]">
              Due {formatDate(item.dueDate)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Upcoming Payment List ───────────────────────────────────────
interface UpcomingListProps {
  items: UpcomingPaymentItem[]
}

function UpcomingList({ items }: UpcomingListProps) {
  return (
    <div className="divide-y divide-[#f0f4f7]">
      {items.map((item) => {
        const urgent = item.daysLeft <= 3

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 px-5 py-3',
              'hover:bg-[#f7f9fb] transition-colors duration-100',
              urgent && 'bg-[#fffdf5]'
            )}
          >
            {/* Days left indicator */}
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0',
                urgent ? 'bg-[#fdf7ed]' : 'bg-[#f0f4f7]'
              )}
            >
              <span className={cn(
                'text-[12px] font-bold leading-none',
                urgent ? 'text-[#7a5000]' : 'text-[#3a5068]'
              )}>
                {item.daysLeft}d
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-semibold text-[#18273a]">
                  {item.docNumber}
                </span>
                <DivisionBadge division={item.division} />
              </div>
              <p className="text-[11px] text-[#3a5068] truncate">
                {item.clientName}
              </p>
            </div>

            {/* Amount + date */}
            <div className="flex-shrink-0 text-right">
              <p className={cn(
                'text-[12px] font-semibold tabular-nums',
                urgent ? 'text-[#7a5000]' : 'text-[#18273a]'
              )}>
                {formatCurrency(item.amount, item.currency, { compact: true })}
              </p>
              <p className="text-[10px] text-[#7a8fa3]">
                {formatDate(item.dueDate)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Main Panel ──────────────────────────────────────────────────
interface FinanceMonitorPanelProps {
  summary:         FinanceSummary
  overdueItems:    OverdueItem[]
  upcomingItems:   UpcomingPaymentItem[]
}

export function FinanceMonitorPanel({
  summary,
  overdueItems,
  upcomingItems,
}: FinanceMonitorPanelProps) {
  return (
    <div className="flex flex-col gap-4">

      {/* ── Finance Summary Card ────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="text-[14px] font-semibold text-[#18273a]">
              Finance Monitor
            </h3>
            <p className="text-[11px] text-[#7a8fa3] mt-0.5">
              Payment status overview
            </p>
          </div>
          <Link
            href="/dashboard/finance"
            className="text-[11px] font-medium text-[#123d6b] hover:text-[#0d2d50] hover:underline transition-colors"
          >
            Finance dashboard
          </Link>
        </div>

        {/* Summary metrics */}
        <div>
          <FinanceMetricRow
            icon={TrendingDown}
            iconBg="bg-[#fdecea]"
            iconColor="text-[#8c1f1f]"
            label="Overdue Payments"
            count={summary.overduePayments}
            countUnit="payments overdue"
            total={formatCurrency(summary.overdueTotal, 'IDR', { compact: true })}
            href="/dashboard/finance/overdue"
            urgent
          />
          <FinanceMetricRow
            icon={CreditCard}
            iconBg="bg-[#fdf7ed]"
            iconColor="text-[#7a5000]"
            label="Unpaid Invoices"
            count={summary.unpaidInvoices}
            countUnit="awaiting payment"
            total={formatCurrency(summary.unpaidTotal, 'IDR', { compact: true })}
            href="/dashboard/finance"
          />
          <FinanceMetricRow
            icon={Calendar}
            iconBg="bg-[#e8f3fb]"
            iconColor="text-[#123d6b]"
            label="Due Within 7 Days"
            count={summary.upcomingDue7d}
            countUnit="payments due soon"
            total={formatCurrency(summary.upcomingDue7dTotal, 'IDR', { compact: true })}
            href="/dashboard/finance"
          />
          <FinanceMetricRow
            icon={Clock}
            iconBg="bg-[#edf5fb]"
            iconColor="text-[#2d6495]"
            label="Active Installments"
            count={summary.activeInstallments}
            countUnit={`plans · ${summary.installmentsPending} installments pending`}
            total=""
            href="/dashboard/finance"
          />
        </div>
      </div>

      {/* ── Overdue Payments ────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-[#8c1f1f]" />
            <h3 className="text-[14px] font-semibold text-[#18273a]">
              Overdue Payments
            </h3>
            {overdueItems.length > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#8c1f1f] text-white text-[10px] font-bold">
                {overdueItems.length}
              </span>
            )}
          </div>
          <Link
            href="/dashboard/finance/overdue"
            className="text-[11px] font-medium text-[#8c1f1f] hover:underline transition-colors"
          >
            Manage
          </Link>
        </div>
        <OverdueList items={overdueItems} />
      </div>

      {/* ── Upcoming Payments ────────────────────────────────── */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="text-[14px] font-semibold text-[#18273a]">
              Upcoming Due
            </h3>
            <p className="text-[11px] text-[#7a8fa3] mt-0.5">
              Next 7 days
            </p>
          </div>
        </div>
        <UpcomingList items={upcomingItems} />
      </div>

    </div>
  )
}
