import { cn } from '@/lib/utils'
import { CSSProperties } from 'react'

interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  style?: CSSProperties
}

export function Skeleton({ className, width, height, style }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      style={{ width, height, ...style }}
    />
  )
}

// ─── Page-level loading skeleton ─────────────────────────────────
export function LoadingSkeleton() {
  return (
    <div className="page-container">
      {/* Page header skeleton */}
      <div className="page-header">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>

      {/* Filter bar skeleton */}
      <div className="data-table-wrapper mb-4">
        <div className="flex items-center gap-3 p-3 border-b border-[#e2e5e9] bg-[#f8f9fa]">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Table skeleton */}
        <table className="data-table">
          <thead>
            <tr>
              {[180, 140, 120, 100, 120, 80].map((w, i) => (
                <th key={i}>
                  <Skeleton className="h-3" style={{ width: w - 20 }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, rowIdx) => (
              <tr key={rowIdx}>
                {[180, 140, 120, 100, 120, 80].map((w, colIdx) => (
                  <td key={colIdx}>
                    <Skeleton
                      className="h-3"
                      style={{ width: w - 20 - (rowIdx * 7) % 30 }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
