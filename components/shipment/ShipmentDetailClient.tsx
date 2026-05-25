'use client'

import { useState }              from 'react'
import { useRouter }             from 'next/navigation'
import { ArrowLeft, Package, CheckCircle, Inbox, Send, XCircle, User, Clock } from 'lucide-react'
import { cn }                    from '@/lib/utils'
import { formatDateTime, formatDate } from '@/lib/format'
import type { ShipmentDocument } from '@/types/shipment'
import { ShipmentStatusBadge, DocTrackingPill } from './ShipmentStatusBadge'
import { DivisionBadge }         from '@/components/ui/Badge'
import { LinkedWorkflowNavigator } from '@/components/workflow/LinkedWorkflowNavigator'
import { Button }                from '@/components/ui/Button'
import { ConfirmModal, BaseModal, ModalHeader, ModalBody, ModalFooter } from '@/components/modal/BaseModal'
import { FormField }             from '@/components/form/FormField'
import { Input }                 from '@/components/ui/Input'
import {
  ShipmentInfoPanel,
  ShippingDetailsPanel,
  DocumentTrackingPanel,
  ShipmentLinkedDocsPanel,
  ShipmentNotesPanel,
} from './ShipmentDetailInfoPanels'
import { ShipmentActivityTimeline } from './ShipmentActivityTimeline'
import { useModal }              from '@/hooks/useModal'
import { useRole }               from '@/hooks/useRole'

interface ShipmentDetailClientProps {
  shp: ShipmentDocument
}

export function ShipmentDetailClient({ shp }: ShipmentDetailClientProps) {
  const router   = useRouter()
  const { canEdit } = useRole()

  const rcvModal      = useModal()
  const fwdModal      = useModal()
  const completeModal = useModal()
  const cancelModal   = useModal()

  const [isProcessing,  setProcessing]  = useState(false)
  const [rcvDate,       setRcvDate]     = useState(new Date().toISOString().slice(0, 10))
  const [rcvBy,         setRcvBy]       = useState('')
  const [fwdDate,       setFwdDate]     = useState(new Date().toISOString().slice(0, 10))
  const [fwdTo,         setFwdTo]       = useState('')
  const [fwdBy,         setFwdBy]       = useState('')

  const handle = (action: () => Promise<void>, close: () => void) => async () => {
    setProcessing(true)
    try { await action(); close(); router.refresh() }
    finally { setProcessing(false) }
  }

  const showReceive  = canEdit && !shp.documentsReceived
  const showForward  = canEdit && shp.documentsReceived && !shp.documentsForwarded
  const showComplete = canEdit && shp.documentsForwarded && shp.status !== 'COMPLETED'
  const showEdit     = canEdit && shp.status !== 'COMPLETED' && shp.status !== 'CANCELLED'

  const workflowLinks = [
    { stage: 'QS'      as const, docNumber: shp.qsNumber,      href: `/dashboard/qs/${shp.qsId}`,           isActive: false, isDone: true },
    { stage: 'INVOICE' as const, docNumber: shp.invoiceNumber,  href: `/dashboard/invoice/${shp.invoiceId}`,  isActive: false, isDone: true },
    { stage: 'VOUCHER' as const, docNumber: shp.voucherNumber,  href: `/dashboard/voucher/${shp.voucherId}`,  isActive: false, isDone: true },
    { stage: 'PAYMENT' as const, docNumber: shp.paymentNumber,  href: `/dashboard/payment/${shp.paymentId}`,  isActive: false, isDone: true },
    { stage: 'SHIPMENT'as const, docNumber: shp.docNumber,      href: `/dashboard/shipment/${shp.id}`,        isActive: true,  isDone: shp.status === 'COMPLETED' },
  ]

  return (
    <div className="flex flex-col min-h-full">

      {/* Sticky header */}
      <div
        className="sticky top-[56px] z-30 bg-white"
        style={{ borderBottom: '1px solid #d5e3ef', boxShadow: '0 1px 4px rgba(7,25,52,0.06)' }}
      >
        <div className="flex items-center justify-between px-7 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/shipment')}
              className={cn(
                'flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0',
                'text-[#7a8fa3] hover:text-[#18273a] hover:bg-[#f0f4f7] transition-colors duration-100'
              )}
            >
              <ArrowLeft size={15} />
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[17px] font-semibold text-[#18273a] tracking-tight font-mono">
                {shp.docNumber}
              </h1>
              <ShipmentStatusBadge status={shp.status} />
              <DivisionBadge division={shp.division} />
              <DocTrackingPill received={shp.documentsReceived} forwarded={shp.documentsForwarded} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showEdit && (
              <Button variant="secondary" size="sm" onClick={() => router.push(`/dashboard/shipment/${shp.id}/edit`)}>
                Edit
              </Button>
            )}
            {showReceive && (
              <Button variant="secondary" size="sm" icon={<Inbox size={12} />} onClick={() => rcvModal.open()} className="text-[#7a5000]">
                Mark Docs Received
              </Button>
            )}
            {showForward && (
              <Button variant="secondary" size="sm" icon={<Send size={12} />} onClick={() => fwdModal.open()} className="text-[#123d6b]">
                Mark Docs Forwarded
              </Button>
            )}
            {showComplete && (
              <Button variant="primary" size="sm" icon={<CheckCircle size={12} />} onClick={() => completeModal.open()}>
                Complete Shipment
              </Button>
            )}
          </div>
        </div>
        <LinkedWorkflowNavigator links={workflowLinks} />
      </div>

      {/* Body */}
      <div className="flex gap-5 px-7 py-6 flex-1">

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <ShipmentInfoPanel       shp={shp} />
          <ShippingDetailsPanel    shp={shp} />
          <DocumentTrackingPanel   shp={shp} />
          <ShipmentLinkedDocsPanel shp={shp} />
          <ShipmentNotesPanel      shp={shp} />
          <ShipmentActivityTimeline activity={shp.activity ?? []} />
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col gap-4 w-[264px] flex-shrink-0">
          {/* Status */}
          <div className="card card-body flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Status</p>
            <ShipmentStatusBadge status={shp.status} />
            <DivisionBadge division={shp.division} />
          </div>

          {/* Document progress */}
          <div className="card card-body">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-3">Document Progress</p>
            <div className="flex flex-col gap-3">
              {[
                {
                  label: 'Docs Received',
                  done:  shp.documentsReceived,
                  date:  shp.documentsReceivedDate,
                  actor: shp.documentsReceivedBy,
                },
                {
                  label: 'Docs Forwarded',
                  done:  shp.documentsForwarded,
                  date:  shp.documentsForwardedDate,
                  actor: shp.documentsForwardedBy,
                },
                { label: 'Completed', done: shp.status === 'COMPLETED' },
              ].map((step) => (
                <div key={step.label} className="flex items-start gap-2">
                  <div className={cn(
                    'flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 mt-0.5',
                    step.done ? 'bg-[#eaf6f0]' : 'bg-[#f0f4f7]'
                  )}>
                    <CheckCircle size={11} className={step.done ? 'text-[#1a5c38]' : 'text-[#b5cede]'} strokeWidth={2} />
                  </div>
                  <div>
                    <p className={cn('text-[12px] font-medium', step.done ? 'text-[#18273a]' : 'text-[#7a8fa3]')}>
                      {step.label}
                    </p>
                    {step.done && step.date && (
                      <p className="text-[10px] text-[#7a8fa3]">{formatDate(step.date)}</p>
                    )}
                    {step.done && step.actor && (
                      <p className="text-[10px] text-[#7a8fa3]">{step.actor}</p>
                    )}
                    {!step.done && (
                      <p className="text-[10px] text-[#b5cede] italic">Pending</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          {(showReceive || showForward || showComplete) && (
            <div className="card">
              <div className="px-4 py-3" style={{ borderBottom: '1px solid #f0f4f7' }}>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Actions</p>
              </div>
              <div className="p-3 flex flex-col gap-1.5">
                {showReceive && (
                  <Button variant="secondary" size="sm" icon={<Inbox size={12} />} className="w-full justify-start text-[#7a5000]" onClick={() => rcvModal.open()}>
                    Mark Docs Received
                  </Button>
                )}
                {showForward && (
                  <Button variant="secondary" size="sm" icon={<Send size={12} />} className="w-full justify-start text-[#123d6b]" onClick={() => fwdModal.open()}>
                    Mark Docs Forwarded
                  </Button>
                )}
                {showComplete && (
                  <Button variant="primary" size="sm" icon={<CheckCircle size={12} />} className="w-full justify-start" onClick={() => completeModal.open()}>
                    Complete Shipment
                  </Button>
                )}
                {canEdit && shp.status !== 'COMPLETED' && (
                  <Button variant="ghost" size="sm" icon={<XCircle size={12} />} className="w-full justify-start text-[#8c1f1f]" onClick={() => cancelModal.open()}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Record Info */}
          <div className="card card-body flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Record</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-2">
                <User size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-[#7a8fa3]">Created by</p>
                  <p className="text-[12px] font-medium text-[#18273a]">{shp.createdBy}</p>
                  <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(shp.createdAt)}</p>
                </div>
              </div>
              {shp.updatedBy && (
                <div className="flex items-start gap-2">
                  <Clock size={12} className="text-[#7a8fa3] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-[#7a8fa3]">Last updated</p>
                    <p className="text-[12px] font-medium text-[#18273a]">{shp.updatedBy}</p>
                    <p className="text-[10px] text-[#7a8fa3]">{formatDateTime(shp.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      <BaseModal open={rcvModal.isOpen} onClose={rcvModal.close} size="sm">
        <ModalHeader title="Mark Documents Received" description={shp.docNumber} onClose={rcvModal.close} />
        <ModalBody>
          <div className="flex flex-col gap-4">
            <FormField label="Received Date" required>
              <Input type="date" value={rcvDate} onChange={(e) => setRcvDate(e.target.value)} />
            </FormField>
            <FormField label="Received By" required>
              <Input placeholder="Staff name" value={rcvBy} onChange={(e) => setRcvBy(e.target.value)} />
            </FormField>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={rcvModal.close} disabled={isProcessing}>Cancel</Button>
          <Button
            variant="primary" loading={isProcessing}
            disabled={!rcvDate || !rcvBy.trim()}
            onClick={handle(async () => { await new Promise((r) => setTimeout(r, 700)) }, rcvModal.close)}
          >
            Confirm Received
          </Button>
        </ModalFooter>
      </BaseModal>

      <BaseModal open={fwdModal.isOpen} onClose={fwdModal.close} size="sm">
        <ModalHeader title="Mark Documents Forwarded" description={shp.docNumber} onClose={fwdModal.close} />
        <ModalBody>
          <div className="flex flex-col gap-4">
            <FormField label="Forwarded Date" required>
              <Input type="date" value={fwdDate} onChange={(e) => setFwdDate(e.target.value)} />
            </FormField>
            <FormField label="Forwarded To" required hint="Recipient name or organisation">
              <Input placeholder="e.g. PT Soechi Lines Tbk" value={fwdTo} onChange={(e) => setFwdTo(e.target.value)} />
            </FormField>
            <FormField label="Forwarded By" required>
              <Input placeholder="Staff name" value={fwdBy} onChange={(e) => setFwdBy(e.target.value)} />
            </FormField>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={fwdModal.close} disabled={isProcessing}>Cancel</Button>
          <Button
            variant="primary" loading={isProcessing}
            disabled={!fwdDate || !fwdTo.trim() || !fwdBy.trim()}
            onClick={handle(async () => { await new Promise((r) => setTimeout(r, 700)) }, fwdModal.close)}
          >
            Confirm Forwarded
          </Button>
        </ModalFooter>
      </BaseModal>

      <ConfirmModal
        open={completeModal.isOpen}
        onClose={completeModal.close}
        onConfirm={handle(async () => { await new Promise((r) => setTimeout(r, 700)) }, completeModal.close)}
        title="Complete Shipment"
        description={`Mark ${shp.docNumber} as completed? This finalises the entire QS→Invoice→Voucher→Payment→Shipment workflow for this policy.`}
        confirmLabel="Complete Shipment"
        cancelLabel="Cancel"
        variant="primary"
        loading={isProcessing}
      />

      <ConfirmModal
        open={cancelModal.isOpen}
        onClose={cancelModal.close}
        onConfirm={handle(async () => { await new Promise((r) => setTimeout(r, 600)); router.push('/dashboard/shipment') }, cancelModal.close)}
        title="Cancel Shipment"
        description={`Cancel ${shp.docNumber}? This cannot be undone.`}
        confirmLabel="Cancel Shipment"
        cancelLabel="Keep"
        variant="danger"
        loading={isProcessing}
      />
    </div>
  )
}
