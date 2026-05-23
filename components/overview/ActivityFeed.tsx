import {
  FilePlus,
  FileCheck,
  FileX,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Package,
  Wallet,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import type { ActivityItem, ActivityType } from '@/types/overview'
import { DivisionBadge } from '@/components/ui/Badge'

// ─── Activity type config ────────────────────────────────────────
const ACTIVITY_CONFIG: Record<ActivityType, {
  icon:     React.ElementType
  iconBg:   string
  iconText: string
  label:    string
}> = {
  qs_created:          { icon: FilePlus,    iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#123d6b]', label: 'QS Created'          },
  qs_approved:         { icon: FileCheck,   iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]', label: 'QS Approved'         },
  invoice_created:     { icon: Receipt,     iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#2d6495]', label: 'Invoice Created'     },
  invoice_approved:    { icon: FileCheck,   iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]', label: 'Invoice Approved'    },
  voucher_created:     { icon: Wallet,      iconBg: 'bg-[#edf5fb]', iconText: 'text-[#3d7baf]', label: 'Voucher Created'     },
  payment_verified:    { icon: CheckCircle, iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]', label: 'Payment Verified'    },
  payment_overdue:     { icon: AlertTriangle,iconBg:'bg-[#fdecea]', iconText: 'text-[#8c1f1f]', label: 'Payment Overdue'     },
  shipment_completed:  { icon: Package,     iconBg: 'bg-[#eaf6f0]', iconText: 'text-[#1a5c38]', label: 'Shipment Completed'  },
  installment_recorded:{ icon: CreditCard,  iconBg: 'bg-[#e8f3fb]', iconText: 'text-[#123d6b]', label: 'Installment Recorded'},
  document_rejected:   { icon: FileX,       iconBg: 'bg-[#fdecea]', iconText: 'text-[#8c1f1f]', label: 'Document Rejected'   },
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div>
          <h3 className="text-[14px] font-semibold text-[#18273a]">
            Recent Activity
          </h3>
          <p className="text-[11px] text-[#7a8fa3] mt-0.5">
            Latest operational events across all divisions
          </p>
        </div>
        <a
          href="#"
          className="text-[11px] font-medium text-[#123d6b] hover:text-[#0d2d50] hover:underline transition-colors duration-100"
        >
          View all
        </a>
      </div>

      {/* Feed */}
      <div className="divide-y divide-[#f7f9fb]">
        {items.map((item) => {
          const config  = ACTIVITY_CONFIG[item.type]
          const Icon    = config.icon

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 px-5 py-3.5',
                'hover:bg-[#f7f9fb] transition-colors duration-100',
                item.type === 'payment_overdue' && 'bg-[#fffaf9]',
                item.type === 'document_rejected' && 'bg-[#fffaf9]',
              )}
            >
              {/* Icon */}
              <div className={cn(
                'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 mt-0.5',
                config.iconBg
              )}>
                <Icon size={13} className={config.iconText} strokeWidth={1.8} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[12px] font-semibold text-[#18273a] leading-tight">
                        {item.title}
                      </span>
                      <DivisionBadge division={item.division} />
                      <span className="text-[11px] font-medium text-[#7a8fa3]">
                        {item.docNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3a5068] leading-snug">
                      {item.description}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="text-[10px] text-[#7a8fa3] flex-shrink-0 mt-0.5 whitespace-nowrap">
                    {formatRelativeTime(item.timestamp)}
                  </span>
                </div>

                {/* Actor */}
                <p className="text-[10px] text-[#7a8fa3] mt-1">
                  by {item.actor}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
