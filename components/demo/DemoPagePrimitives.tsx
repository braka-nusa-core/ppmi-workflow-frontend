// FILE: components/demo/DemoPagePrimitives.tsx
'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/format'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'

// ─── Money ───────────────────────────────────────────────────────
export const idr        = (n: number) => formatCurrency(n, 'IDR')
export const idrCompact = (n: number) => formatCurrency(n, 'IDR', { compact: true })

// ─── Client-only "now" ───────────────────────────────────────────
// Demo dates are relative to the current time, so demo pages compute them
// after mount (never during server rendering) to avoid hydration mismatches.
export function useDemoNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => { setNow(new Date()) }, [])
  return now
}

// ─── Section card ────────────────────────────────────────────────
interface DemoSectionProps {
  title:        string
  description?: string
  right?:       ReactNode
  children:     ReactNode
  className?:   string
}

export function DemoSection({ title, description, right, children, className }: DemoSectionProps) {
  return (
    <div className={cn('card min-w-0', className)}>
      <div className="card-header">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#18273a]">{title}</h3>
            <DataSourceBadge source="demo" />
          </div>
          {description && <p className="text-[11px] text-[#7a8fa3] mt-0.5">{description}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

// ─── KPI card ────────────────────────────────────────────────────
type Tone = 'default' | 'danger' | 'warning' | 'success'
const TONE: Record<Tone, string> = {
  default: 'text-[#18273a]', danger: 'text-[#8c1f1f]', warning: 'text-[#7a5000]', success: 'text-[#1a5c38]',
}

interface DemoKpiProps { label: string; value: string; sub?: string; tone?: Tone; href?: string }

export function DemoKpi({ label, value, sub, tone = 'default', href }: DemoKpiProps) {
  const body = (
    <>
      <p className="text-[11px] font-medium text-[#7a8fa3] leading-tight">{label}</p>
      <p className={cn('text-[20px] font-semibold leading-none mt-1.5 tabular-nums', TONE[tone])}>{value}</p>
      {sub && <p className="text-[11px] text-[#9aa3ad] mt-1.5">{sub}</p>}
    </>
  )
  const cls = 'card card-body block min-w-0'
  return href
    ? <Link href={href} className={cn(cls, 'hover:border-[#b5cede] transition-colors duration-100')}>{body}</Link>
    : <div className={cls}>{body}</div>
}

// ─── Simple read-only table ──────────────────────────────────────
export interface DemoColumn<T> {
  header:  string
  align?:  'left' | 'right'
  render:  (row: T) => ReactNode
  footer?: ReactNode
  /** Let long text (names, labels) wrap instead of forcing horizontal scroll. */
  wrap?:   boolean
}

interface DemoTableProps<T> {
  columns:  DemoColumn<T>[]
  rows:     T[]
  rowKey:   (row: T) => string
  empty?:   string
}

export function DemoTable<T>({ columns, rows, rowKey, empty = 'No records' }: DemoTableProps<T>) {
  const hasFooter = columns.some((c) => c.footer !== undefined)
  const cell = (align?: 'left' | 'right', wrap?: boolean) => cn('px-3 py-2.5 text-[12px]', wrap ? 'whitespace-normal' : 'whitespace-nowrap', align === 'right' ? 'text-right tabular-nums' : 'text-left')
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[#f0f4f7]">
            {columns.map((c) => (
              <th key={c.header} className={cn(cell(c.align), 'whitespace-nowrap text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]')}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-5 text-[12px] text-[#7a8fa3]">{empty}</td></tr>
          )}
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-[#f7f9fb] last:border-0">
              {columns.map((c) => <td key={c.header} className={cn(cell(c.align, c.wrap), 'text-[#18273a]')}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
        {hasFooter && (
          <tfoot>
            <tr className="border-t border-[#e2e9f0] bg-[#f7f9fb]">
              {columns.map((c) => (
                <td key={c.header} className={cn(cell(c.align, c.wrap), 'font-semibold text-[#18273a]')}>{c.footer ?? ''}</td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}