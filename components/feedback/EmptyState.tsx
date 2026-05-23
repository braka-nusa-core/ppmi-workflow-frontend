import { FileX, Search, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyVariant = 'default' | 'search' | 'error'

interface EmptyStateProps {
  message?: string
  description?: string
  variant?: EmptyVariant
  action?: React.ReactNode
  className?: string
}

const VARIANT_ICONS: Record<EmptyVariant, React.ElementType> = {
  default: FileX,
  search:  Search,
  error:   AlertCircle,
}

export function EmptyState({
  message = 'No records found',
  description,
  variant = 'default',
  action,
  className,
}: EmptyStateProps) {
  const Icon = VARIANT_ICONS[variant]

  return (
    <div className={cn('empty-state', className)}>
      <Icon className="empty-state-icon" />
      <p className="text-sm font-medium text-[#4d5966] mb-1">{message}</p>
      {description && (
        <p className="text-xs text-[#9aa3ad] max-w-[280px]">{description}</p>
      )}
      {action && (
        <div className="mt-4">{action}</div>
      )}
    </div>
  )
}
