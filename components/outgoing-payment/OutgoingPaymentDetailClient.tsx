'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpCircle, ArrowLeft } from 'lucide-react'
import { fetchOutgoingPaymentDetail } from '@/lib/api/outgoingPayment'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/layout/PageHeader'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ErrorState } from '@/components/feedback/ErrorState'
import { OutgoingPaymentStatusBadge } from './OutgoingPaymentStatusBadge'
import { OutgoingPaymentActivityTimeline } from './OutgoingPaymentActivityTimeline'
import { formatCurrency, formatDate } from '@/lib/format'
import { ROUTES } from '@/config/routes'

interface OutgoingPaymentDetailClientProps {
  id: string
}

export function OutgoingPaymentDetailClient({ id }: OutgoingPaymentDetailClientProps) {
  const router = useRouter()

  const { data: payment, isLoading, isError, refetch } = useQuery({
    queryKey: ['outgoing-payment-detail', id],
    queryFn:  () => fetchOutgoingPaymentDetail(id),
  })

  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !payment) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load outgoing payment"
          description="The payment record could not be loaded."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  return (
    <div className="page-container">
      <PageHeader
        title={payment.docNumber}
        description="Outgoing payment to insurance company"
        breadcrumbs={[
          { label: 'Outgoing Payment', href: ROUTES.outgoingPayment.list },
          { label: payment.docNumber },
        ]}
        actions={
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={() => router.push(ROUTES.outgoingPayment.list)}>
            Back
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#fdf2e8]">
          <ArrowUpCircle size={16} className="text-[#7a3800]" strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">{payment.docNumber}</h1>
          <p className="text-[12px] text-[#7a8fa3]">Invoice: {payment.invoiceNumber}</p>
        </div>
        <OutgoingPaymentStatusBadge status={payment.status} className="ml-auto" />
      </div>

      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="card">
          <div className="card-header">
            <h3 className="text-[13px] font-semibold text-[#18273a]">Payment Information</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Insurance Company</p>
              <p className="text-[13px] text-[#18273a]">{payment.insuranceCompanyName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Insured</p>
              <p className="text-[13px] text-[#18273a]">{payment.insuredName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Amount</p>
              <p className="text-[13px] font-mono font-semibold text-[#18273a]">{formatCurrency(payment.amount, 'IDR')}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Payment Date</p>
              <p className="text-[13px] text-[#18273a]">{formatDate(payment.paymentDate)}</p>
            </div>
            {payment.bankReference && (
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Bank Reference</p>
                <p className="text-[13px] text-[#18273a] font-mono">{payment.bankReference}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-[#9aa3ad]">Linked Invoice</p>
              <a href={`/dashboard/invoice/${payment.invoiceId}`} className="text-[13px] text-[#123d6b] font-mono hover:underline">
                {payment.invoiceNumber}
              </a>
            </div>
          </div>
        </div>

        <OutgoingPaymentActivityTimeline activity={[]} />
      </div>
    </div>
  )
}
