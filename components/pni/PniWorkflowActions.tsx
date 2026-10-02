// FILE: components/pni/PniWorkflowActions.tsx
'use client'

import { useState } from 'react'
import { Send, Check, X, RotateCcw, ShieldCheck, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { isTechnicalUnitOwner } from '@/lib/quotationEditability'
import {
  useSubmitQuotation,
  useApproveQuotation,
  useRejectQuotation,
  useRequestQuotationRevision,
  useSendQuotationToInsurance,
  useInsuranceApproveQuotation,
  useInsuranceRevisionQuotation,
} from '@/hooks/useQuotations'
import type { QuotationStatus, QuotationTechnicalUnitRef } from '@/types/quotation'
import type { ApiError } from '@/types/api'

interface Props {
  quotationId:   string
  status:        QuotationStatus
  technicalUnit: QuotationTechnicalUnitRef | null
  /** Called after any successful action, in addition to each hook's own base-quotation invalidation — used by the caller to also invalidate the P&I detail query (see PniQuotationDetailClient.tsx), since GET /pni/quotations/:id embeds its own copy of `quotation.status`. */
  onActionSuccess: () => void
}

/**
 * Renders only the action(s) valid for the CURRENT status, mirroring
 * the backend's QUOTATION_STATUS_TRANSITIONS exactly:
 * DRAFT→WAITING_APPROVAL→APPROVED→SENT_TO_INSURANCE→INSURANCE_APPROVED,
 * with REVISION looping back to WAITING_APPROVAL. INSURANCE_APPROVED
 * and POLICY_ISSUED are terminal (no actions). The backend re-enforces
 * every one of these rules independently — this only avoids showing a
 * button that would just 403/400.
 */
export function PniWorkflowActions({ quotationId, status, technicalUnit, onActionSuccess }: Props) {
  const { user, can } = useAuth()
  const { success, error: toastError } = useToast()
  const [openAction, setOpenAction] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [insuranceCompanyId, setInsuranceCompanyId] = useState('')

  const submit             = useSubmitQuotation(quotationId)
  const approve             = useApproveQuotation(quotationId)
  const reject              = useRejectQuotation(quotationId)
  const requestRevision     = useRequestQuotationRevision(quotationId)
  const sendToInsurance     = useSendQuotationToInsurance(quotationId)
  const insuranceApprove    = useInsuranceApproveQuotation(quotationId)
  const insuranceRevision   = useInsuranceRevisionQuotation(quotationId)

  const isOwnUnit = isTechnicalUnitOwner({ technicalUnit }, user)
  const isSupervisor = Boolean(user?.isSuperAdmin) || can('quotation', 'approve')

  function closePanel() {
    setOpenAction(null)
    setNote('')
    setInsuranceCompanyId('')
  }

  function run(
    key: string,
    mutation: { mutate: (payload: never, opts: { onSuccess: () => void; onError: (e: unknown) => void }) => void },
    payload: never,
    successMessage: string
  ) {
    mutation.mutate(payload, {
      onSuccess: () => {
        success(successMessage)
        onActionSuccess()
        closePanel()
      },
      onError: (err) => toastError(`Failed to ${key}`, (err as ApiError).message),
    })
  }

  const NotePanel = ({ label, onConfirm, loading }: { label: string; onConfirm: () => void; loading: boolean }) => (
    <div className="flex flex-col gap-2 pt-2 border-t border-[#edf1f5] mt-2">
      <Textarea placeholder="Optional note…" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={closePanel}>Cancel</Button>
        <Button variant="primary" size="sm" loading={loading} onClick={onConfirm}>{label}</Button>
      </div>
    </div>
  )

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={13} className="text-[#7a8fa3]" />
        <h3 className="text-[13px] font-semibold text-[#18273a]">Workflow Actions</h3>
      </div>

      {(status === 'DRAFT' || status === 'REVISION') && can('quotation', 'submit') && isOwnUnit && (
        <div>
          {openAction !== 'submit' ? (
            <Button variant="primary" size="sm" icon={<Send size={13} />} onClick={() => setOpenAction('submit')}>
              {status === 'REVISION' ? 'Resubmit for Approval' : 'Submit for Approval'}
            </Button>
          ) : (
            <NotePanel
              label="Confirm Submit"
              loading={submit.isPending}
              onConfirm={() =>
                run('submit', submit, (note ? { note } : undefined) as never, 'Quotation submitted for approval')
              }
            />
          )}
        </div>
      )}

      {status === 'WAITING_APPROVAL' && isSupervisor && (
        <div className="flex flex-col gap-2">
          {openAction === null && (
            <div className="flex gap-2">
              <Button variant="primary" size="sm" icon={<Check size={13} />} onClick={() => setOpenAction('approve')}>Approve</Button>
              <Button variant="secondary" size="sm" icon={<X size={13} />} className="text-[#9b2020] border-[#f5b4b4]" onClick={() => setOpenAction('reject')}>Reject</Button>
              <Button variant="secondary" size="sm" icon={<RotateCcw size={13} />} onClick={() => setOpenAction('revision')}>Request Revision</Button>
            </div>
          )}
          {openAction === 'approve' && (
            <NotePanel label="Confirm Approve" loading={approve.isPending} onConfirm={() => run('approve', approve, (note ? { note } : undefined) as never, 'Quotation approved')} />
          )}
          {openAction === 'reject' && (
            <NotePanel label="Confirm Reject" loading={reject.isPending} onConfirm={() => run('reject', reject, (note ? { note } : undefined) as never, 'Quotation rejected')} />
          )}
          {openAction === 'revision' && (
            <NotePanel label="Confirm Request Revision" loading={requestRevision.isPending} onConfirm={() => run('request-revision', requestRevision, (note ? { note } : undefined) as never, 'Revision requested')} />
          )}
        </div>
      )}

      {status === 'APPROVED' && can('quotation', 'send-to-insurance') && isOwnUnit && (
        <div>
          {openAction !== 'send-to-insurance' ? (
            <Button variant="primary" size="sm" icon={<Send size={13} />} onClick={() => setOpenAction('send-to-insurance')}>
              Send to Insurance
            </Button>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-[#edf1f5] mt-2">
              <Input
                placeholder="Insurance Company ID"
                value={insuranceCompanyId}
                onChange={(e) => setInsuranceCompanyId(e.target.value)}
              />
              <Textarea placeholder="Optional note…" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={closePanel}>Cancel</Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={sendToInsurance.isPending}
                  disabled={!insuranceCompanyId}
                  onClick={() =>
                    run(
                      'send to insurance',
                      sendToInsurance,
                      { insuranceCompanyId, ...(note ? { note } : {}) } as never,
                      'Quotation sent to insurance'
                    )
                  }
                >
                  Confirm Send
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {status === 'SENT_TO_INSURANCE' && can('quotation', 'record-insurer-review') && (
        <div className="flex flex-col gap-2">
          {openAction === null && (
            <div className="flex gap-2">
              <Button variant="primary" size="sm" icon={<ShieldCheck size={13} />} onClick={() => setOpenAction('insurance-approve')}>Insurance Approved</Button>
              <Button variant="secondary" size="sm" icon={<RotateCcw size={13} />} onClick={() => setOpenAction('insurance-revision')}>Needs Revision</Button>
            </div>
          )}
          {openAction === 'insurance-approve' && (
            <NotePanel label="Confirm" loading={insuranceApprove.isPending} onConfirm={() => run('insurance-approve', insuranceApprove, (note ? { note } : undefined) as never, 'Marked as insurance approved')} />
          )}
          {openAction === 'insurance-revision' && (
            <NotePanel label="Confirm" loading={insuranceRevision.isPending} onConfirm={() => run('insurance-revision', insuranceRevision, (note ? { note } : undefined) as never, 'Marked as needing revision')} />
          )}
        </div>
      )}

      {(status === 'INSURANCE_APPROVED' || status === 'POLICY_ISSUED') && (
        <p className="text-[12px] text-[#b5cede]">No further workflow actions — this quotation is finalized.</p>
      )}
    </Card>
  )
}