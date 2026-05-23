'use client'

import { ArrowLeft, Pencil, CreditCard, CheckCircle, XCircle, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn }        from '@/lib/utils'
import { Button }    from '@/components/ui/Button'
import { VoucherStatusBadge, ApprovalStatusBadge } from './VoucherStatusBadge'
import { DivisionBadge }   from '@/components/ui/Badge'
import { LinkedWorkflowNavigator } from '@/components/workflow/LinkedWorkflowNavigator'
import type { VoucherDocument }    from '@/types/voucher'

interface VoucherDetailHeaderProps {
  vch:          VoucherDocument
  canEdit:      boolean
  canVerify:    boolean
  canCreate:    boolean
  onApprove?:   () => void
  onReject?:    () => void
  onPayment?:   () => void
  onDownload?:  () => void
  onCancel?:    () => void
}

export function VoucherDetailHeader({
  vch,
  canEdit,
  canVerify,
  canCreate,
  onApprove,
  onReject,
  onPayment,
  onDownload,
  onCancel,
}: VoucherDetailHeaderProps) {
  const router = useRouter()

  const showApprove  = canVerify && vch.approvalStatus === 'WAITING' && vch.status === 'PENDING_APPROVAL'
  const showReject   = canVerify && vch.approvalStatus === 'WAITING' && vch.status === 'PENDING_APPROVAL'
  const showPayment  = canCreate && vch.status === 'APPROVED'        && !vch.paymentId
  const showEdit     = canEdit   && (vch.status === 'DRAFT' || vch.status === 'PENDING_APPROVAL')
  const showCancel   = canEdit   && (vch.status === 'DRAFT' || vch.status === 'PENDING_APPROVAL')

  // Build linked workflow nodes
  const workflowLinks = [
    { stage: 'QS'      as const, docNumber: vch.qsNumber,      href: `/dashboard/qs/${vch.qsId}`,           isActive: false, isDone: true },
    { stage: 'INVOICE' as const, docNumber: vch.invoiceNumber,  href: `/dashboard/invoice/${vch.invoiceId}`,  isActive: false, isDone: true },
    { stage: 'VOUCHER' as const, docNumber: vch.docNumber,      href: `/dashboard/voucher/${vch.id}`,         isActive: true,  isDone: vch.status === 'PROCESSED' },
    ...(vch.paymentId ? [{ stage: 'PAYMENT' as const, docNumber: vch.paymentNumber!, href: `/dashboard/payment/${vch.paymentId}`, isActive: false, isDone: true }] : []),
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
            onClick={() => router.push('/dashboard/voucher')}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
              'text-[#7a8fa3] hover:text-[#18273a] hover:bg-[#f0f4f7] transition-colors duration-100'
            )}
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">
              {vch.docNumber}
            </h1>
            <VoucherStatusBadge  status={vch.status} />
            <ApprovalStatusBadge status={vch.approvalStatus} />
            <DivisionBadge       division={vch.division} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showCancel && (
            <Button variant="ghost" size="sm" icon={<XCircle size={12} />} onClick={onCancel} className="text-[#7a8fa3]">
              Cancel
            </Button>
          )}
          {showEdit && (
            <Button variant="secondary" size="sm" icon={<Pencil size={12} />} onClick={() => router.push(`/dashboard/voucher/${vch.id}/edit`)}>
              Edit
            </Button>
          )}
          {showReject && (
            <Button variant="secondary" size="sm" icon={<XCircle size={12} />} onClick={onReject} className="text-[#8c1f1f]">
              Reject
            </Button>
          )}
          {showApprove && (
            <Button variant="primary" size="sm" icon={<CheckCircle size={12} />} onClick={onApprove}>
              Approve
            </Button>
          )}
          {showPayment && (
            <Button variant="primary" size="sm" icon={<CreditCard size={12} />} onClick={onPayment}>
              Generate Payment
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={<Download size={12} />} onClick={onDownload}>
            Download PDF
          </Button>
        </div>
      </div>

      {/* Linked workflow strip */}
      <LinkedWorkflowNavigator links={workflowLinks} />
    </div>
  )
}
