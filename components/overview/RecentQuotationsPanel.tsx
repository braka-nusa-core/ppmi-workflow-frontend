// FILE: components/overview/RecentQuotationsPanel.tsx
import Link from 'next/link'
import { ROUTES } from '@/config/routes'
import { formatRelativeTime } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/feedback/LoadingSkeleton'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import { QUOTATION_STATUS_BADGE_VARIANT, getQuotationStatusLabel } from '@/lib/quotationStatus'
import type { QuotationOverview } from '@/lib/adapters/quotationOverview'

interface RecentQuotationsPanelProps {
  overview: QuotationOverview | null
  loading?: boolean
}

export function RecentQuotationsPanel({ overview, loading }: RecentQuotationsPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#18273a]">Recent Quotations</h3>
            <DataSourceBadge source="live" />
          </div>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">Most recently updated</p>
        </div>
        <Link
          href={ROUTES.quotations.list}
          className="text-[11px] font-medium text-[#123d6b] hover:text-[#0d2d50] hover:underline transition-colors duration-100"
        >
          View all
        </Link>
      </div>

      <div className="divide-y divide-[#f7f9fb]">
        {loading || !overview ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3.5"><Skeleton className="h-8 w-full" /></div>
          ))
        ) : overview.recent.length === 0 ? (
          <p className="px-5 py-6 text-[12px] text-[#7a8fa3]">No quotations yet.</p>
        ) : (
          overview.recent.map((q) => (
            <Link
              key={q.id}
              href={ROUTES.quotations.detail(q.id)}
              className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f9fb] transition-colors duration-100"
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[12px] font-medium text-[#1e4a70]">{q.quotationNumber}</p>
                <p className="text-[11px] text-[#3a5068] truncate">
                  {q.client?.name ?? '—'}
                  <span className="text-[#9aa3ad]"> · {q.insuranceType?.name ?? '—'}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge variant={QUOTATION_STATUS_BADGE_VARIANT[q.status]} dot>
                  {getQuotationStatusLabel(q.status)}
                </Badge>
                <span className="text-[10px] text-[#7a8fa3]">{formatRelativeTime(q.updatedAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
