'use client'

import { useEffect }          from 'react'
import { useRouter }          from 'next/navigation'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Send, X }     from 'lucide-react'
import { createVoucherSchema, type CreateVoucherFormData } from '@/lib/validations/voucher'
import { fetchVoucherDetail, updateVoucher, submitVoucherForApproval } from '@/lib/api/voucher'
import { Button }             from '@/components/ui/Button'
import { PageHeader }         from '@/components/layout/PageHeader'
import { QSAttachmentUpload } from '@/components/qs/QSAttachmentUpload'
import {
  VoucherInfoSection,
  VoucherPaymentSection,
  VoucherBankSection,
  VoucherApprovalSection,
  VoucherNotesSection,
} from './VoucherFormSections'
import { LoadingSkeleton }    from '@/components/feedback/LoadingSkeleton'
import { ErrorState }         from '@/components/feedback/ErrorState'
import { useToast }           from '@/context/ToastContext'
import { cn }                 from '@/lib/utils'

const SECTIONS = [
  { id: 'voucher',   label: 'Voucher Info' },
  { id: 'payment',   label: 'Payment Info' },
  { id: 'bank',      label: 'Bank Info'    },
  { id: 'approval',  label: 'Approval'     },
  { id: 'documents', label: 'Documents'    },
  { id: 'notes',     label: 'Notes'        },
]

interface VoucherEditClientProps {
  id: string
}

export function VoucherEditClient({ id }: VoucherEditClientProps) {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()

  // ── Fetch existing voucher ────────────────────────────────────
  const { data: vch, isLoading, isError, refetch } = useQuery({
    queryKey: ['voucher-detail', id],
    queryFn:  () => fetchVoucherDetail(id).then((r) => r.data),
  })

  const form = useForm<CreateVoucherFormData>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      invoiceId:    '',
      division:     'PI',
      currency:     'IDR',
      amount:       0,
      bankName:     '',
      accountNumber:'',
      accountName:  '',
    },
  })

  const { handleSubmit, reset, formState: { errors } } = form
  const errorCount = Object.keys(errors).length

  // Populate form once data arrives
  useEffect(() => {
    if (!vch) return
    reset({
      invoiceId:      vch.invoiceId,
      division:       vch.division,
      paymentType:    vch.paymentType,
      currency:       vch.currency,
      amount:         vch.amount,
      bankName:       vch.bankName,
      bankBranch:     vch.bankBranch     ?? '',
      accountNumber:  vch.accountNumber,
      accountName:    vch.accountName,
      swiftCode:      vch.swiftCode      ?? '',
      processingDate: vch.processingDate?.slice(0, 10) ?? '',
      approvalPIC:    vch.approvalPIC    ?? '',
      approvalNotes:  vch.approvalNotes  ?? '',
      internalNotes:  vch.internalNotes  ?? '',
    })
  }, [vch, reset])

  // ── Save Changes mutation ─────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (data: CreateVoucherFormData) => updateVoucher(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      queryClient.invalidateQueries({ queryKey: ['voucher-detail', id] })
      success('Voucher Updated', `${vch?.docNumber} has been updated successfully.`)
      router.push(`/dashboard/voucher/${id}`)
    },
    onError: () => {
      toastError('Update failed', 'Could not save changes. Please check your inputs and try again.')
    },
  })

  // ── Save & Submit mutation (update then submit) ───────────────
  const submitMutation = useMutation({
    mutationFn: async (data: CreateVoucherFormData) => {
      await updateVoucher(id, data)
      return submitVoucherForApproval(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      queryClient.invalidateQueries({ queryKey: ['voucher-detail', id] })
      success('Voucher Submitted', `${vch?.docNumber} has been submitted for approval.`)
      router.push(`/dashboard/voucher/${id}`)
    },
    onError: () => {
      toastError('Submit failed', 'Could not submit the voucher. Please try again.')
    },
  })

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Loading ───────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────
  if (isError || !vch) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load voucher"
          description="The voucher document could not be loaded for editing."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // ── Edit guard — only DRAFT or PENDING_APPROVAL ───────────────
  if (vch.status !== 'DRAFT' && vch.status !== 'PENDING_APPROVAL') {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="This voucher cannot be edited"
          description={`Vouchers with status "${vch.status}" are not editable. Only Draft or Pending Approval vouchers can be modified.`}
        />
      </div>
    )
  }

  const isSaving     = saveMutation.isPending
  const isSubmitting = submitMutation.isPending

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit ${vch.docNumber}`}
          description="Update voucher information"
          breadcrumbs={[
            { label: 'Voucher', href: '/dashboard/voucher' },
            { label: vch.docNumber, href: `/dashboard/voucher/${vch.id}` },
            { label: 'Edit' },
          ]}
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-0">
        <div
          className="w-[188px] flex-shrink-0 border-r border-[#edf1f5] py-4 px-3 sticky top-[56px] h-fit"
          style={{ background: '#f7f9fb' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-2 px-2">Sections</p>
          {SECTIONS.map((s) => (
            <button
              key={s.id} type="button" onClick={() => scrollTo(s.id)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded text-[12px] font-medium transition-colors duration-100',
                'text-[#3a5068] hover:text-[#18273a] hover:bg-[#edf1f5]'
              )}
            >
              {s.label}
            </button>
          ))}
          {errorCount > 0 && (
            <div className="mt-4 px-2 py-2 rounded-md bg-[#fdecea] border border-[#f0a0a0]">
              <p className="text-[11px] font-semibold text-[#8c1f1f]">
                {errorCount} field{errorCount > 1 ? 's' : ''} need attention
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto page-container pt-6">
          <form onSubmit={handleSubmit((data) => saveMutation.mutate(data))} noValidate>
            <div className="flex flex-col gap-0 divide-y divide-[#f0f4f7]">
              <div id="voucher"   className="pb-8">
                <VoucherInfoSection form={form} linkedInvoiceNumber={vch.invoiceNumber} linkedQSNumber={vch.qsNumber} />
              </div>
              <div id="payment"   className="py-8"><VoucherPaymentSection  form={form} /></div>
              <div id="bank"      className="py-8"><VoucherBankSection     form={form} /></div>
              <div id="approval"  className="py-8"><VoucherApprovalSection form={form} /></div>
              <div id="documents" className="py-8">
                <div className="mb-4 pb-3 border-b border-[#edf1f5]">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">Attachments</h4>
                  <p className="text-[11px] text-[#7a8fa3] mt-0.5">Manage existing attachments or upload new files.</p>
                </div>
                <QSAttachmentUpload />
              </div>
              <div id="notes" className="py-8"><VoucherNotesSection form={form} /></div>
            </div>
            <div className="h-20" />
          </form>
        </div>
      </div>

      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #d5e3ef', boxShadow: '0 -4px 16px rgba(7,25,52,0.06)' }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(`/dashboard/voucher/${vch.id}`)}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary" size="sm" icon={<Save size={13} />}
            loading={isSaving}
            onClick={handleSubmit((data) => saveMutation.mutate(data))}
          >
            Save Changes
          </Button>
          <Button
            variant="primary" size="sm" icon={<Send size={13} />}
            loading={isSubmitting}
            onClick={handleSubmit((data) => submitMutation.mutate(data))}
          >
            Save & Submit
          </Button>
        </div>
      </div>
    </div>
  )
}