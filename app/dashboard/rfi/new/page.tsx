import type { Metadata } from 'next'
import { Suspense } from 'react'
import { RfiCreateClient } from '@/components/rfi/RfiCreateClient'

export const metadata: Metadata = { title: 'New RFI | PPMI Flow' }

export default function NewRfiPage() {
  return (
    <Suspense>
      <RfiCreateClient />
    </Suspense>
  )
}