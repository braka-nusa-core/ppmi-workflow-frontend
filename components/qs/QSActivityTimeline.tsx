import {
  FilePlus,
  Pencil,
  ArrowRightLeft,
  Send,
  CheckCircle,
  RotateCcw,
  Receipt,
  StickyNote,
  Paperclip,
} from 'lucide-react'
import { cn }             from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import type { QSActivity, QSActivityType } from '@/types/qs'

const ACTIVITY_CONFIG: Record<QSActivityType, {
  icon:  React.ElementType
  bg:    string
  color: string
}> = {
  created:            { icon: FilePlus,       bg: 'bg-[#e8f3fb]', color: 'text-[#123d6b]' },
  updated:            { icon: Pencil,         bg: 'bg-[#f0f4f7]', color: 'text-[#3a5068]' },
  status_changed:     { icon: ArrowRightLeft, bg: 'bg-[#fdf7ed]', color: 'text-[#7a5000]' },
  submitted:          { icon: Send,           bg: 'bg-[#e8f3fb]', color: 'text-[#123d6b]' },
  approved:           { icon: CheckCircle,    bg: 'bg-[#eaf6f0]', color: 'text-[#1a5c38]' },
  revision_requested: { icon: RotateCcw,      bg: 'bg-[#fdf2e8]', color: 'text-[#7a3800]' },
  invoice_generated:  { icon: Receipt,        bg: 'bg-[#eaf6f0]', color: 'text-[#1a5c38]' },
  note_added:         { icon: StickyNote,     bg: 'bg-[#f0f4f7]', color: 'text-[#3a5068]' },
  attachment_added:   { icon: Paperclip,      bg: 'bg-[#f0f4f7]', color: 'text-[#3a5068]' },
}

interface QSActivityTimelineProps {
  activity: QSActivity[]
}

export function QSActivityTimeline({ activity }: QSActivityTimelineProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-[13px] font-semibold text-[#18273a]">Activity Timeline</h3>
      </div>
      <div className="px-5 py-4">
        {activity.length === 0 ? (
          <p className="text-[12px] text-[#7a8fa3]">No activity recorded yet</p>
        ) : (
          <div className="flex flex-col">
            {activity.map((item, idx) => {
              const cfg    = ACTIVITY_CONFIG[item.type]
              const Icon   = cfg.icon
              const isLast = idx === activity.length - 1

              return (
                <div key={item.id} className="flex gap-3">
                  {/* Icon + connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0',
                      cfg.bg
                    )}>
                      <Icon size={12} className={cfg.color} strokeWidth={1.8} />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-[#edf1f5] my-1" style={{ minHeight: 16 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className={cn('flex flex-col pb-4', isLast && 'pb-0')}>
                    <p className="text-[12px] font-semibold text-[#18273a] leading-tight">
                      {item.description}
                    </p>
                    {item.meta?.fromStatus && item.meta.toStatus && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f0f4f7] text-[#3a5068] border border-[#b5cede]">
                          {item.meta.fromStatus}
                        </span>
                        <span className="text-[10px] text-[#7a8fa3]">→</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e8f3fb] text-[#123d6b] border border-[#93c4e5]">
                          {item.meta.toStatus}
                        </span>
                      </div>
                    )}
                    <p className="text-[11px] text-[#7a8fa3] mt-1">
                      {item.actor} · {formatDateTime(item.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
