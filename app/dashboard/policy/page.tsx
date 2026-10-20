// FILE: app/dashboard/policy/page.tsx
import type { Metadata } from 'next'
import { PolicyListClient } from '@/components/policy/PolicyListClient'

export const metadata: Metadata = { title: 'Policy Placement | PPMI Flow' }

export default function PolicyPage() {
  // [contain:inline-size] keeps the table's intrinsic width from widening the
  // dashboard grid column; the table scrolls inside its own wrapper instead.
  return (
    <div className="page-container [contain:inline-size]">
      <PolicyListClient />
    </div>
  )
}