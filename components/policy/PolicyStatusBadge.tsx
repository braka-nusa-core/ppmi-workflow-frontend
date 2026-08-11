import { cn } from '@/lib/utils'
import type { PolicyStatus } from '@/types/policy'

// ─── Status config ───────────────────────────────────────────────
const STATUS_CONFIG: Record<PolicyStatus, {
  label:  string
  bg:     string
  text:   string
  border: string
  dot:    string
}> = {
  WAITING_POLICY:        { label: 'Waiting Policy',        bg: '#f0f4f7', text: '#3a5068', border: '#b5cede', dot: '#7a8fa3' },
  POLICY_CREATED:        { label: 'Policy Created',        bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  PLACEMENT_IN_PROGRESS: { label: 'Placement In Progress', bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  PLACEMENT_COMPLETED:   { label: 'Placement Completed',   bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  READY_FOR_RFI:         { label: 'Ready For RFI',         bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
}

interface PolicyStatusBadgeProps {
  status:     PolicyStatus
  dot?:       boolean
  className?: string
}

export function PolicyStatusBadge({ status, dot = true, className }: PolicyStatusBadgeProps) {
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