// FILE: app/dashboard/overview/page.tsx
import type { Metadata } from 'next'
import { OverviewDashboard } from './OverviewDashboard'

export const metadata: Metadata = { title: 'Overview | PPMI Flow' }

export default function OverviewPage() {
  // Data fetching is done client-side (in the dashboard components) because:
  // - Auth token lives in localStorage (not cookies)
  // - axios interceptors require browser environment
  // - Server Components cannot access localStorage

  // NEXT_PUBLIC_DEMO_MODE=true → demo Overview (real quotation KPIs + labelled
  // demo downstream stages). Otherwise the original dashboard, unchanged.
  // The comparison is written inline and the demo module is required inside
  // the branch so the bundler folds it away at build time: with the flag off,
  // the demo dashboard and its data are not part of the bundle.
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { DemoOverviewDashboard } = require('./DemoOverviewDashboard') as typeof import('./DemoOverviewDashboard')
    return <DemoOverviewDashboard />
  }

  return <OverviewDashboard />
}