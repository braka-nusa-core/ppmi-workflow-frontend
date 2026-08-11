'use client'

import { useState }               from 'react'
import { useRouter }              from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { InvoiceDetailHeader }    from './InvoiceDetailHeader'
import { InvoiceDetailSidebar }   from './InvoiceDetailSidebar'
import { InvoiceActivityTimeline } from './InvoiceActivityTimeline'
import {
  InvoiceInfoPanel,
  BillingInfoPanel,
  PaymentSummaryPanel,
  BankInfoPanel,
  LinkedVoucherPanel,
  AutoFillTechnicalInfoPanel,
  InvoiceAttachmentsPanel,
  InvoiceNotesPanel,
} from './InvoiceDetailInfoPanels'
import { ConfirmModal }           from '@/components/modal/BaseModal'
import { LoadingSkeleton }        from '@/components/feedback/LoadingSkeleton'
import { ErrorState }             from '@/components/feedback/ErrorState'
import { useModal }               from '@/hooks/useModal'
import { useRole }                from '@/hooks/useRole'
import {
  fetchInvoiceDetail,
  issueInvoice,
  deleteInvoice,
} from '@/lib/api/invoice'

interface InvoiceDetailClientProps { id: string }

export function InvoiceDetailClient({ id }: InvoiceDetailClientProps) {
  const router      = useRouter()
  const qc          = useQueryClient()
  const { canEdit } = useRole()

  const issueModal   = useModal<unknown>()
  const sentModal    = useModal<unknown>()
  const cancelModal  = useModal<unknown>()

  const [isProcessing, setProcessing] = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────
  const { data: invoice, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoice-detail', id],
    queryFn:  () => fetchInvoiceDetail(id),
  })

  // ── Shared invalidation helper ─────────────────────────────────
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['invoice-detail', id] }),
      qc.invalidateQueries({ queryKey: ['invoice-list'] }),
    ])
  }

  // ── Generic modal action runner ────────────────────────────────
  const run = (
    modal: ReturnType<typeof useModal<unknown>>,
    action: () => Promise<void>
  ) => async () => {
    setProcessing(true)
    try {
      await action()
      modal.close()
    } finally {
      setProcessing(false)
    }
  }

  // ── Loading / error states ─────────────────────────────────────
  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSkeleton /></div>

  if (isError || !invoice) {
    return (
      <ErrorState
        message="Failed to load invoice"
        description="An error occurred while loading this invoice. Please try again."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
      <InvoiceDetailHeader
        invoice={invoice}
        canEdit={canEdit}
        onIssue={()    => issueModal.open()}
        onMarkSent={() => sentModal.open()}
        onCancel={()   => cancelModal.open()}
        onDownload={()  => { /* no backend endpoint for PDF — intentionally non-functional */ }}
      />

      {/* Body */}
      <div className="flex gap-5 px-7 py-6 flex-1">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <InvoiceInfoPanel        inv={invoice} />
          <AutoFillTechnicalInfoPanel inv={invoice} />
          <BillingInfoPanel        inv={invoice} />
          <PaymentSummaryPanel     inv={invoice} />
          <BankInfoPanel           inv={invoice} />
          <LinkedVoucherPanel      inv={invoice} />
          <InvoiceAttachmentsPanel inv={invoice} />
          <InvoiceNotesPanel       inv={invoice} />
          <InvoiceActivityTimeline activity={invoice.activity ?? []} />
        </div>

        <InvoiceDetailSidebar
          invoice={invoice}
          canEdit={canEdit}
          onEdit={()     => router.push(`/dashboard/invoice/${invoice.id}/edit`)}
          onIssue={()    => issueModal.open()}
          onMarkSent={() => sentModal.open()}
          onCancel={()   => cancelModal.open()}
          onDownload={()  => { /* no backend endpoint for PDF — intentionally non-functional */ }}
        />
      </div>

      {/* ── Issue Invoice (DRAFT → ISSUED) ───────────────────── */}
      <ConfirmModal
        open={issueModal.isOpen}
        onClose={issueModal.close}
        onConfirm={run(issueModal, async () => {
          await issueInvoice(invoice.id)   // PATCH /invoices/:id { status: 'ISSUED' }
          await invalidate()
          router.refresh()
        })}
        title="Issue Invoice"
        description={`Issue ${invoice.docNumber}? The status will change from Draft to Issued.`}
        confirmLabel="Issue Invoice"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      {/* ── Mark as Sent ──────────────────────────────────────── */}
      {/*
        No backend endpoint exists for "mark as sent" — the backend has no
        SENT status in InvoiceStatus. This modal is intentionally preserved
        for UI continuity but its confirm handler is a no-op. The button
        visibility guard (status === 'ISSUED') means it will only show
        when relevant; the action itself does nothing until a backend
        endpoint is added.
      */}
      <ConfirmModal
        open={sentModal.isOpen}
        onClose={sentModal.close}
        onConfirm={run(sentModal, async () => {
          // INTENTIONALLY NON-FUNCTIONAL — no backend endpoint for SENT status.
          // Close the modal only; no mutation, no refetch.
        })}
        title="Mark as Sent"
        description={`Confirm ${invoice.docNumber} has been sent to ${invoice.insuredName}? (Note: this action has no backend effect yet.)`}
        confirmLabel="Mark as Sent"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      {/* ── Cancel / Delete Invoice ────────────────────────────── */}
      {/*
        Backend has no CANCELLED status. "Cancel" maps to soft-delete
        (DELETE /invoices/:id) which sets is_deleted = true.
        The invoice is removed from active lists after this action.
      */}
      <ConfirmModal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        onConfirm={run(cancelModal, async () => {
          await deleteInvoice(invoice.id)   // DELETE /invoices/:id (soft delete)
          await qc.invalidateQueries({ queryKey: ['invoice-list'] })
          router.push('/dashboard/invoice')
        })}
        title="Cancel Invoice"
        description={`Cancel ${invoice.docNumber}? This will remove it from the active invoice list.`}
        confirmLabel="Cancel Invoice"
        cancelLabel="Keep Invoice"
        variant="danger"
        loading={isProcessing}
      />
    </div>
  )
}