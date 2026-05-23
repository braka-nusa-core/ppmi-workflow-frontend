import { RefreshCw, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface OverviewPageHeaderProps {
  division?:   string
  lastUpdated?: Date
  onRefresh?:  () => void
}

export function OverviewPageHeader({
  division,
  lastUpdated = new Date(),
  onRefresh,
}: OverviewPageHeaderProps) {
  const today = format(new Date(), 'EEEE, d MMMM yyyy')

  return (
    <div className="page-header">
      {/* Left: Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-[20px] font-semibold text-[#18273a] leading-tight tracking-tight">
            Operational Overview
          </h1>
          {division && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
              style={{
                background: '#e8f3fb',
                color:      '#123d6b',
                border:     '1px solid #93c4e5',
              }}
            >
              {division}
            </span>
          )}
        </div>
        <p className="text-[12px] text-[#7a8fa3]">
          {today} ·{' '}
          <span className="text-[#b5cede]">
            Last updated {format(lastUpdated, 'HH:mm')}
          </span>
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium',
            'text-[#3a5068] border border-[#d5e3ef] bg-white',
            'hover:bg-[#f7f9fb] hover:border-[#b5cede]',
            'transition-colors duration-100'
          )}
        >
          <RefreshCw size={12} strokeWidth={2} />
          Refresh
        </button>

        <button
          className={cn(
            'flex items-center gap-1.5 h-8 px-3 rounded-md text-[12px] font-medium',
            'text-[#3a5068] border border-[#d5e3ef] bg-white',
            'hover:bg-[#f7f9fb] hover:border-[#b5cede]',
            'transition-colors duration-100'
          )}
        >
          <Download size={12} strokeWidth={2} />
          Export
        </button>
      </div>
    </div>
  )
}
