'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { loginSchema, type LoginFormData } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword]   = useState(false)
  const [serverError,  setServerError]    = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const handleFormSubmit = async (data: LoginFormData) => {
    setServerError(null)
    try {
      await onSubmit(data)
    } catch (err: unknown) {
      const message =
        (err as { message?: string })?.message ?? 'Invalid email or password. Please try again.'
      setServerError(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <div className="flex flex-col gap-4">

        {/* ── Server Error ────────────────────────────────────── */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-start gap-2.5 px-3 py-3 rounded-md bg-[#fdecea] border border-[#f0a0a0]"
          >
            <AlertCircle
              size={14}
              className="text-[#8c1f1f] mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-[#8c1f1f] leading-snug">{serverError}</p>
          </motion.div>
        )}

        {/* ── Email ───────────────────────────────────────────── */}
        <div>
          <label htmlFor="email" className="form-label required">
            Email Address
          </label>
          <div className="relative">
            <Mail
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8fa3] pointer-events-none"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@ppmi.co.id"
              className={cn(
                'form-input pl-9',
                errors.email && 'error'
              )}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p className="form-error">{errors.email.message}</p>
          )}
        </div>

        {/* ── Password ────────────────────────────────────────── */}
        <div>
          <label htmlFor="password" className="form-label required">
            Password
          </label>
          <div className="relative">
            <Lock
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8fa3] pointer-events-none"
            />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={cn(
                'form-input pl-9 pr-10',
                errors.password && 'error'
              )}
              {...register('password')}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'text-[#7a8fa3] hover:text-[#3a5068]',
                'transition-colors duration-100'
              )}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword
                ? <EyeOff size={14} />
                : <Eye size={14} />
              }
            </button>
          </div>
          {errors.password && (
            <p className="form-error">{errors.password.message}</p>
          )}
        </div>

        {/* ── Remember + Forgot ───────────────────────────────── */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              className={cn(
                'w-3.5 h-3.5 rounded border border-[#b5cede] appearance-none',
                'bg-white checked:bg-[#123d6b] checked:border-[#123d6b]',
                'transition-colors duration-100 cursor-pointer',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e5f9e] focus-visible:outline-offset-1',
                // Checkmark via bg-image
                'checked:bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 10 10\'%3E%3Cpath fill=\'white\' d=\'M1.5 5L4 7.5 8.5 2\'/%3E%3C/svg%3E")] bg-center bg-no-repeat'
              )}
            />
            <span className="text-xs text-[#3a5068] group-hover:text-[#18273a] transition-colors duration-100 select-none">
              Remember me
            </span>
          </label>

          <a
            href="#"
            className={cn(
              'text-xs font-medium text-[#123d6b]',
              'hover:text-[#0d2d50] hover:underline',
              'transition-colors duration-100'
            )}
          >
            Forgot password?
          </a>
        </div>

        {/* ── Submit ──────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'btn btn-primary btn-lg w-full mt-1',
            'relative overflow-hidden',
            isSubmitting && 'cursor-not-allowed opacity-80'
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In to PPMI Flow'
          )}
        </button>

      </div>
    </form>
  )
}
