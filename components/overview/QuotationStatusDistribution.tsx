// FILE: components/overview/QuotationStatusDistribution.tsx
import { QUOTATION_STATUS_LABELS } from '@/lib/quotationStatus'
import { QUOTATION_STATUS_ORDER, type QuotationOverview } from '@/lib/adapters/quotationOverview'
import { Skeleton } from '@/components/feedback/LoadingSkeleton'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import { formatNumber } from '@/lib/format'
import type { QuotationStatus } from '@/types/quotation'

const STATUS_COLOR: Record<QuotationStatus, string> = {
  DRAFT:              '#7a8fa3',
  WAITING_APPROVAL:   '#e0a020',
  APPROVED:           '#1a5c38',
  SENT_TO_INSURANCE:  '#2d6495',
  REVISION:           '#8c1f1f',
  INSURANCE_APPROVED: '#3d9a68',
  POLICY_ISSUED:      '#123d6b',
}

interface QuotationStatusDistributionProps {
  overview: QuotationOverview | null
  loading?: boolean
}

export function QuotationStatusDistribution({ overview, loading }: QuotationStatusDistributionProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-[14px] font-semibold text-[#18273a]">Status Distribution</h3>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">Quotations by workflow status</p>
        </div>
        <DataSourceBadge source="live" />
      </div>

      <div className="px-5 py-4">
        {loading || !overview ? (
          <div className="flex flex-col gap-3">
            {QUOTATION_STATUS_ORDER.map((s) => <Skeleton key={s} className="h-4 w-full" />)}
          </div>
        ) : overview.total === 0 ? (
          <p className="text-[12px] text-[#7a8fa3]">No quotations yet.</p>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              {QUOTATION_STATUS_ORDER.map((status) => {
                const count = overview.byStatus[status]
                const pct   = Math.round((count / overview.total) * 100)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[#3a5068]">{QUOTATION_STATUS_LABELS[status]}</span>
                      <span className="text-[12px] font-medium text-[#18273a] tabular-nums">
                        {formatNumber(count)} <span className="text-[#9aa3ad] font-normal">· {pct}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#edf1f5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: STATUS_COLOR[status] }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {overview.byInsuranceType.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#f0f4f7]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-2">
                  By insurance type
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {overview.byInsuranceType.map((t) => (
                    <span
                      key={t.name}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#f0f4f7] text-[11px] text-[#3a5068]"
                    >
                      {t.name}
                      <span className="font-semibold text-[#18273a] tabular-nums">{t.count}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
