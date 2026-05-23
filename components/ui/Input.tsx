import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

// ─── Base Input ─────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ error, leftIcon, rightIcon, className, ...props }, ref) {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[#9aa3ad] flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              'form-input',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              error && 'error',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 text-[#9aa3ad] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        className={cn('form-input', error && 'error', className)}
        {...props}
      />
    )
  }
)

// ─── Textarea ───────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ error, className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'form-input h-auto py-2 resize-none',
          error && 'error',
          className
        )}
        {...props}
      />
    )
  }
)

// ─── Select ─────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  placeholder?: string
  options: { value: string; label: string }[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ error, placeholder, options, className, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'form-input appearance-none bg-white pr-8',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%239aa3ad\' d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")] bg-no-repeat bg-[right_10px_center]',
          error && 'error',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    )
  }
)
