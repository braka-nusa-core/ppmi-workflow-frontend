import { cn } from '@/lib/utils'
import type { RfiStatus } from '@/types/rfi'

const STATUS_CONFIG: Record<RfiStatus, {
  label:  string
  bg:     string
  text:   string
  border: string
  dot:    string
}> = {
  DRAFT:           { label: 'Draft',           bg: '#f0f4f7', text: '#3a5068', border: '#b5cede', dot: '#7a8fa3' },
  WAITING_FINANCE: { label: 'Waiting Finance', bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  PROCESSED:       { label: 'Processed',       bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  CANCELLED:       { label: 'Cancelled',       bg: '#fdf2e8', text: '#7a3800', border: '#f0b87a', dot: '#d46e20' },
}

interface RfiStatusBadgeProps {
  status:     RfiStatus
  dot?:       boolean
  className?: string
}

export function RfiStatusBadge({ status, dot = true, className }: RfiStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      )}
      {cfg.label}
    </span>
  )
}