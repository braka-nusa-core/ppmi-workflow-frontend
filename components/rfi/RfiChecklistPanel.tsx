'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Square } from 'lucide-react'
import { useToast } from '@/context/ToastContext'
import { updateRfiChecklist } from '@/lib/api/rfi'
import type { RfiChecklistItem, RfiDocument } from '@/types/rfi'

interface RfiChecklistPanelProps {
  rfiId:     string
  checklist: RfiChecklistItem[]
  canEdit:   boolean
}

export function RfiChecklistPanel({ rfiId, checklist, canEdit }: RfiChecklistPanelProps) {
  const queryClient = useQueryClient()
  const { error: toastError } = useToast()

  // Optimistic toggle — checklist items are toggled frequently, so we
  // update the cache immediately and roll back on failure rather than
  // waiting on a round trip for each checkbox (per Migration Blueprint
  // §6.3's guidance on where optimistic updates are worth the complexity).
  const toggleMutation = useMutation({
    mutationFn: (item: RfiChecklistItem) =>
      updateRfiChecklist(rfiId, checklist, { [item.key]: !item.isCompleted }),
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ['rfi-detail', rfiId] })
      const previous = queryClient.getQueryData<RfiDocument>(['rfi-detail', rfiId])
      queryClient.setQueryData(['rfi-detail', rfiId], (old: RfiDocument | undefined) =>
        old ? {
          ...old,
          checklist: old.checklist.map((c: RfiChecklistItem) =>
            c.key === item.key ? { ...c, isCompleted: !c.isCompleted } : c
          ),
        } : old
      )
      return { previous }
    },
    onError: (_err, _item, context) => {
      if (context?.previous) queryClient.setQueryData(['rfi-detail', rfiId], context.previous)
      toastError('Update failed', 'Could not update the checklist item. Please try again.')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['rfi-detail', rfiId] })
      queryClient.invalidateQueries({ queryKey: ['rfi-history', rfiId] })
    },
  })

  const requiredIncomplete = checklist.filter((c) => c.isRequired && !c.isCompleted)

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-[13px] font-semibold text-[#18273a]">Checklist</h3>
      </div>
      <ul className="px-4 py-2">
        {checklist.map((item) => (
          <li key={item.key} className="flex items-center gap-2.5 py-2 border-b border-[#f0f4f7] last:border-0">
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => toggleMutation.mutate(item)}
              className="flex-shrink-0 disabled:cursor-not-allowed"
              aria-label={item.isCompleted ? `Mark ${item.label} incomplete` : `Mark ${item.label} complete`}
            >
              {item.isCompleted
                ? <CheckSquare size={16} className="text-[#1a6b3a]" strokeWidth={1.8} />
                : <Square size={16} className="text-[#b5cede]" strokeWidth={1.8} />}
            </button>
            <span className={item.isCompleted ? 'text-[13px] text-[#18273a]' : 'text-[13px] text-[#3a5068]'}>
              {item.label}
            </span>
            {item.isRequired && (
              <span className="text-[10px] text-[#9b2020] ml-auto">Required</span>
            )}
          </li>
        ))}
      </ul>

      {requiredIncomplete.length > 0 && (
        <div className="px-4 py-2.5 mx-4 mb-3 rounded-lg text-[11px] text-[#7a3800]" style={{ background: '#fdf2e8', border: '1px solid #f0b87a' }}>
          {requiredIncomplete.length} required item{requiredIncomplete.length > 1 ? 's' : ''} still incomplete: {requiredIncomplete.map((i) => i.label).join(', ')}
        </div>
      )}
    </div>
  )
}