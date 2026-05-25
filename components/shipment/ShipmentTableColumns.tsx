'use client'

import { Package, CheckCircle, XCircle } from 'lucide-react'
import { formatDateShort }               from '@/lib/format'
import type { ColumnDef }                from '@/components/table/DataTable'
import type { ShipmentListItem }         from '@/types/shipment'
import { ShipmentStatusBadge, DocTrackingPill } from './ShipmentStatusBadge'
import { DivisionBadge }                 from '@/components/ui/Badge'
import { TableActions }                  from '@/components/table/TableActions'

interface ShipmentActionsConfig {
  onView:     (row: ShipmentListItem) => void
  onEdit:     (row: ShipmentListItem) => void
  onComplete: (row: ShipmentListItem) => void
  canEdit:    boolean
}

export function buildShipmentColumns(a: ShipmentActionsConfig): ColumnDef<ShipmentListItem>[] {
  return [
    {
      key: 'docNumber', header: 'Shipment No.', width: 152, sortable: true, sticky: 'left',
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
      key: 'paymentNumber', header: 'Payment Ref.', width: 136,
      render: (row) => (
        <a
          href={`/dashboard/payment/${row.id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[11px] font-medium text-[#3a5068] font-mono hover:text-[#123d6b] hover:underline transition-colors"
        >
          {row.paymentNumber}
        </a>
      ),
    },
    {
      key: 'division', header: 'Div.', width: 68,
      render: (row) => <DivisionBadge division={row.division} />,
    },
    {
      key: 'insuredName', header: 'Insured', minWidth: 168, sortable: true,
      render: (row) => (
        <div>
          <span className="text-[13px] font-medium text-[#18273a]">{row.insuredName}</span>
          {row.vesselName && (
            <p className="text-[11px] text-[#7a8fa3]">{row.vesselName}</p>
          )}
        </div>
      ),
    },
    {
      key: 'blNumber', header: 'B/L Number', width: 148,
      render: (row) => (
        <span className="text-[12px] font-mono text-[#3a5068]">
          {row.blNumber ?? '—'}
        </span>
      ),
    },
    {
      key: 'shipmentDate', header: 'Shipment Date', width: 120, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#3a5068]">
          {row.shipmentDate ? formatDateShort(row.shipmentDate) : '—'}
        </span>
      ),
    },
    {
      key: 'status', header: 'Status', width: 148,
      render: (row) => <ShipmentStatusBadge status={row.status} />,
    },
    {
      key: 'documents', header: 'Documents', width: 108,
      render: (row) => (
        <DocTrackingPill
          received={row.documentsReceived}
          forwarded={row.documentsForwarded}
        />
      ),
    },
    {
      key: 'createdAt', header: 'Created', width: 96, sortable: true,
      render: (row) => (
        <span className="text-[12px] text-[#7a8fa3]">{formatDateShort(row.createdAt)}</span>
      ),
    },
    {
      key: 'actions', header: '', width: 96, sticky: 'right', className: 'bg-white',
      render: (row) => (
        <TableActions
          onView={() => a.onView(row)}
          onEdit={a.canEdit && row.status !== 'COMPLETED' && row.status !== 'CANCELLED'
            ? () => a.onEdit(row)
            : undefined
          }
          extra={[
            {
              label:   'Mark Complete',
              icon:    <CheckCircle size={13} />,
              onClick: () => a.onComplete(row),
              hidden:  row.status === 'COMPLETED' || row.status === 'CANCELLED' || !a.canEdit,
            },
          ]}
        />
      ),
    },
  ]
}
