'use client'

import { Shield } from 'lucide-react'
import { formatDateShort } from '@/lib/format'
import type { ColumnDef } from '@/components/table/DataTable'
import type { PolicyListItem } from '@/types/policy'
import { TableActions } from '@/components/table/TableActions'
import { PolicyStatusBadge } from './PolicyStatusBadge'

interface PolicyTableActionsConfig {
  onView:  (row: PolicyListItem) => void
  onEdit:  (row: PolicyListItem) => void
  canEdit: boolean
}

export function buildPolicyColumns(a: PolicyTableActionsConfig): ColumnDef<PolicyListItem>[] {
  return [
    {
      key: 'policyNumber', header: 'Policy No.', width: 200, sticky: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Shield size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.policyNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'quotationNumber', header: 'Quotation Ref.', width: 160,
      render: (row) => (
        <a
          href={`/dashboard/qs/${row.quotationId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.quotationNumber ?? row.quotationId}
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
      key: 'policyDate', header: 'Policy Date', width: 120, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.policyDate)}</span>
      ),
    },
    {
      key: 'totalShare', header: 'Total Share', width: 100,
      render: (row) => (
        <span className="text-[12px] font-mono text-[#3a5068]">
          {row.totalShare !== undefined ? `${row.totalShare}%` : '—'}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status', width: 168,
      render: (row) => <PolicyStatusBadge status={row.status} />,
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
          onEdit={a.canEdit ? () => a.onEdit(row) : undefined}
        />
      ),
    },
  ]
}