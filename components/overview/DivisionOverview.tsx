import {
  Activity,
  Receipt,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/format'
import type { DivisionSummary } from '@/types/overview'
import type { Division } from '@/types/workflow'
import Link from 'next/link'

// ─── Single metric row inside division card ──────────────────────
interface DivMetricProps {
  icon:     React.ElementType
  label:    string
  value:    number | string
  emphasis?: 'normal' | 'warning' | 'danger' | 'positive'
}

function DivMetric({ icon: Icon, label, value, emphasis = 'normal' }: DivMetricProps) {
  const valueColor = {
    normal:   'text-[#18273a]',
    warning:  'text-[#7a5000]',
    danger:   'text-[#8c1f1f]',
    positive: 'text-[#1a5c38]',
  }[emphasis]

  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.8} />
        <span className="text-[12px] text-[#3a5068]">{label}</span>
      </div>
      <span className={cn('text-[13px] font-semibold', valueColor)}>
        {value}
      </span>
    </div>
  )
}

// ─── Single division card ────────────────────────────────────────
interface DivisionCardProps {
  data: DivisionSummary
}

const DIVISION_CONFIG: Record<Division, {
  label:     string
  fullLabel: string
  accent:    string
  lightBg:   string
  border:    string
  href:      string
}> = {
  PI: {
    label:     'P&I',
    fullLabel: 'Protection & Indemnity',
    accent:    '#123d6b',
    lightBg:   '#e8f3fb',
    border:    '#93c4e5',
    href:      '/dashboard/pi/qs',
  },
  HM: {
    label:     'H&M',
    fullLabel: 'Hull & Machinery',
    accent:    '#1a5c38',
    lightBg:   '#eaf6f0',
    border:    '#96d6b4',
    href:      '/dashboard/hm/qs',
  },
}

function DivisionCard({ data }: DivisionCardProps) {
  const cfg = DIVISION_CONFIG[data.division]

  return (
    <div className="card flex flex-col">
      {/* Division header */}
      <div
        className="px-5 py-4 flex items-start justify-between"
        style={{ borderBottom: '2px solid', borderColor: cfg.accent + '30' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide"
              style={{
                background:  cfg.lightBg,
                color:       cfg.accent,
                border:      `1px solid ${cfg.border}`,
              }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-[12px] text-[#7a8fa3]">{cfg.fullLabel}</p>
        </div>
        <Link
          href={cfg.href}
          className="flex items-center gap-1 text-[11px] font-medium transition-colors duration-100"
          style={{ color: cfg.accent }}
        >
          Open
          <ArrowRight size={11} />
        </Link>
      </div>

      {/* Total value banner */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ background: cfg.lightBg + '80', borderBottom: `1px solid ${cfg.border}50` }}
      >
        <span className="text-[11px] font-medium text-[#7a8fa3]">Total Portfolio Value</span>
        <span
          className="text-[14px] font-semibold tabular-nums"
          style={{ color: cfg.accent }}
        >
          {formatCurrency(data.totalValueIDR, 'IDR', { compact: true })}
        </span>
      </div>

      {/* Metrics */}
      <div className="px-5 divide-y divide-[#f0f4f7] flex-1">
        <DivMetric
          icon={Activity}
          label="Active Workflows"
          value={formatNumber(data.activeWorkflows)}
        />
        <DivMetric
          icon={Receipt}
          label="Pending Invoices"
          value={formatNumber(data.pendingInvoices)}
          emphasis={data.pendingInvoices > 20 ? 'warning' : 'normal'}
        />
        <DivMetric
          icon={CheckCircle}
          label="Completed Payments"
          value={formatNumber(data.completedPayments)}
          emphasis="positive"
        />
        <DivMetric
          icon={AlertTriangle}
          label="Overdue Items"
          value={data.overdueItems > 0 ? formatNumber(data.overdueItems) : '—'}
          emphasis={data.overdueItems > 0 ? 'danger' : 'normal'}
        />
      </div>
    </div>
  )
}

// ─── Main Division Overview ──────────────────────────────────────
interface DivisionOverviewProps {
  data: DivisionSummary[]
}

export function DivisionOverview({ data }: DivisionOverviewProps) {
  const pi = data.find((d) => d.division === 'PI')
  const hm = data.find((d) => d.division === 'HM')

  if (!pi || !hm) return null

  // Combined total
  const totalWorkflows = pi.activeWorkflows + hm.activeWorkflows
  const totalPending   = pi.pendingInvoices + hm.pendingInvoices
  const totalOverdue   = pi.overdueItems    + hm.overdueItems
  const totalValueIDR  = pi.totalValueIDR   + hm.totalValueIDR

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div>
          <h3 className="text-[14px] font-semibold text-[#18273a]">
            Division Overview
          </h3>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">
            P&amp;I vs H&amp;M operational comparison
          </p>
        </div>
        {/* Combined total badge */}
        <div className="flex items-center gap-3 text-right">
          <div>
            <p className="text-[10px] text-[#7a8fa3]">Total Portfolio</p>
            <p className="text-[13px] font-semibold text-[#18273a] tabular-nums">
              {formatCurrency(totalValueIDR, 'IDR', { compact: true })}
            </p>
          </div>
        </div>
      </div>

      {/* Division cards */}
      <div className="grid grid-cols-2 gap-0 divide-x divide-[#f0f4f7]">
        <DivisionCard data={pi} />
        <DivisionCard data={hm} />
      </div>

      {/* Combined footer */}
      <div
        className="px-5 py-3 flex items-center gap-6"
        style={{ borderTop: '1px solid #f0f4f7', background: '#f7f9fb' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#7a8fa3]">Total Active:</span>
          <span className="text-[12px] font-semibold text-[#18273a]">
            {formatNumber(totalWorkflows)} workflows
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#7a8fa3]">Pending:</span>
          <span className="text-[12px] font-semibold text-[#18273a]">
            {formatNumber(totalPending)} invoices
          </span>
        </div>
        {totalOverdue > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#7a8fa3]">Overdue:</span>
            <span className="text-[12px] font-semibold text-[#8c1f1f]">
              {formatNumber(totalOverdue)} items
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
