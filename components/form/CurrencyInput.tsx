'use client'

import { useState, useCallback, forwardRef } from 'react'
import { cn } from '@/lib/utils'

type Currency = 'IDR' | 'USD'

interface CurrencyInputProps {
  value?: number
  onChange?: (value: number) => void
  currency?: Currency
  error?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  name?: string
  id?: string
}

const CURRENCY_CONFIG: Record<Currency, { symbol: string; locale: string; fractionDigits: number }> = {
  IDR: { symbol: 'IDR', locale: 'id-ID', fractionDigits: 0 },
  USD: { symbol: 'USD', locale: 'en-US', fractionDigits: 2 },
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  function CurrencyInput(
    {
      value = 0,
      onChange,
      currency = 'IDR',
      error,
      disabled,
      placeholder,
      className,
      name,
      id,
    },
    ref
  ) {
    const config = CURRENCY_CONFIG[currency]

    const formatDisplay = useCallback((num: number): string => {
      if (num === 0) return ''
      return num.toLocaleString(config.locale, {
        minimumFractionDigits: config.fractionDigits,
        maximumFractionDigits: config.fractionDigits,
      })
    }, [config])

    const parseInput = useCallback((input: string): number => {
      const cleaned = input.replace(/[^\d.]/g, '')
      return parseFloat(cleaned) || 0
    }, [])

    const [displayValue, setDisplayValue] = useState(formatDisplay(value))

    const handleFocus = () => {
  setDisplayValue(value === 0 ? '' : String(value))
}

const handleBlur = () => {
  const parsed = parseInput(displayValue)
  onChange?.(parsed)
  setDisplayValue(formatDisplay(parsed))
}

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d.]/g, '')
      setDisplayValue(raw)
    }

    return (
      <div className={cn('relative flex items-center', className)}>
        {/* Currency label */}
        <span className={cn(
          'absolute left-0 top-0 bottom-0 flex items-center justify-center',
          'px-3 text-xs font-medium border-r',
          'bg-[#f8f9fa] rounded-l',
          error
            ? 'border-[#9b2020] text-[#9b2020]'
            : 'border-[#ced3d9] text-[#9aa3ad]',
          disabled && 'opacity-50'
        )}>
          {config.symbol}
        </span>
        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder ?? (currency === 'IDR' ? '0' : '0.00')}
          className={cn(
            'form-input text-currency text-right pl-[56px]',
            error && 'error',
          )}
        />
      </div>
    )
  }
)
