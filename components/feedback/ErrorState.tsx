import { AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface ErrorStateProps {
  message?:    string
  description?: string
  onRetry?:    () => void
  className?:  string
}

export function ErrorState({
  message = 'Something went wrong',
  description = 'An error occurred while loading data. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('empty-state', className)}>
      <AlertCircle className="empty-state-icon text-[#f5b4b4]" />
      <p className="text-sm font-medium text-[#4d5966] mb-1">{message}</p>
      <p className="text-xs text-[#9aa3ad] max-w-[280px] mb-4">{description}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={13} />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
