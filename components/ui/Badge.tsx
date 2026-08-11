import { cn } from '@/lib/utils'
import type { Division } from '@/types/workflow'

// ─── Status Badge (workflow-aware) ──────────────────────────────
type BadgeVariant =
  | 'draft'
  | 'pending'
  | 'active'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'overdue'
  | 'default'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  dot?: boolean
  className?: string
}

export function Badge({ children, variant = 'default', dot = false, className }: BadgeProps) {
  return (
    <span className={cn('badge', `badge-${variant}`, className)}>
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', getDotColor(variant))} />
      )}
      {children}
    </span>
  )
}

function getDotColor(variant: BadgeVariant): string {
  const map: Record<BadgeVariant, string> = {
    draft:     'bg-[#4d5966]',
    pending:   'bg-[#7a4f00]',
    active:    'bg-[#1e4a70]',
    approved:  'bg-[#1a6b3a]',
    rejected:  'bg-[#9b2020]',
    completed: 'bg-[#1e4a70]',
    overdue:   'bg-[#9b2020]',
    default:   'bg-[#9aa3ad]',
  }
  return map[variant]
}

// ─── Status Badge mapped from workflow status ───────────────────
const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  DRAFT:        'draft',
  PENDING:      'pending',
  IN_PROGRESS:  'active',
  ACTIVE:       'active',
  APPROVED:     'approved',
  REJECTED:     'rejected',
  COMPLETED:    'completed',
  OVERDUE:      'overdue',
  PAID:         'approved',
  UNPAID:       'pending',
  PARTIAL:      'pending',
}

const STATUS_LABEL_MAP: Record<string, string> = {
  DRAFT:        'Draft',
  PENDING:      'Pending',
  IN_PROGRESS:  'In Progress',
  ACTIVE:       'Active',
  APPROVED:     'Approved',
  REJECTED:     'Rejected',
  COMPLETED:    'Completed',
  OVERDUE:      'Overdue',
  PAID:         'Paid',
  UNPAID:       'Unpaid',
  PARTIAL:      'Partial',
}

interface StatusBadgeProps {
  status: string
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, dot = true, className }: StatusBadgeProps) {
  const variant = STATUS_VARIANT_MAP[status] ?? 'default'
  const label = STATUS_LABEL_MAP[status] ?? status

  return (
    <Badge variant={variant} dot={dot} className={className}>
      {label}
    </Badge>
  )
}

// ─── Division Badge ─────────────────────────────────────────────
interface DivisionBadgeProps {
  division: Division
  className?: string
}

const DIVISION_STYLES: Record<Division, string> = {
  PI:    'bg-[#e8f4fd] text-[#1e4a70] border-[#b3c9df]',
  HM:    'bg-[#e8f7ee] text-[#1a6b3a] border-[#a3d9b8]',
  CARGO: 'bg-[#fdf3e7] text-[#8a5a1e] border-[#e8c896]',
}

const DIVISION_LABELS: Record<Division, string> = {
  PI:    'P&I',
  HM:    'H&M',
  CARGO: 'Cargo',
}

export function DivisionBadge({ division, className }: DivisionBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border',
      DIVISION_STYLES[division],
      className
    )}>
      {DIVISION_LABELS[division]}
    </span>
  )
}