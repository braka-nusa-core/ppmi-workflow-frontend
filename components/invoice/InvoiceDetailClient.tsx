'use client'

import { useState }                from 'react'
import { useRouter }               from 'next/navigation'
import type { InvoiceDocument }    from '@/types/invoice'
import { InvoiceDetailHeader }     from './InvoiceDetailHeader'
import { InvoiceDetailSidebar }    from './InvoiceDetailSidebar'
import { InvoiceActivityTimeline } from './InvoiceActivityTimeline'
import {
  InvoiceInfoPanel,
  BillingInfoPanel,
  PaymentSummaryPanel,
  BankInfoPanel,
  LinkedQSPanel,
  InvoiceAttachmentsPanel,
  InvoiceNotesPanel,
} from './InvoiceDetailInfoPanels'
import { ConfirmModal } from '@/components/modal/BaseModal'
import { useModal }     from '@/hooks/useModal'
import { useRole }      from '@/hooks/useRole'

interface InvoiceDetailClientProps {
  invoice: InvoiceDocument
}

export function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
  const router = useRouter()
  const { canEdit, canCreate } = useRole()

  const issueModal   = useModal()
  const sentModal    = useModal()
  const voucherModal = useModal()
  const cancelModal  = useModal()

  const [isProcessing, setProcessing] = useState(false)

  const handle = <T,>(
    modal: ReturnType<typeof useModal<T>>,
    action: () => Promise<void>
  ) => {
    return async () => {
      setProcessing(true)

      try {
        await action()
        modal.close()
        router.refresh()
      } finally {
        setProcessing(false)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
      <InvoiceDetailHeader
        invoice={invoice}
        canEdit={canEdit}
        canCreate={canCreate}
        onIssue={()   => issueModal.open()}
        onMarkSent={()=> sentModal.open()}
        onVoucher={()  => voucherModal.open()}
        onCancel={()   => cancelModal.open()}
        onDownload={()  => { /* wire to downloadInvoicePDF */ }}
      />

      {/* Body */}
      <div className="flex gap-5 px-7 py-6 flex-1">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <InvoiceInfoPanel        inv={invoice} />
          <BillingInfoPanel        inv={invoice} />
          <PaymentSummaryPanel     inv={invoice} />
          <BankInfoPanel           inv={invoice} />
          <LinkedQSPanel           inv={invoice} />
          <InvoiceAttachmentsPanel inv={invoice} />
          <InvoiceNotesPanel       inv={invoice} />
          <InvoiceActivityTimeline activity={invoice.activity ?? []} />
        </div>

        {/* Sidebar */}
        <InvoiceDetailSidebar
          invoice={invoice}
          canEdit={canEdit}
          canCreate={canCreate}
          onEdit={()     => router.push(`/dashboard/invoice/${invoice.id}/edit`)}
          onIssue={()    => issueModal.open()}
          onMarkSent={() => sentModal.open()}
          onVoucher={()  => voucherModal.open()}
          onCancel={()   => cancelModal.open()}
          onDownload={() => { /* wire to downloadInvoicePDF */ }}
        />
      </div>

      {/* Modals */}
      <ConfirmModal
        open={issueModal.isOpen}
        onClose={issueModal.close}
        onConfirm={handle(issueModal, async () => {
          await new Promise((r) => setTimeout(r, 800))
        })}
        title="Issue Invoice"
        description={`Issue ${invoice.docNumber}? The status will change from Draft to Issued and the invoice will be ready to send.`}
        confirmLabel="Issue Invoice"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      <ConfirmModal
        open={sentModal.isOpen}
        onClose={sentModal.close}
        onConfirm={handle(sentModal, async () => {
          await new Promise((r) => setTimeout(r, 600))
        })}
        title="Mark as Sent"
        description={`Confirm ${invoice.docNumber} has been sent to ${invoice.insuredName}?`}
        confirmLabel="Mark as Sent"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      <ConfirmModal
        open={voucherModal.isOpen}
        onClose={voucherModal.close}
        onConfirm={handle(voucherModal, async () => {
          await new Promise((r) => setTimeout(r, 800))
          router.push(`/dashboard/voucher/new?invoiceId=${invoice.id}`)
        })}
        title="Generate Voucher"
        description={`Generate a payment voucher from ${invoice.docNumber}? This will advance the workflow to the Voucher stage.`}
        confirmLabel="Generate Voucher"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      <ConfirmModal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        onConfirm={handle(cancelModal, async () => {
          await new Promise((r) => setTimeout(r, 600))
          router.push('/dashboard/invoice')
        })}
        title="Cancel Invoice"
        description={`Cancel ${invoice.docNumber}? This action cannot be undone. The invoice will be marked as Cancelled.`}
        confirmLabel="Cancel Invoice"
        cancelLabel="Keep Invoice"
        variant="danger"
        loading={isProcessing}
      />
    </div>
  )
}
