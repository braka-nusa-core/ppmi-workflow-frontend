import { cn } from '@/lib/utils'

interface FormFieldProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
  htmlFor?: string
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={cn('form-label', required && 'required')}
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className="form-error">{error}</p>
      )}
      {hint && !error && (
        <p className="form-hint">{hint}</p>
      )}
    </div>
  )
}

// ─── FormSection — grouped form area with title ──────────────────
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  columns?: 1 | 2 | 3
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  columns = 1,
  className,
}: FormSectionProps) {
  const gridClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
  }[columns]

  return (
    <div className={cn('mb-6', className)}>
      {(title || description) && (
        <div className="mb-4 pb-3 border-b border-[#e2e5e9]">
          {title && (
            <h4 className="text-sm font-semibold text-[#232b34]">{title}</h4>
          )}
          {description && (
            <p className="text-xs text-[#9aa3ad] mt-0.5">{description}</p>
          )}
        </div>
      )}
      <div className={cn('grid gap-4', gridClass)}>
        {children}
      </div>
    </div>
  )
}
