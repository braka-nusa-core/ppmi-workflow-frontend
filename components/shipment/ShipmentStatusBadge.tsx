import { cn } from '@/lib/utils'
import type { ShipmentStatus } from '@/types/shipment'
import { CheckCircle, Circle } from 'lucide-react'

// ─── Shipment Status ─────────────────────────────────────────────
const STATUS_CFG: Record<ShipmentStatus, {
  label: string; bg: string; text: string; border: string; dot: string
}> = {
  DRAFT:                { label: 'Draft',               bg: '#f0f4f7', text: '#3a5068', border: '#b5cede', dot: '#7a8fa3' },
  IN_PROGRESS:          { label: 'In Progress',          bg: '#e8f3fb', text: '#123d6b', border: '#93c4e5', dot: '#123d6b' },
  DOCUMENTS_RECEIVED:   { label: 'Docs Received',        bg: '#fdf7ed', text: '#7a5000', border: '#f0cd7a', dot: '#e0a020' },
  DOCUMENTS_FORWARDED:  { label: 'Docs Forwarded',       bg: '#edf5fb', text: '#2d6495', border: '#a0c4dd', dot: '#2d6495' },
  COMPLETED:            { label: 'Completed',             bg: '#eaf6f0', text: '#1a5c38', border: '#96d6b4', dot: '#1a5c38' },
  CANCELLED:            { label: 'Cancelled',             bg: '#f7f3f0', text: '#6b4a3a', border: '#d4b8a8', dot: '#9a7060' },
}

export function ShipmentStatusBadge({
  status, dot = true, className,
}: { status: ShipmentStatus; dot?: boolean; className?: string }) {
  const cfg = STATUS_CFG[status]
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border', className)}
      style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />}
      {cfg.label}
    </span>
  )
}

// ─── Document tracking indicator ────────────────────────────────
interface DocTrackingPillProps {
  received:  boolean
  forwarded: boolean
  className?: string
}

export function DocTrackingPill({ received, forwarded, className }: DocTrackingPillProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <span className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
        received
          ? 'bg-[#eaf6f0] text-[#1a5c38] border border-[#96d6b4]'
          : 'bg-[#f0f4f7] text-[#7a8fa3] border border-[#b5cede]'
      )}>
        {received
          ? <CheckCircle size={9} strokeWidth={2.5} />
          : <Circle     size={9} strokeWidth={2}   />
        }
        Rcv
      </span>
      <span className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium',
        forwarded
          ? 'bg-[#e8f3fb] text-[#123d6b] border border-[#93c4e5]'
          : 'bg-[#f0f4f7] text-[#7a8fa3] border border-[#b5cede]'
      )}>
        {forwarded
          ? <CheckCircle size={9} strokeWidth={2.5} />
          : <Circle     size={9} strokeWidth={2}   />
        }
        Fwd
      </span>
    </div>
  )
}
