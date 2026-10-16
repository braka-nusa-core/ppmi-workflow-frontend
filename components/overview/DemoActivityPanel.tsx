// FILE: components/overview/DemoActivityPanel.tsx
import {
  Shield,
  ClipboardList,
  Wallet,
  Receipt,
  CheckCircle,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'
import type { ElementType } from 'react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import type { DemoActivity, DemoActivityKind } from '@/lib/demo/overviewDemoData'

const KIND_CONFIG: Record<DemoActivityKind, { icon: ElementType; iconBg: string; iconText: string }> = {
  placement:   { icon: Shield,        iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#123d6b]' },
  rfi:         { icon: ClipboardList, iconBg: 'bg-[#edf5fb]', iconText: 'text-[#2d6495]' },
  voucher:     { icon: Wallet,        iconBg: 'bg-[#edf5fb]', iconText: 'text-[#3d7baf]' },
  invoice:     { icon: Receipt,       iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#2d6495]' },
  payment:     { icon: CheckCircle,   iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]' },
  overdue:     { icon: AlertTriangle, iconBg: 'bg-[#fdecea]', iconText: 'text-[#8c1f1f]' },
  installment: { icon: CreditCard,    iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#123d6b]' },
}

interface DemoActivityPanelProps {
  items: DemoActivity[]
}

export function DemoActivityPanel({ items }: DemoActivityPanelProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-semibold text-[#18273a]">Recent Workflow Activity</h3>
            <DataSourceBadge source="demo" />
          </div>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">Placement, voucher, RFI and finance events</p>
        </div>
      </div>

      <div className="divide-y divide-[#f7f9fb]">
        {items.map((item) => {
          const cfg  = KIND_CONFIG[item.kind]
          const Icon = cfg.icon
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 px-5 py-3.5',
                item.kind === 'overdue' && 'bg-[#fffaf9]'
              )}
            >
              <div className={cn('flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 mt-0.5', cfg.iconBg)}>
                <Icon size={13} className={cfg.iconText} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[12px] font-semibold text-[#18273a] leading-tight">{item.title}</span>
                      <span className="text-[11px] font-medium text-[#7a8fa3]">{item.docNumber}</span>
                    </div>
                    <p className="text-[11px] text-[#3a5068] leading-snug">{item.description}</p>
                  </div>
                  <span className="text-[10px] text-[#7a8fa3] flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>
                <p className="text-[10px] text-[#7a8fa3] mt-1">by {item.actor}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
