import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg'

const SIZE_MAP: Record<SpinnerSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 28,
}

interface SpinnerProps {
  size?:      SpinnerSize
  className?: string
  label?:     string
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[#9aa3ad]', className)}>
      <Loader2 size={SIZE_MAP[size]} className="animate-spin flex-shrink-0" />
      {label && <span className="text-sm">{label}</span>}
    </span>
  )
}

// Full-page loading state
export function PageSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-[#9aa3ad]">{label}</p>
    </div>
  )
}
