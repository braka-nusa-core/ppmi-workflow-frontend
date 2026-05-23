'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Division } from '@/types/workflow'
import { LS_DIVISION_KEY, DIVISIONS } from '@/config/constants'

// ─── Context Shape ───────────────────────────────────────────────
interface DivisionContextValue {
  activeDivision: Division
  setDivision:    (division: Division) => void
  divisionLabel:  string
}

const DivisionContext = createContext<DivisionContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────
export function DivisionProvider({ children }: { children: ReactNode }) {
  const [activeDivision, setActiveDivision] = useState<Division>('PI')

  // Restore persisted division on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(LS_DIVISION_KEY) as Division | null
    if (stored && (stored === 'PI' || stored === 'HM')) {
      setActiveDivision(stored)
    }
  }, [])

  const setDivision = useCallback((division: Division) => {
    setActiveDivision(division)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LS_DIVISION_KEY, division)
    }
  }, [])

  const value: DivisionContextValue = {
    activeDivision,
    setDivision,
    divisionLabel: DIVISIONS[activeDivision].label,
  }

  return (
    <DivisionContext.Provider value={value}>
      {children}
    </DivisionContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────
export function useDivision(): DivisionContextValue {
  const ctx = useContext(DivisionContext)
  if (!ctx) throw new Error('useDivision must be used within DivisionProvider')
  return ctx
}
