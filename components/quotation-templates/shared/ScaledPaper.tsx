// FILE: components/quotation-templates/shared/ScaledPaper.tsx
// Fits a fixed-width paper (A4 ≈ 794 px) into whatever width is available by
// scaling it down, instead of letting it stretch the page or hide content.
// Below `minScale` the wrapper scrolls horizontally so nothing is ever cut.

'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export function ScaledPaper({ naturalWidth = 794, minScale = 0.45, children }: { naturalWidth?: number; minScale?: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [height, setHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const measure = () => {
      const w = outer.current?.clientWidth ?? naturalWidth
      const s = Math.max(minScale, Math.min(1, w / naturalWidth))
      setScale(s)
      setHeight(inner.current ? inner.current.offsetHeight * s : undefined)
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (outer.current) ro.observe(outer.current)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [naturalWidth, minScale])

  return (
    <div ref={outer} className="w-full min-w-0 overflow-x-auto">
      <div style={{ width: naturalWidth * scale, height, margin: '0 auto' }}>
        <div ref={inner} style={{ width: naturalWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
      </div>
    </div>
  )
}