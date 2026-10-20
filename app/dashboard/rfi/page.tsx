// FILE: app/dashboard/rfi/page.tsx
import type { Metadata } from 'next'
import { RfiListClient } from '@/components/rfi/RfiListClient'

export const metadata: Metadata = { title: 'Request For Invoice | PPMI Flow' }

export default function RfiPage() {
  // [contain:inline-size] keeps the table's intrinsic width from widening the
  // dashboard grid column; the table scrolls inside its own wrapper instead.
  return (
    <div className="page-container [contain:inline-size]">
      <RfiListClient />
    </div>
  )
}