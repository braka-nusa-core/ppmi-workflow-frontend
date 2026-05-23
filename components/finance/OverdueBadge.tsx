import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { daysUntilDue } from '@/lib/format'

interface OverdueBadgeProps {
  dueDate:   string
  status?:   string // If 'PAID' — don't show overdue
  className?: string
}

export function OverdueBadge({ dueDate, status, className }: OverdueBadgeProps) {
  if (status === 'PAID') return null

  const days = daysUntilDue(dueDate)
  if (days === null || days >= 0) return null

  const overdueDays = Math.abs(days)

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold',
      'bg-[#fdecea] text-[#9b2020] border border-[#f5b4b4]',
      className
    )}>
      <AlertTriangle size={10} />
      {overdueDays}d overdue
    </span>
  )
}

interface DueSoonBadgeProps {
  dueDate:    string
  status?:    string
  threshold?: number  // days — default 7
  className?: string
}

export function DueSoonBadge({ dueDate, status, threshold = 7, className }: DueSoonBadgeProps) {
  if (status === 'PAID') return null

  const days = daysUntilDue(dueDate)
  if (days === null || days < 0 || days > threshold) return null

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold',
      'bg-[#fff8e6] text-[#7a4f00] border border-[#fcd97a]',
      className
    )}>
      <AlertTriangle size={10} />
      Due in {days}d
    </span>
  )
}
