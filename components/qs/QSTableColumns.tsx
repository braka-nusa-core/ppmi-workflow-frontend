'use client'

import { FileText, Receipt } from 'lucide-react'
import { formatCurrency, formatDateShort } from '@/lib/format'
import type { ColumnDef } from '@/components/table/DataTable'
import type { QSListItem } from '@/types/qs'
import { QSStatusBadge, QSTypeBadge } from './QSStatusBadge'
import { DivisionBadge } from '@/components/ui/Badge'
import { TableActions } from '@/components/table/TableActions'

interface QSTableActionsConfig {
  onView:            (row: QSListItem) => void
  onEdit:            (row: QSListItem) => void
  onGenerateInvoice: (row: QSListItem) => void
  onArchive:         (row: QSListItem) => void
  canEdit:           boolean
  canCreate:         boolean
}

export function buildQSColumns(actions: QSTableActionsConfig): ColumnDef<QSListItem>[] {
  return [
    {
      key:       'docNumber',
      header:    'QS Number',
      width:     148,
      sortable:  true,
      sticky:    'left',
      render:    (row) => (
        <div className="flex items-center gap-2">
          <FileText size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.docNumber}
          </span>
        </div>
      ),
    },
    {
      key:    'type',
      header: 'Type',
      width:  88,
      render: (row) => <QSTypeBadge type={row.type} />,
    },
    {
      key:    'division',
      header: 'Division',
      width:  80,
      render: (row) => <DivisionBadge division={row.division} />,
    },
    {
      key:      'insuredName',
      header:   'Insured',
      minWidth: 180,
      sortable: true,
      render:   (row) => (
        <span className="text-[13px] text-[#18273a] font-medium">
          {row.insuredName}
        </span>
      ),
    },
    {
      key:      'vesselName',
      header:   'Vessel',
      minWidth: 160,
      sortable: true,
      render:   (row) => (
        <span className="text-[12px] text-[#3a5068]">{row.vesselName}</span>
      ),
    },
    {
      key:    'insuranceType',
      header: 'Insurance Type',
      width:  120,
      render: (row) => (
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: '#f0f4f7', color: '#3a5068', border: '1px solid #b5cede' }}
        >
          {row.insuranceType}
        </span>
      ),
    },
    {
      key:      'premiumAmount',
      header:   'Premium',
      width:    148,
      align:    'right',
      sortable: true,
      render:   (row) => (
        <div className="text-right">
          <span className="text-[12px] font-semibold text-[#18273a] tabular-nums">
            {formatCurrency(row.premiumAmount, row.currency)}
          </span>
          {row.currency === 'USD' && (
            <span className="block text-[10px] text-[#7a8fa3]">USD</span>
          )}
        </div>
      ),
    },
    {
      key:      'status',
      header:   'Status',
      width:    108,
      render:   (row) => <QSStatusBadge status={row.status} />,
    },
    {
      key:      'createdAt',
      header:   'Created',
      width:    104,
      sortable: true,
      render:   (row) => (
        <span className="text-[12px] text-[#7a8fa3]">
          {formatDateShort(row.createdAt)}
        </span>
      ),
    },
    {
      key:      'updatedAt',
      header:   'Updated',
      width:    104,
      sortable: true,
      render:   (row) => (
        <div>
          <span className="text-[12px] text-[#7a8fa3]">
            {formatDateShort(row.updatedAt)}
          </span>
          {row.hasInvoice && (
            <div className="flex items-center gap-1 mt-0.5">
              <Receipt size={10} className="text-[#1a5c38]" />
              <span className="text-[10px] text-[#1a5c38] font-medium">
                {row.invoiceNumber}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key:       'actions',
      header:    '',
      width:     100,
      sticky:    'right',
      className: 'bg-white',
      render:    (row) => (
        <TableActions
          onView={() => actions.onView(row)}
          onEdit={actions.canEdit ? () => actions.onEdit(row) : undefined}
          extra={[
            {
              label:   'Generate Invoice',
              icon:    <Receipt size={13} />,
              onClick: () => actions.onGenerateInvoice(row),
              hidden:  row.hasInvoice || row.status !== 'APPROVED' || !actions.canCreate,
            },
            {
              label:   'Archive',
              icon:    <FileText size={13} />,
              onClick: () => actions.onArchive(row),
              hidden:  !actions.canEdit,
              danger:  false,
            },
          ]}
        />
      ),
    },
  ]
}
