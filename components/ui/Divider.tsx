import { cn } from '@/lib/utils'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  label?:       string
  className?:   string
}

export function Divider({
  orientation = 'horizontal',
  label,
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <span className={cn('inline-block w-px self-stretch bg-[#e2e5e9]', className)} />
    )
  }

  if (label) {
    return (
      <div className={cn('flex items-center gap-3 my-4', className)}>
        <span className="flex-1 h-px bg-[#e2e5e9]" />
        <span className="text-xs text-[#9aa3ad] font-medium">{label}</span>
        <span className="flex-1 h-px bg-[#e2e5e9]" />
      </div>
    )
  }

  return (
    <hr className={cn('border-0 border-t border-[#e2e5e9] my-4', className)} />
  )
}
