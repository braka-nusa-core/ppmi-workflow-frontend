'use client'

import { useEffect, useState } from 'react'
import { fetchOverviewStats }      from '@/lib/api/overview'
import { fetchOverviewWorkspace }  from '@/lib/api/overview'
import { buildOverviewData }       from '@/lib/adapters/overview'
import { SummaryCards }            from '@/components/overview/SummaryCards'
import { WorkflowPipelineStatus }  from '@/components/overview/WorkflowPipelineStatus'
import { ActivityFeed }            from '@/components/overview/ActivityFeed'
import { FinanceMonitorPanel }     from '@/components/overview/FinanceMonitorPanel'
import { DivisionOverview }        from '@/components/overview/DivisionOverview'
import { OverviewPageHeader }      from '@/components/overview/OverviewPageHeader'
import { LoadingSkeleton }         from '@/components/feedback/LoadingSkeleton'
import { ErrorState }              from '@/components/feedback/ErrorState'
import type { OverviewData }       from '@/types/overview'

export function OverviewDashboard() {
  const [data, setData]         = useState<OverviewData | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [isError, setError]     = useState(false)

  const load = async () => {
    setLoading(true)
    setError(false)
    try {
      const [statsEnv, workspaceEnv] = await Promise.all([
        fetchOverviewStats(),
        fetchOverviewWorkspace(),
      ])
      setData(buildOverviewData(statsEnv.data, workspaceEnv.data))
    } catch (err) {
      console.error('[Overview] API fetch failed:', err)
      setData(null)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Loading state ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <OverviewPageHeader division="P&I · H&M" />
        <LoadingSkeleton />
      </div>
    )
  }

  // ── Error state — never mask a failed fetch with fake data ────
  if (isError || !data) {
    return (
      <div className="page-container">
        <OverviewPageHeader division="P&I · H&M" onRefresh={load} />
        <div className="flex items-center justify-center min-h-[400px]">
          <ErrorState
            message="Could not load overview data"
            description="Unable to reach the server. Please check your connection and try again."
            onRetry={load}
          />
        </div>
      </div>
    )
  }

  const d = data

  return (
    <div className="page-container">

      {/* Page Header */}
      <OverviewPageHeader
        division="P&I · H&M"
        onRefresh={load}
      />

      {/* Row 1: Summary KPI Cards */}
      <section className="mb-5">
        <SummaryCards data={d.summary} />
      </section>

      {/* Row 2: Pipeline | Activity | Finance */}
      <div
        className="grid gap-4 mb-5"
        style={{ gridTemplateColumns: '1fr 1.2fr 0.9fr' }}
      >
        <div className="min-w-0">
          <WorkflowPipelineStatus data={d.workflowPipeline} />
        </div>
        <div className="min-w-0">
          <ActivityFeed items={d.recentActivity} />
        </div>
        <div className="min-w-0">
          <FinanceMonitorPanel
            summary={d.finance}
            overdueItems={d.overdueItems}
            upcomingItems={d.upcomingPayments}
          />
        </div>
      </div>

      {/* Row 3: Division Overview */}
      <section>
        <DivisionOverview data={d.divisionSummary} />
      </section>

    </div>
  )
}