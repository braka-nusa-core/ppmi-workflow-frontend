import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

export interface TimelineEvent {
  id:          string
  action:      string
  description?: string
  actor:       string
  timestamp:   string
  type:        'success' | 'error' | 'info' | 'pending'
}

interface WorkflowTimelineProps {
  events:    TimelineEvent[]
  className?: string
}

const EVENT_ICONS = {
  success: CheckCircle,
  error:   XCircle,
  info:    ArrowRight,
  pending: Clock,
}

const EVENT_COLORS = {
  success: 'text-[#1a6b3a] bg-[#e8f7ee] border-[#a3d9b8]',
  error:   'text-[#9b2020] bg-[#fdecea] border-[#f5b4b4]',
  info:    'text-[#1e4a70] bg-[#e8f4fd] border-[#b3c9df]',
  pending: 'text-[#7a4f00] bg-[#fff8e6] border-[#fcd97a]',
}

export function WorkflowTimeline({ events, className }: WorkflowTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-[#9aa3ad] py-4 text-center">No activity yet</p>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {events.map((event, idx) => {
        const Icon = EVENT_ICONS[event.type]
        const isLast = idx === events.length - 1

        return (
          <div key={event.id} className="flex gap-3">
            {/* Icon + connector */}
            <div className="flex flex-col items-center">
              <span className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full border flex-shrink-0',
                EVENT_COLORS[event.type]
              )}>
                <Icon size={12} />
              </span>
              {!isLast && (
                <span className="w-px flex-1 bg-[#e2e5e9] my-1" />
              )}
            </div>

            {/* Content */}
            <div className={cn('flex flex-col pb-4', isLast && 'pb-0')}>
              <p className="text-xs font-semibold text-[#232b34] leading-tight">
                {event.action}
              </p>
              {event.description && (
                <p className="text-xs text-[#4d5966] mt-0.5">{event.description}</p>
              )}
              <p className="text-[10px] text-[#9aa3ad] mt-1">
                {event.actor} · {formatDateTime(event.timestamp)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
