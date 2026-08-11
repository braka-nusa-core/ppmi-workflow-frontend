import {
  FilePlus,
  CheckSquare,
  Paperclip,
  Send,
  XCircle,
  CheckCircle,
  Pencil,
} from 'lucide-react'
import { formatDateTime } from '@/lib/format'
import type { RfiHistoryEvent } from '@/types/rfi'

const ACTION_CONFIG: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
  'Create RFI':          { icon: FilePlus,    bg: 'bg-[#e8f3fb]', color: 'text-[#123d6b]' },
  'Checklist Updated':   { icon: CheckSquare, bg: 'bg-[#fdf7ed]', color: 'text-[#7a5000]' },
  'Attachment Uploaded': { icon: Paperclip,   bg: 'bg-[#f0f4f7]', color: 'text-[#3a5068]' },
  'Submit':              { icon: Send,        bg: 'bg-[#e8f3fb]', color: 'text-[#123d6b]' },
  'Finance Processed':   { icon: CheckCircle, bg: 'bg-[#eaf6f0]', color: 'text-[#1a5c38]' },
  'Cancelled':           { icon: XCircle,     bg: 'bg-[#fdf2e8]', color: 'text-[#7a3800]' },
}

const DEFAULT_CONFIG = { icon: Pencil, bg: 'bg-[#f0f4f7]', color: 'text-[#3a5068]' }

interface RfiActivityTimelineProps {
  history: RfiHistoryEvent[]
}

export function RfiActivityTimeline({ history }: RfiActivityTimelineProps) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-[13px] font-semibold text-[#18273a]">Activity Timeline</h3>
      </div>
      <div className="px-4 py-3">
        {history.length === 0 ? (
          <p className="text-[12px] text-[#7a8fa3] py-4 text-center">No activity yet.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {history.map((event) => {
              const cfg = ACTION_CONFIG[event.action] ?? DEFAULT_CONFIG
              const Icon = cfg.icon
              return (
                <li key={event.id} className="flex gap-3">
                  <div className={`flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 ${cfg.bg}`}>
                    <Icon size={13} className={cfg.color} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] font-medium text-[#18273a]">{event.action}</p>
                    {event.description && (
                      <p className="text-[11px] text-[#7a8fa3] mt-0.5">{event.description}</p>
                    )}
                    <p className="text-[10px] text-[#9aa3ad] mt-0.5">
                      {event.performedBy} · {formatDateTime(event.createdAt)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}