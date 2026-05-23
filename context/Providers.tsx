'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools }               from '@tanstack/react-query-devtools'
import { useState, type ReactNode }         from 'react'
import { AuthProvider }                     from './AuthContext'
import { DivisionProvider }                 from './DivisionContext'
import { ToastProvider }                    from './ToastContext'
import { ToastContainer }                   from '@/components/feedback/ToastContainer'
import { STALE_TIME_DEFAULT }               from '@/config/constants'

// ─── QueryClient factory — one per session ───────────────────────
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:          STALE_TIME_DEFAULT,
        refetchOnWindowFocus: false,        // Internal app — no need
        retry:              1,
        retryDelay:         1000,
      },
      mutations: {
        onError: () => {
          // Global mutation error handling can go here
          // Individual mutations can override per-instance
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always new instance
    return makeQueryClient()
  }
  // Browser: reuse singleton
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

// ─── Root Providers ──────────────────────────────────────────────
export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DivisionProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </DivisionProvider>
      </AuthProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  )
}
