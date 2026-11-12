// FILE: components/layout/GlobalLoadingBar.tsx
// Global top progress bar for route navigation and async operations.
// Thin blue bar at viewport top, auto-hides when complete.

'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export function GlobalLoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Track route changes
  useEffect(() => {
    setLoading(true)
    setProgress(20)
    const timer = setTimeout(() => {
      setProgress(80)
    }, 100)
    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Complete on mount (route finished)
  useEffect(() => {
    if (loading) {
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [pathname, searchParams])

  // Track TanStack Query global state
  const fetchCount = useIsFetching()
  const mutateCount = useIsMutating()
  const queryActive = fetchCount > 0 || mutateCount > 0

  useEffect(() => {
    if (queryActive && !loading) {
      setLoading(true)
      setProgress(30)
    } else if (!queryActive && loading && progress < 100) {
      setProgress(100)
      const timer = setTimeout(() => {
        setLoading(false)
        setProgress(0)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [queryActive, loading, progress])

  if (!loading && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] bg-blue-600 transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: progress === 100 ? 0 : 1,
      }}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Loading"
    />
  )
}
