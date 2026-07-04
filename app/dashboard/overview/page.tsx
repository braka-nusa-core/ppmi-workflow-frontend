import type { Metadata } from 'next'
import { OverviewDashboard } from './OverviewDashboard'

export const metadata: Metadata = { title: 'Overview | PPMI Flow' }

export default function OverviewPage() {
  // Data fetching is done client-side (in OverviewDashboard) because:
  // - Auth token lives in localStorage (not cookies)
  // - axios interceptors require browser environment
  // - Server Components cannot access localStorage
  return <OverviewDashboard />
}
