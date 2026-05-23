import { cn } from '@/lib/utils'
import type { QSStatus, QSType } from '@/types/qs'

// ─── Status config ───────────────────────────────────────────────
const STATUS_CONFIG: Record<QSStatus, {
  label:  string
  bg:     string
  text:   string
  border: string
  dot:    string
}> = {
  DRAFT:     { label: 'Draft',     bg: '#f0f4f7', text: '#3a5068', border: '#b5cede', dot: '#7a8fa3' },
  PENDING:   { label: 'Pending',   bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  APPROVED:  { label: 'Approved',  bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  REVISION:  { label: 'Revision',  bg: '#fdf2e8', text: '#7a3800', border: '#f0b87a', dot: '#d46e20' },
  COMPLETED: { label: 'Completed', bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
}

interface QSStatusBadgeProps {
  status:     QSStatus
  dot?:       boolean
  className?: string
}

export function QSStatusBadge({ status, dot = true, className }: QSStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: cfg.dot }}
        />
      )}
      {cfg.label}
    </span>
  )
}

// ─── QS Type Badge ───────────────────────────────────────────────
interface QSTypeBadgeProps {
  type:       QSType
  className?: string
}

export function QSTypeBadge({ type, className }: QSTypeBadgeProps) {
  const isNew = type === 'NEW'
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border', className)}
      style={isNew
        ? { background: '#e8f3fb', color: '#123d6b', borderColor: '#93c4e5' }
        : { background: '#f7f9fb', color: '#3a5068', borderColor: '#b5cede' }
      }
    >
      {isNew ? 'New' : 'Renewal'}
    </span>
  )
}
