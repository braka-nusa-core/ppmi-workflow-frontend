'use client'

import { useState }           from 'react'
import { useRouter }          from 'next/navigation'
import type { QSDocument }    from '@/types/qs'
import { QSDetailHeader }     from './QSDetailHeader'
import { QSDetailSidebar }    from './QSDetailSidebar'
import { QSActivityTimeline } from './QSActivityTimeline'
import {
  PolicyInfoPanel,
  VesselInfoPanel,
  InsuranceInfoPanel,
  PremiumInfoPanel,
  AttachmentsPanel,
  NotesPanel,
} from './QSDetailInfoPanels'
import { ConfirmModal }       from '@/components/modal/BaseModal'
import { useModal }           from '@/hooks/useModal'
import { useRole }            from '@/hooks/useRole'

interface QSDetailClientProps {
  qs: QSDocument
}

export function QSDetailClient({ qs }: QSDetailClientProps) {
  const router   = useRouter()
  const { canEdit, canVerify, canCreate } = useRole()

  const approveModal  = useModal()
  const revisionModal = useModal()
  const invoiceModal  = useModal()
  const archiveModal  = useModal()

  const [isApproving,  setApproving]  = useState(false)
  const [isGenerating, setGenerating] = useState(false)

  const handleApprove = async () => {
    setApproving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      approveModal.close()
      router.refresh()
    } finally {
      setApproving(false)
    }
  }

  const handleRevision = async () => {
    revisionModal.close()
    router.refresh()
  }

  const handleGenerateInvoice = async () => {
    setGenerating(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      invoiceModal.close()
      router.push(`/dashboard/invoice/new?qsId=${qs.id}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleArchive = async () => {
    archiveModal.close()
    router.push('/dashboard/qs')
  }

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky Detail Header */}
      <QSDetailHeader
        qs={qs}
        canEdit={canEdit}
        canVerify={canVerify}
        canCreate={canCreate}
        onApprove={() => approveModal.open()}
        onRevision={() => revisionModal.open()}
        onInvoice={() => invoiceModal.open()}
        onArchive={() => archiveModal.open()}
      />

      {/* Body: main content + sidebar */}
      <div className="flex gap-5 px-7 py-6 flex-1 min-h-0">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PolicyInfoPanel    qs={qs} />
          <VesselInfoPanel    qs={qs} />
          <InsuranceInfoPanel qs={qs} />
          <PremiumInfoPanel   qs={qs} />
          <AttachmentsPanel   attachments={qs.attachments} />
          <NotesPanel         notes={qs.internalNotes} />
          <QSActivityTimeline activity={qs.activity ?? []} />
        </div>

        {/* Sidebar */}
        <QSDetailSidebar
          qs={qs}
          canEdit={canEdit}
          canVerify={canVerify}
          canCreate={canCreate}
          onEdit={() => router.push(`/dashboard/qs/${qs.id}/edit`)}
          onApprove={() => approveModal.open()}
          onRevision={() => revisionModal.open()}
          onInvoice={() => invoiceModal.open()}
          onArchive={() => archiveModal.open()}
        />
      </div>

      {/* Modals */}
      <ConfirmModal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        onConfirm={handleApprove}
        title="Approve Quotation Sheet"
        description={`Approve ${qs.docNumber}? This will mark the QS as approved and allow invoice generation.`}
        confirmLabel="Approve QS"
        cancelLabel="Cancel"
        variant="primary"
        loading={isApproving}
      />

      <ConfirmModal
        open={revisionModal.isOpen}
        onClose={revisionModal.close}
        onConfirm={handleRevision}
        title="Request Revision"
        description={`Return ${qs.docNumber} to the editor for revision? The status will change to Revision.`}
        confirmLabel="Request Revision"
        cancelLabel="Cancel"
        variant="primary"
      />

      <ConfirmModal
        open={invoiceModal.isOpen}
        onClose={invoiceModal.close}
        onConfirm={handleGenerateInvoice}
        title="Generate Invoice"
        description={`Generate an invoice from ${qs.docNumber}? This will advance the workflow to the Invoice stage.`}
        confirmLabel="Generate Invoice"
        cancelLabel="Cancel"
        variant="primary"
        loading={isGenerating}
      />

      <ConfirmModal
        open={archiveModal.isOpen}
        onClose={archiveModal.close}
        onConfirm={handleArchive}
        title="Archive Quotation Sheet"
        description={`Archive ${qs.docNumber}? It will be removed from the active list but can be restored later.`}
        confirmLabel="Archive"
        cancelLabel="Cancel"
        variant="primary"
      />
    </div>
  )
}
