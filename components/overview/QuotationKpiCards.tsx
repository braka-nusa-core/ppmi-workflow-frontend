// FILE: components/overview/QuotationKpiCards.tsx
import Link from 'next/link'
import {
  FileText,
  Pencil,
  Clock,
  CheckCircle,
  Send,
  RotateCcw,
  ShieldCheck,
  FileCheck,
} from 'lucide-react'
import type { ElementType } from 'react'
import { ROUTES } from '@/config/routes'
import { formatNumber } from '@/lib/format'
import { Skeleton } from '@/components/feedback/LoadingSkeleton'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import type { QuotationOverview } from '@/lib/adapters/quotationOverview'

interface KpiConfig {
  label:    string
  subtext:  string
  icon:     ElementType
  iconBg:   string
  iconText: string
  valueTxt: string
  pick:     (o: QuotationOverview) => number
}

const KPIS: KpiConfig[] = [
  { label: 'Total Quotations',        subtext: 'All quotation sheets',          icon: FileText,    iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#123d6b]', valueTxt: 'text-[#18273a]', pick: (o) => o.total },
  { label: 'Draft',                   subtext: 'Being prepared by Teknik',      icon: Pencil,      iconBg: 'bg-[#f0f4f7]', iconText: 'text-[#3a5068]', valueTxt: 'text-[#18273a]', pick: (o) => o.byStatus.DRAFT },
  { label: 'Waiting Supervisor Teknik', subtext: 'Awaiting approval',           icon: Clock,       iconBg: 'bg-[#fdf7ed]', iconText: 'text-[#7a5000]', valueTxt: 'text-[#18273a]', pick: (o) => o.byStatus.WAITING_APPROVAL },
  { label: 'Approved',                subtext: 'Ready to send to insurance',    icon: CheckCircle, iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]', valueTxt: 'text-[#18273a]', pick: (o) => o.byStatus.APPROVED },
  { label: 'Sent to Insurance',       subtext: 'Under insurer review',          icon: Send,        iconBg: 'bg-[#edf5fb]', iconText: 'text-[#2d6495]', valueTxt: 'text-[#18273a]', pick: (o) => o.byStatus.SENT_TO_INSURANCE },
  { label: 'Revision Required',       subtext: 'Needs changes',                 icon: RotateCcw,   iconBg: 'bg-[#fdecea]', iconText: 'text-[#8c1f1f]', valueTxt: 'text-[#8c1f1f]', pick: (o) => o.byStatus.REVISION },
  { label: 'Insurance Approved',      subtext: 'Approved by insurer',           icon: ShieldCheck, iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]', valueTxt: 'text-[#18273a]', pick: (o) => o.byStatus.INSURANCE_APPROVED },
  { label: 'Policy Issued',           subtext: 'Completed quotation workflow',  icon: FileCheck,   iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#123d6b]', valueTxt: 'text-[#18273a]', pick: (o) => o.byStatus.POLICY_ISSUED },
]

interface QuotationKpiCardsProps {
  overview: QuotationOverview | null
  loading?: boolean
}

export function QuotationKpiCards({ overview, loading }: QuotationKpiCardsProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-wider text-[#7a8fa3]">
          Quotation Sheet
        </h2>
        <DataSourceBadge source="live" />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon

          return (
            <Link
              key={kpi.label}
              href={ROUTES.quotations.list}
              className="card card-body flex items-start gap-3 hover:border-[#b5cede] transition-colors duration-100"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-md flex-shrink-0 ${kpi.iconBg}`}>
                <Icon size={15} className={kpi.iconText} strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-[#7a8fa3] leading-tight truncate">
                  {kpi.label}
                </p>
                {loading || !overview ? (
                  <Skeleton className="h-6 w-12 mt-1.5" />
                ) : (
                  <p className={`text-[24px] font-semibold leading-none mt-1 tabular-nums ${kpi.valueTxt}`}>
                    {formatNumber(kpi.pick(overview))}
                  </p>
                )}
                <p className="text-[11px] text-[#9aa3ad] mt-1 truncate">{kpi.subtext}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}