// FILE: app/dashboard/overview/DemoOverviewDashboard.tsx
'use client'

import { useMemo } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useQuotations } from '@/hooks/useQuotations'
import { buildQuotationOverview } from '@/lib/adapters/quotationOverview'
import { getDemoOverview } from '@/lib/demo/overviewDemoData'
import { OverviewPageHeader } from '@/components/overview/OverviewPageHeader'
import { QuotationKpiCards } from '@/components/overview/QuotationKpiCards'
import { WorkflowFlowStrip } from '@/components/overview/WorkflowFlowStrip'
import { QuotationStatusDistribution } from '@/components/overview/QuotationStatusDistribution'
import { RecentQuotationsPanel } from '@/components/overview/RecentQuotationsPanel'
import { DemoActivityPanel } from '@/components/overview/DemoActivityPanel'
import { DemoOperationsSummary } from '@/components/overview/DemoOperationsSummary'
import { FinanceMonitorPanel } from '@/components/overview/FinanceMonitorPanel'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import type { ApiError } from '@/types/api'

// ═══════════════════════════════════════════════════════════════
// DEMO OVERVIEW (rendered only when NEXT_PUBLIC_DEMO_MODE === 'true')
//
// REAL  : quotation figures — GET /quotations via the existing
//         useQuotations() hook. Real errors are shown, never masked.
// DEMO  : everything after "Policy Issued" (Placement, Voucher, RFI,
//         Finance) — lib/demo/overviewDemoData.ts. Read-only; this
//         screen has no actions that call the backend.
//
// /overview/stats and /overview/workspace are intentionally NOT called.
// ═══════════════════════════════════════════════════════════════

export function DemoOverviewDashboard() {
  const { can, isLoading: authLoading } = useAuth()
  const quotationsQuery = useQuotations()

  // Demo timestamps are relative to "now"; build only after auth resolves
  // (client-side) so server and first client render never disagree.
  const demo = useMemo(() => (authLoading ? null : getDemoOverview()), [authLoading])

  const canReadQuotations = can('quotation', 'read')

  const quotation = useMemo(
    () => (quotationsQuery.data ? buildQuotationOverview(quotationsQuery.data) : null),
    [quotationsQuery.data]
  )

  if (authLoading || !demo) {
    return <LoadingSkeleton />
  }

  const isRealLoading = canReadQuotations && quotationsQuery.isLoading
  const isRealError   = canReadQuotations && quotationsQuery.isError
  const apiError      = quotationsQuery.error as ApiError | null
  const liveOverview  = canReadQuotations && !isRealError ? quotation : null

  const lastUpdated = quotationsQuery.dataUpdatedAt > 0
    ? new Date(quotationsQuery.dataUpdatedAt)
    : undefined

  return (
    <div className="page-container">
      <OverviewPageHeader
        division="P&I · H&M · Cargo"
        lastUpdated={lastUpdated}
        onRefresh={() => { void quotationsQuery.refetch() }}
      />

      {/* Demo-mode notice */}
      <div className="flex items-start gap-2 mb-5 px-4 py-3 rounded-md border border-[#e8c896] bg-[#fdf7ed]">
        <DataSourceBadge source="demo" className="mt-0.5" />
        <p className="text-[12px] text-[#5c4000] leading-snug">
          <span className="font-semibold">Demonstration mode.</span>{' '}
          Quotation figures (<DataSourceBadge source="live" className="align-middle" />) are loaded from the live system.
          Policy Placement, Voucher, RFI and Finance figures (<DataSourceBadge source="demo" className="align-middle" />) are
          illustrative and read-only.
        </p>
      </div>

      {/* Row 1 — real quotation KPIs (or real error / no-access state) */}
      <section className="mb-5">
        {!canReadQuotations ? (
          <div className="card flex items-center justify-center min-h-[140px]">
            <ErrorState
              message="You don't have access to view quotations"
              description="Contact your administrator if you believe this is incorrect."
            />
          </div>
        ) : isRealError ? (
          <div className="card flex items-center justify-center min-h-[140px]">
            <ErrorState
              message={apiError?.message ?? 'Failed to load quotations'}
              description="Quotation figures could not be loaded from the server. Please try again."
              onRetry={() => { void quotationsQuery.refetch() }}
            />
          </div>
        ) : (
          <QuotationKpiCards overview={liveOverview} loading={isRealLoading} />
        )}
      </section>

      {/* Row 2 — end-to-end workflow */}
      <section className="mb-5">
        <WorkflowFlowStrip quotation={liveOverview} demo={demo} />
      </section>

      {/* Row 3 — real quotation breakdown */}
      {canReadQuotations && !isRealError && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
          <div className="min-w-0">
            <QuotationStatusDistribution overview={liveOverview} loading={isRealLoading} />
          </div>
          <div className="min-w-0">
            <RecentQuotationsPanel overview={liveOverview} loading={isRealLoading} />
          </div>
        </div>
      )}

      {/* Row 4 — demo downstream modules */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr_0.9fr] gap-4">
        <div className="min-w-0">
          <DemoActivityPanel items={demo.activity} />
        </div>
        <div className="min-w-0">
          <DemoOperationsSummary modules={demo.modules} />
        </div>
        <div className="min-w-0">
          <FinanceMonitorPanel
            summary={demo.finance}
            overdueItems={demo.overdueItems}
            upcomingItems={demo.upcomingPayments}
          />
        </div>
      </div>
    </div>
  )
}
