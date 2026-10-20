// FILE: components/overview/WorkflowFlowStrip.tsx
import { Fragment, type ElementType } from 'react'
import Link from 'next/link'
import {
  Inbox,
  FileText,
  UserCheck,
  Building2,
  FileCheck,
  Shield,
  Wallet,
  ClipboardList,
  DollarSign,
  ChevronRight,
} from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { formatNumber } from '@/lib/format'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import type { QuotationOverview } from '@/lib/adapters/quotationOverview'
import type { DemoOverview } from '@/lib/demo/overviewDemoData'

interface FlowNode {
  key:     string
  label:   string
  icon:    ElementType
  color:   string
  source:  'live' | 'demo' | null
  value:   string | null   // null → no figure for this node
  unit:    string
  caption: string
  href:    string | null
}

interface WorkflowFlowStripProps {
  /** null while loading, on error, or without quotation:read — live nodes render "—". */
  quotation: QuotationOverview | null
  demo:      DemoOverview
}

function buildNodes(quotation: QuotationOverview | null, demo: DemoOverview): FlowNode[] {
  const q = quotation
  const n = (v: number | undefined) => (v === undefined ? '—' : formatNumber(v))
  const mod = (key: string) => demo.modules.find((m) => m.key === key)

  const placement = mod('PLACEMENT')
  const voucher   = mod('VOUCHER')
  const rfi       = mod('RFI')

  return [
    {
      key: 'client', label: 'Client Request', icon: Inbox, color: '#7a8fa3',
      source: null, value: null, unit: '', caption: 'Request received from client', href: null,
    },
    {
      key: 'qs', label: 'Quotation Sheet', icon: FileText, color: '#123d6b', source: 'live',
      value: q ? n(q.byStatus.DRAFT + q.byStatus.REVISION) : '—', unit: 'in preparation',
      caption: q ? `${q.byStatus.DRAFT} draft · ${q.byStatus.REVISION} revision` : 'Unavailable',
      href: ROUTES.quotations.list,
    },
    {
      key: 'supervisor', label: 'Supervisor Teknik', icon: UserCheck, color: '#7a5000', source: 'live',
      value: n(q?.byStatus.WAITING_APPROVAL), unit: 'awaiting approval',
      caption: q ? `${q.byStatus.APPROVED} approved` : 'Unavailable',
      href: ROUTES.quotations.list,
    },
    {
      key: 'insurance', label: 'Insurance Review', icon: Building2, color: '#2d6495', source: 'live',
      value: n(q?.byStatus.SENT_TO_INSURANCE), unit: 'with insurer',
      caption: q ? `${q.byStatus.INSURANCE_APPROVED} insurance approved` : 'Unavailable',
      href: ROUTES.quotations.list,
    },
    {
      key: 'policy', label: 'Policy Issued', icon: FileCheck, color: '#123d6b', source: 'live',
      value: n(q?.byStatus.POLICY_ISSUED), unit: 'issued',
      caption: 'Quotation workflow complete', href: ROUTES.quotations.list,
    },
    {
      key: 'placement', label: 'Placement', icon: Shield, color: '#2d6495', source: 'demo',
      value: n(placement?.inProgress), unit: 'in progress',
      caption: `${n(placement?.completed)} completed`, href: ROUTES.policy.list,
    },
    {
      key: 'voucher', label: 'Voucher', icon: Wallet, color: '#3d7baf', source: 'demo',
      value: n(voucher?.inProgress), unit: 'in progress',
      caption: `${n(voucher?.completed)} completed`, href: ROUTES.voucher.list,
    },
    {
      key: 'rfi', label: 'RFI', icon: ClipboardList, color: '#4a8fc2', source: 'demo',
      value: n(rfi?.inProgress), unit: 'in progress',
      caption: `${n(rfi?.completed)} completed`, href: ROUTES.rfi.list,
    },
    {
      key: 'finance', label: 'Finance', icon: DollarSign, color: '#1a5c38', source: 'demo',
      value: n(demo.finance.unpaidInvoices), unit: 'unpaid invoices',
      caption: `${demo.finance.overduePayments} overdue`, href: ROUTES.finance.monitor,
    },
  ]
}

function NodeBody({ node }: { node: FlowNode }) {
  const Icon = node.icon
  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{ background: node.color + '14', border: `1px solid ${node.color}28` }}
        >
          <Icon size={13} style={{ color: node.color }} strokeWidth={1.8} />
        </div>
        {node.source && <DataSourceBadge source={node.source} />}
      </div>
      <p className="text-[12px] font-semibold text-[#18273a] leading-tight">{node.label}</p>
      {node.value !== null ? (
        <p className="mt-1.5 leading-none">
          <span className="text-[20px] font-semibold text-[#18273a] tabular-nums">{node.value}</span>
          <span className="text-[10px] text-[#7a8fa3] ml-1">{node.unit}</span>
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] text-[#9aa3ad] leading-snug">Entry point</p>
      )}
      <p className="text-[10px] text-[#7a8fa3] mt-1 leading-snug">{node.caption}</p>
    </>
  )
}

export function WorkflowFlowStrip({ quotation, demo }: WorkflowFlowStripProps) {
  const nodes = buildNodes(quotation, demo)
  const boxClass = 'block w-[148px] flex-shrink-0 rounded-md border border-[#e2e9f0] bg-white p-3'

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-[14px] font-semibold text-[#18273a]">Workflow Overview</h3>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">
            Client Request → Quotation Sheet → Supervisor Teknik → Insurance Review → Policy → Placement → Voucher → RFI → Finance
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <DataSourceBadge source="live" />
          <DataSourceBadge source="demo" />
        </div>
      </div>

      {/* [contain:inline-size] stops the 9-node strip's intrinsic width (min-w-max)
          from widening the dashboard grid column; it scrolls inside this card. */}
      <div className="px-5 py-4 overflow-x-auto [contain:inline-size]">
        <div className="flex items-stretch gap-1.5 min-w-max">
          {nodes.map((node, i) => (
            <Fragment key={node.key}>
              {node.href ? (
                <Link href={node.href} className={`${boxClass} hover:border-[#b5cede] transition-colors duration-100`}>
                  <NodeBody node={node} />
                </Link>
              ) : (
                <div className={boxClass}>
                  <NodeBody node={node} />
                </div>
              )}
              {i < nodes.length - 1 && (
                <ChevronRight size={14} className="self-center flex-shrink-0 text-[#b5cede]" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}