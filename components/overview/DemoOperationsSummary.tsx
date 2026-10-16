// FILE: components/overview/DemoOperationsSummary.tsx
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import type { DemoModuleSummary } from '@/lib/demo/overviewDemoData'

interface DemoOperationsSummaryProps {
  modules: DemoModuleSummary[]
}

export function DemoOperationsSummary({ modules }: DemoOperationsSummaryProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#18273a]">Operational Summary</h3>
            <DataSourceBadge source="demo" />
          </div>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">Downstream modules after policy issuance</p>
        </div>
      </div>

      <div className="px-5 py-2">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] border-b border-[#f0f4f7]">
          <span>Module</span>
          <span className="text-right">In progress</span>
          <span className="text-right">Completed</span>
          <span className="text-right">Attention</span>
        </div>
        {modules.map((m) => (
          <Link
            key={m.key}
            href={m.href}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 py-2.5 items-center border-b border-[#f7f9fb] last:border-0 hover:bg-[#f7f9fb] transition-colors duration-100"
          >
            <span className="text-[12px] font-medium text-[#18273a]">{m.label}</span>
            <span className="text-[12px] text-[#123d6b] font-semibold tabular-nums text-right">{m.inProgress}</span>
            <span className="text-[12px] text-[#1a5c38] tabular-nums text-right">{m.completed}</span>
            <span className={cn('text-[12px] tabular-nums text-right', m.attention > 0 ? 'text-[#8c1f1f] font-semibold' : 'text-[#9aa3ad]')}>
              {m.attention}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
