import { cn } from '@/lib/utils'

// ─── Base Card ──────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function Card({ children, className, noPadding }: CardProps) {
  return (
    <div className={cn('card', !noPadding && 'card-body', className)}>
      {children}
    </div>
  )
}

// ─── Card with Header/Body/Footer ──────────────────────────────
interface CardSectionProps {
  title?: React.ReactNode
  description?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
  bodyClassName?: string
}

export function CardSection({
  title,
  description,
  actions,
  children,
  footer,
  className,
  bodyClassName,
}: CardSectionProps) {
  return (
    <div className={cn('card', className)}>
      {(title || actions) && (
        <div className="card-header">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-[#232b34]">{title}</h3>
            ) : (
              title
            )}
            {description && (
              <p className="text-xs text-[#9aa3ad] mt-0.5">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children && (
        <div className={cn('card-body', bodyClassName)}>
          {children}
        </div>
      )}
      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  )
}

// ─── KPI / Stat Card ────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: React.ReactNode
  trend?: { value: string; positive: boolean }
  className?: string
}

export function StatCard({ label, value, subValue, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn('card card-body flex flex-col gap-3', className)}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-[#9aa3ad] uppercase tracking-wider">{label}</p>
        {icon && (
          <span className="text-[#9aa3ad]">{icon}</span>
        )}
      </div>
      <div>
        <p className="text-2xl font-semibold text-[#232b34] leading-none">{value}</p>
        {subValue && (
          <p className="text-xs text-[#9aa3ad] mt-1">{subValue}</p>
        )}
      </div>
      {trend && (
        <p className={cn(
          'text-xs font-medium',
          trend.positive ? 'text-[#1a6b3a]' : 'text-[#9b2020]'
        )}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </p>
      )}
    </div>
  )
}
