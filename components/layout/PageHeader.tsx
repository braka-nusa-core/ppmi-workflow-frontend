import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('page-header', className)}>
      <div className="flex flex-col gap-0.5">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 mb-1">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <ChevronRight size={11} className="text-[#ced3d9]" />}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-xs text-[#9aa3ad] hover:text-[#1e4a70] transition-colors duration-100"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-xs text-[#4d5966]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="text-xl font-semibold text-[#232b34] leading-tight">{title}</h1>

        {/* Description */}
        {description && (
          <p className="text-sm text-[#9aa3ad] mt-0.5">{description}</p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
          {actions}
        </div>
      )}
    </div>
  )
}
