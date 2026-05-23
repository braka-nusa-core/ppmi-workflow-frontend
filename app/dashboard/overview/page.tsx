import type { Metadata } from 'next'
import { MOCK_OVERVIEW_DATA } from '@/lib/mock/overviewData'
import { SummaryCards }           from '@/components/overview/SummaryCards'
import { WorkflowPipelineStatus } from '@/components/overview/WorkflowPipelineStatus'
import { ActivityFeed }           from '@/components/overview/ActivityFeed'
import { FinanceMonitorPanel }    from '@/components/overview/FinanceMonitorPanel'
import { DivisionOverview }       from '@/components/overview/DivisionOverview'
import { OverviewPageHeader }     from '@/components/overview/OverviewPageHeader'

export const metadata: Metadata = { title: 'Overview | PPMI Flow' }

// In production: replace with React Query fetch from API
// const data = await fetchOverview()
const data = MOCK_OVERVIEW_DATA

export default function OverviewPage() {
  return (
    <div className="page-container">

      {/* ── Page Header ───────────────────────────────────────── */}
      <OverviewPageHeader division="P&I · H&M" />

      {/* ── Row 1: Summary KPI Cards ─────────────────────────── */}
      <section className="mb-5">
        <SummaryCards data={data.summary} />
      </section>

      {/* ── Row 2: Main content — 3 col grid ─────────────────── */}
      {/*
        Layout:
          [Pipeline Status — 1.0fr] [Activity Feed — 1.2fr] [Finance Panel — 0.9fr]
      */}
      <div
        className="grid gap-4 mb-5"
        style={{ gridTemplateColumns: '1fr 1.2fr 0.9fr' }}
      >
        {/* Pipeline */}
        <div className="min-w-0">
          <WorkflowPipelineStatus data={data.workflowPipeline} />
        </div>

        {/* Activity */}
        <div className="min-w-0">
          <ActivityFeed items={data.recentActivity} />
        </div>

        {/* Finance */}
        <div className="min-w-0">
          <FinanceMonitorPanel
            summary={data.finance}
            overdueItems={data.overdueItems}
            upcomingItems={data.upcomingPayments}
          />
        </div>
      </div>

      {/* ── Row 3: Division Overview ──────────────────────────── */}
      <section>
        <DivisionOverview data={data.divisionSummary} />
      </section>

    </div>
  )
}
