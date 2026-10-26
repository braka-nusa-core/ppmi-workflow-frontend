// FILE: components/quotation-templates/shared/useElementWidth.ts
// Width of an element (not the window), so layout reacts to the space left
// after the sidebar, not just to the viewport.

'use client'

import { useEffect, useState, type RefObject } from 'react'

export function useElementWidth(ref: RefObject<HTMLElement>): number {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return width
}