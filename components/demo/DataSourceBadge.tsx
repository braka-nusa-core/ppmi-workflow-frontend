// FILE: components/demo/DataSourceBadge.tsx
import { cn } from '@/lib/utils'

interface DataSourceBadgeProps {
  /** 'live' = comes from the real backend; 'demo' = illustrative demo data. */
  source:     'live' | 'demo'
  className?: string
}

const STYLES = {
  live: 'bg-[#eaf6f0] text-[#1a5c38] border-[#a3d9b8]',
  demo: 'bg-[#fdf7ed] text-[#7a5000] border-[#e8c896]',
} as const

const LABELS = { live: 'Live data', demo: 'Demo data' } as const

const TITLES = {
  live: 'Loaded from the live system',
  demo: 'Illustrative demo data — not from the live backend',
} as const

export function DataSourceBadge({ source, className }: DataSourceBadgeProps) {
  return (
    <span
      title={TITLES[source]}
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border whitespace-nowrap',
        STYLES[source],
        className
      )}
    >
      {LABELS[source]}
    </span>
  )
}
