'use client'

import { Package, Trash2 } from 'lucide-react'
import { formatDateShort }      from '@/lib/format'
import type { ColumnDef }       from '@/components/table/DataTable'
import type { ShipmentListItem } from '@/types/shipment'
import { TableActions }         from '@/components/table/TableActions'

interface ShipmentTableActionsConfig {
  onView:   (row: ShipmentListItem) => void
  onEdit:   (row: ShipmentListItem) => void
  onDelete: (row: ShipmentListItem) => void
  canEdit:  boolean
  canDelete:boolean
}

export function buildShipmentColumns(a: ShipmentTableActionsConfig): ColumnDef<ShipmentListItem>[] {
  return [
    {
      key: 'docNumber', header: 'Shipment No.', width: 220, sticky: 'left',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Package size={13} className="text-[#7a8fa3] flex-shrink-0" strokeWidth={1.6} />
          <span className="text-[12px] font-semibold text-[#123d6b] font-mono tracking-tight">
            {row.docNumber}
          </span>
        </div>
      ),
    },
    {
      key: 'invoiceNumber', header: 'Invoice Ref.', width: 140,
      render: (row) => (
        <a
          href={`/dashboard/invoice/${row.invoiceId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.invoiceNumber}
        </a>
      ),
    },
    {
      key: 'courier', header: 'Courier', minWidth: 140, sortable: true,
      render: (row) => (
        <span className="text-[13px] font-medium text-[#18273a]">{row.courier}</span>
      ),
    },
    {
      key: 'trackingNumber', header: 'Tracking No.', width: 160, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#3a5068] font-mono">{row.trackingNumber}</span>
      ),
    },
    {
      key: 'shippingDate', header: 'Shipping Date', width: 128, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.shippingDate)}</span>
      ),
    },
    {
      key: 'createdAt', header: 'Created', width: 96, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions', header: '', width: 88, sticky: 'right', className: 'bg-white',
      render: (row) => (
        <TableActions
          onView={() => a.onView(row)}
          onEdit={a.canEdit ? () => a.onEdit(row) : undefined}
          extra={[
            {
              label: 'Delete',
              icon:  <Trash2 size={13} />,
              onClick: () => a.onDelete(row),
              hidden: !a.canDelete,
            },
          ]}
        />
      ),
    },
  ]
}