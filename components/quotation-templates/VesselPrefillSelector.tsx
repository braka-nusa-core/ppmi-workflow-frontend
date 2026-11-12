// FILE: components/quotation-templates/VesselPrefillSelector.tsx
// Vessel candidate selector UI for existing client auto-fill.
// Shows vessels from client's policies with status badges.
// User multi-selects vessels → appends to editor form.

'use client'

import { CheckCircle2, AlertCircle } from 'lucide-react'
import type { VesselCandidate } from '@/hooks/useVesselPrefill'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface Props {
  candidates: VesselCandidate[]
  loading: boolean
  error: string | null
  selected: Set<string>
  addedVesselIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onAppend: () => void
}

const statusColor = (isActive: boolean): string =>
  isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'

export function VesselPrefillSelector({
  candidates,
  loading,
  error,
  selected,
  addedVesselIds,
  onSelectionChange,
  onAppend,
}: Props) {
  if (error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="card-body flex items-center gap-2 text-sm text-red-700">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-body flex items-center justify-center gap-2 py-6">
          <Spinner size="sm" />
          <span className="text-sm text-gray-600">Loading vessel candidates…</span>
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="card bg-gray-50">
        <div className="card-body text-sm text-gray-600">
          <p>No related vessels found for this client.</p>
        </div>
      </div>
    )
  }

  const toggle = (id: string) => {
    if (addedVesselIds.has(id)) return // Cannot select already-added vessels
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Available vessels ({candidates.length})</h3>
          <p className="text-xs text-gray-500 mt-0.5">Select vessels to add to the quotation</p>
        </div>
      </div>
      <div className="card-body space-y-2">
        {candidates.map((c) => {
          const isAdded = addedVesselIds.has(c.vessel.id)
          const isSelected = selected.has(c.vessel.id)
          
          return (
            <button
              key={c.vessel.id}
              type="button"
              onClick={() => toggle(c.vessel.id)}
              disabled={isAdded}
              className={`flex items-start gap-3 p-3 rounded border text-left transition-colors ${
                isAdded
                  ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                  : isSelected
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0 pt-0.5">
                {isAdded ? (
                  <CheckCircle2 size={18} className="text-gray-400" />
                ) : isSelected ? (
                  <CheckCircle2 size={18} className="text-blue-600" />
                ) : (
                  <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800">{c.vessel.name}</div>
                <div className="text-xs text-gray-500 space-y-1 mt-1">
                  {c.vessel.vesselType && <div>Type: {c.vessel.vesselType}</div>}
                  {c.vessel.builtYear && <div>Built: {c.vessel.builtYear}</div>}
                  {c.vessel.grossTonnage && <div>GT: {c.vessel.grossTonnage}</div>}
                  {c.policy.policyNumber && <div>Policy: {c.policy.policyNumber}</div>}
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col gap-1.5 items-end">
                {isAdded && (
                  <Badge variant="completed" className="text-[10px] px-1.5 py-0.5">
                    Added
                  </Badge>
                )}
                <div className={`text-xs font-medium px-2 py-1 rounded border ${statusColor(c.isLikelyActive)}`}>
                  {c.statusLabel}
                </div>
              </div>
            </button>
          )
        })}
      </div>
      {selected.size > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 rounded-b flex items-center justify-between">
          <span className="text-xs text-gray-600">{selected.size} vessel{selected.size !== 1 ? 's' : ''} selected</span>
          <Button type="button" size="sm" onClick={onAppend} className="bg-blue-600 hover:bg-blue-700 text-white">
            Add to quotation
          </Button>
        </div>
      )}
    </div>
  )
}
