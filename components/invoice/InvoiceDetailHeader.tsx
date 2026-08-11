'use client'

import { ArrowLeft, Pencil, Download, Send, XCircle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn }        from '@/lib/utils'
import { Button }    from '@/components/ui/Button'
import { InvoiceStatusBadge, PaymentStatusBadge } from './InvoiceStatusBadge'
import { DivisionBadge } from '@/components/ui/Badge'
import { LinkedWorkflowNavigator } from '@/components/workflow/LinkedWorkflowNavigator'
import type { InvoiceDocument } from '@/types/invoice'

interface InvoiceDetailHeaderProps {
  invoice:        InvoiceDocument
  canEdit:        boolean
  onMarkSent?:    () => void
  onIssue?:       () => void
  onDownload?:    () => void
  onCancel?:      () => void
}

export function InvoiceDetailHeader({
  invoice,
  canEdit,
  onMarkSent,
  onIssue,
  onDownload,
  onCancel,
}: InvoiceDetailHeaderProps) {
  const router = useRouter()

  const showIssue   = canEdit   && invoice.status === 'DRAFT'
  const showSent    = canEdit   && invoice.status === 'ISSUED'
  const showEdit    = canEdit   && invoice.status === 'DRAFT'
  const showCancel  = canEdit   && invoice.status === 'DRAFT'

  // Build linked workflow nodes: Voucher Invoice (predecessor, always
  // present — Invoice now originates from it) → this Invoice.
  const workflowLinks = [
    {
      stage:    'VOUCHER_INVOICE' as const,
      docNumber: invoice.voucherInvoiceNumber,
      href:     `/dashboard/voucher/${invoice.voucherInvoiceId}`,
      isActive: false,
      isDone:   true,
    },
    {
      stage:    'INVOICE' as const,
      docNumber: invoice.docNumber,
      href:     `/dashboard/invoice/${invoice.id}`,
      isActive: true,
      isDone:   invoice.status === 'PAID',
    },
  ]

  return (
    <div
      className="sticky top-[56px] z-30 bg-white"
      style={{ borderBottom: '1px solid #d5e3ef', boxShadow: '0 1px 4px rgba(7,25,52,0.06)' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between px-7 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/invoice')}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
              'text-[#7a8fa3] hover:text-[#18273a] hover:bg-[#f0f4f7]',
              'transition-colors duration-100'
            )}
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">
              {invoice.docNumber}
            </h1>
            <InvoiceStatusBadge  status={invoice.status} />
            <PaymentStatusBadge  status={invoice.paymentStatus} />
            <DivisionBadge       division={invoice.division} />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {showCancel && (
            <Button
              variant="ghost"
              size="sm"
              icon={<XCircle size={12} />}
              onClick={onCancel}
              className="text-[#7a8fa3]"
            >
              Cancel
            </Button>
          )}
          {showEdit && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Pencil size={12} />}
              onClick={() => router.push(`/dashboard/invoice/${invoice.id}/edit`)}
            >
              Edit
            </Button>
          )}
          {showIssue && (
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircle size={12} />}
              onClick={onIssue}
            >
              Issue Invoice
            </Button>
          )}
          {showSent && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Send size={12} />}
              onClick={onMarkSent}
              className="text-[#123d6b]"
            >
              Mark as Sent
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={12} />}
            onClick={onDownload}
          >
            Download PDF
          </Button>
        </div>
      </div>

      {/* Linked workflow strip */}
      <LinkedWorkflowNavigator links={workflowLinks} />
    </div>
  )
}