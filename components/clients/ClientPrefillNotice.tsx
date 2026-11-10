// FILE: components/clients/ClientPrefillNotice.tsx
import { Info } from 'lucide-react'
import type { ClientPrefillState } from '@/hooks/useClientPrefill'

export function ClientPrefillNotice({ state }: { state: ClientPrefillState }) {
  if (state.status === 'none') return null
  const text =
    state.status === 'loading'   ? 'Looking up the selected client…'
    : state.status === 'matched' ? `Existing client “${state.name}” selected from Client Management.`
    : 'The client selected in Client Management could not be found among the clients available to you, so no client was selected. Pick one manually.'
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#e8f4fd] border border-[#93c4e5] text-xs text-[#123d6b]">
      <Info size={13} className="flex-shrink-0" />
      <span className="flex-1">{text}</span>
    </div>
  )
}
