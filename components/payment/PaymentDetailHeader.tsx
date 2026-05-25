'use client'

import { ArrowLeft, CreditCard, CheckCircle, Flag, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn }        from '@/lib/utils'
import { Button }    from '@/components/ui/Button'
import { PaymentStatusBadge, VerificationStatusBadge } from './PaymentStatusBadge'
import { DivisionBadge }            from '@/components/ui/Badge'
import { LinkedWorkflowNavigator }  from '@/components/workflow/LinkedWorkflowNavigator'
import type { PaymentDocument }     from '@/types/payment'

interface PaymentDetailHeaderProps {
  pay:          PaymentDocument
  canUpdatePayment: boolean
  canVerify:    boolean
  canCreate:    boolean
  onRecord?:    () => void
  onVerify?:    () => void
  onFlag?:      () => void
  onShipment?:  () => void
}

export function PaymentDetailHeader({
  pay,
  canUpdatePayment,
  canVerify,
  canCreate,
  onRecord,
  onVerify,
  onFlag,
  onShipment,
}: PaymentDetailHeaderProps) {
  const router = useRouter()

  const showRecord   = canUpdatePayment && pay.paymentStatus !== 'PAID'
  const showVerify   = canVerify        && pay.verificationStatus !== 'VERIFIED'
  const showFlag     = canVerify        && pay.verificationStatus !== 'FLAGGED'
  const showShipment = canCreate        && pay.paymentStatus === 'PAID' && !pay.shipmentId

  const workflowLinks = [
    { stage: 'QS'      as const, docNumber: pay.qsNumber,      href: `/dashboard/qs/${pay.qsId}`,           isActive: false, isDone: true },
    { stage: 'INVOICE' as const, docNumber: pay.invoiceNumber,  href: `/dashboard/invoice/${pay.invoiceId}`,  isActive: false, isDone: true },
    { stage: 'VOUCHER' as const, docNumber: pay.voucherNumber,  href: `/dashboard/voucher/${pay.voucherId}`,  isActive: false, isDone: true },
    { stage: 'PAYMENT' as const, docNumber: pay.docNumber,      href: `/dashboard/payment/${pay.id}`,         isActive: true,  isDone: pay.paymentStatus === 'PAID' },
    ...(pay.shipmentId ? [{
      stage: 'SHIPMENT' as const,
      docNumber: pay.shipmentNumber!,
      href: `/dashboard/shipment/${pay.shipmentId}`,
      isActive: false,
      isDone: true,
    }] : []),
  ]

  return (
    <div
      className="sticky top-[56px] z-30 bg-white"
      style={{ borderBottom: '1px solid #d5e3ef', boxShadow: '0 1px 4px rgba(7,25,52,0.06)' }}
    >
      <div className="flex items-center justify-between px-7 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/payment')}
            className={cn(
              'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
              'text-[#7a8fa3] hover:text-[#18273a] hover:bg-[#f0f4f7] transition-colors duration-100'
            )}
          >
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">
              {pay.docNumber}
            </h1>
            <PaymentStatusBadge      status={pay.paymentStatus}      />
            <VerificationStatusBadge status={pay.verificationStatus} />
            <DivisionBadge           division={pay.division}         />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showFlag && (
            <Button variant="ghost" size="sm" icon={<Flag size={12} />} onClick={onFlag} className="text-[#7a8fa3]">
              Flag
            </Button>
          )}
          {showVerify && (
            <Button variant="secondary" size="sm" icon={<CheckCircle size={12} />} onClick={onVerify} className="text-[#1a5c38]">
              Verify
            </Button>
          )}
          {showRecord && (
            <Button variant="primary" size="sm" icon={<CreditCard size={12} />} onClick={onRecord}>
              Record Payment
            </Button>
          )}
          {showShipment && (
            <Button variant="primary" size="sm" icon={<Package size={12} />} onClick={onShipment}>
              Generate Shipment
            </Button>
          )}
        </div>
      </div>

      <LinkedWorkflowNavigator links={workflowLinks} />
    </div>
  )
}
