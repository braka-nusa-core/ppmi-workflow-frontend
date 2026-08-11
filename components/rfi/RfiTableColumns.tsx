'use client'

import { ClipboardList } from 'lucide-react'
import { formatDateShort } from '@/lib/format'
import type { ColumnDef } from '@/components/table/DataTable'
import type { RfiListItem } from '@/types/rfi'
import { TableActions } from '@/components/table/TableActions'
import { RfiStatusBadge } from './RfiStatusBadge'

interface RfiTableActionsConfig {
  onView:  (row: RfiListItem) => void
  onEdit:  (row: RfiListItem) => void
  canEdit: boolean
}

export function buildRfiColumns(a: RfiTableActionsConfig): ColumnDef<RfiListItem>[] {
  return [
    {
      key: 'id', header: 'RFI No.', width: 200, sticky: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <ClipboardList size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.id}
          </span>
        </div>
      ),
    },
    {
      key: 'policyNumber', header: 'Policy Ref.', width: 160,
      render: (row) => (
        <a
          href={`/dashboard/policy/${row.policyId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.policyNumber ?? row.policyId}
        </a>
      ),
    },
    {
      key: 'insured', header: 'Insured', minWidth: 160, sortable: true,
      render: (row) => (
        <span className="text-[13px] font-medium text-[#18273a]">{row.insured ?? '—'}</span>
      ),
    },
    {
      key: 'status', header: 'Status', width: 150,
      render: (row) => <RfiStatusBadge status={row.status} />,
    },
    {
      key: 'submittedAt', header: 'Submitted', width: 110, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">
          {row.submittedAt ? formatDateShort(row.submittedAt) : '—'}
        </span>
      ),
    },
    {
      key: 'createdAt', header: 'Created', width: 96, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions', header: '', width: 60, sticky: 'right', className: 'bg-white',
      render: (row) => (
        <TableActions
          onView={() => a.onView(row)}
          onEdit={a.canEdit && row.status === 'DRAFT' ? () => a.onEdit(row) : undefined}
        />
      ),
    },
  ]
}