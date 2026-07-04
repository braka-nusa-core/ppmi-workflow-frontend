'use client'

import { useEffect }          from 'react'
import { useRouter }          from 'next/navigation'
import { useForm }            from 'react-hook-form'
import { zodResolver }        from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Send, X }     from 'lucide-react'
import { createQSSchema, type CreateQSFormData } from '@/lib/validations/qs'
import { fetchQSDetail, updateQS } from '@/lib/api/qs'
import { Button }             from '@/components/ui/Button'
import { PageHeader }         from '@/components/layout/PageHeader'
import {
  PolicySection,
  InsuredSection,
  VesselSection,
  InsuranceSection,
  PremiumSection,
  NotesSection,
} from '@/components/qs/QSFormSections'
import { QSAttachmentUpload } from '@/components/qs/QSAttachmentUpload'
import { LoadingSkeleton }    from '@/components/feedback/LoadingSkeleton'
import { ErrorState }         from '@/components/feedback/ErrorState'
import { useToast }           from '@/context/ToastContext'
import { cn } from '@/lib/utils'

const SECTIONS = [
  { id: 'policy',    label: 'Policy Information'  },
  { id: 'insured',   label: 'Insured Information' },
  { id: 'vessel',    label: 'Vessel Information'  },
  { id: 'insurance', label: 'Insurance Info'      },
  { id: 'premium',   label: 'Premium'             },
  { id: 'documents', label: 'Documents'           },
  { id: 'notes',     label: 'Notes'               },
]

interface QSEditClientProps {
  id: string
}

export function QSEditClient({ id }: QSEditClientProps) {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const { success, error: toastError } = useToast()

  // ── Fetch existing QS data ─────────────────────────────────────
  const { data: qs, isLoading, isError, refetch } = useQuery({
    queryKey: ['qs-detail', id],
    queryFn:  () => fetchQSDetail(id),
  })

  const form = useForm<CreateQSFormData>({
    resolver: zodResolver(createQSSchema),
    defaultValues: {
      type:          'NEW',
      division:      'PI',
      currency:      'IDR',
      premiumAmount: 0,
    },
  })

  const { handleSubmit, reset, formState: { errors } } = form
  const errorCount = Object.keys(errors).length

  // Populate form once QS data arrives
  useEffect(() => {
    if (!qs) return
    reset({
      type:           qs.type,
      division:       qs.division,
      effectiveDate:  qs.effectiveDate?.slice(0, 10) ?? '',
      expiryDate:     qs.expiryDate?.slice(0, 10)   ?? '',
      broker:         qs.broker          ?? '',
      insuredName:    qs.insuredName,
      insuredAddress: qs.insuredAddress  ?? '',
      insuredContact: qs.insuredContact  ?? '',
      vesselName:     qs.vesselName,
      vesselFlag:     qs.vesselFlag      ?? '',
      vesselType:     qs.vesselType      ?? '',
      vesselGRT:      qs.vesselGRT,
      vesselBuiltYear:qs.vesselBuiltYear,
      imoNumber:      qs.imoNumber       ?? '',
      insuranceType:  qs.insuranceType,
      coverageDetail: qs.coverageDetail  ?? '',
      deductible:     qs.deductible,
      currency:       qs.currency,
      premiumAmount:  qs.premiumAmount,
      exchangeRate:   qs.exchangeRate,
      internalNotes:  qs.internalNotes   ?? '',
    })
  }, [qs, reset])

  // ── Shared mutation ────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: async ({ data, status }: { data: CreateQSFormData; status?: 'SUBMITTED' }) => {
      // Pass divisionId (UUID) from the fetched QS if division changed;
      // updateQS adapter only includes it in the PATCH body when provided.
      return updateQS(id, { ...data, ...(status ? { status } : {}) }, qs?.divisionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qs-list'] })
      queryClient.invalidateQueries({ queryKey: ['qs-detail', id] })
      success('QS Updated', `${qs?.docNumber} has been updated successfully.`)
      router.push(`/dashboard/qs/${id}`)
    },
    onError: () => {
      toastError('Update failed', 'Could not save changes. Please check your inputs and try again.')
    },
  })

  const handleSave = (data: CreateQSFormData) => {
    updateMutation.mutate({ data })
  }

  const handleSaveAndSubmit = (data: CreateQSFormData) => {
    updateMutation.mutate({ data, status: 'SUBMITTED' })
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Loading / Error states ─────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page-container">
        <LoadingSkeleton />
      </div>
    )
  }

  if (isError || !qs) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="Failed to load quotation sheet"
          description="The QS document could not be loaded for editing."
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // ── Edit guard — only DRAFT or REJECTED can be edited ─────────
  if (qs.status !== 'DRAFT' && qs.status !== 'REJECTED') {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <ErrorState
          message="This QS cannot be edited"
          description={`QS with status "${qs.status}" is not editable. Only Draft or Rejected QS documents can be modified.`}
        />
      </div>
    )
  }

  const isSaving     = updateMutation.isPending && !updateMutation.variables?.status
  const isSubmitting = updateMutation.isPending && !!updateMutation.variables?.status

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit ${qs.docNumber}`}
          description="Update quotation sheet information"
          breadcrumbs={[
            { label: 'QS', href: '/dashboard/qs' },
            { label: qs.docNumber, href: `/dashboard/qs/${qs.id}` },
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
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
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
          <form onSubmit={handleSubmit(handleSave)} noValidate>
            <div className="flex flex-col gap-0 divide-y divide-[#f0f4f7]">
              <div id="policy"    className="pb-8"><PolicySection    form={form} /></div>
              <div id="insured"   className="py-8"><InsuredSection   form={form} /></div>
              <div id="vessel"    className="py-8"><VesselSection    form={form} /></div>
              <div id="insurance" className="py-8"><InsuranceSection form={form} /></div>
              <div id="premium"   className="py-8"><PremiumSection   form={form} /></div>
              <div id="documents" className="py-8">
                <div className="mb-4 pb-3 border-b border-[#edf1f5]">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">Attachments</h4>
                  <p className="text-[11px] text-[#7a8fa3] mt-0.5">Upload new files or manage existing attachments.</p>
                </div>
                <QSAttachmentUpload />
              </div>
              <div id="notes" className="py-8"><NotesSection form={form} /></div>
            </div>
            <div className="h-20" />
          </form>
        </div>
      </div>

      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #d5e3ef',
          boxShadow: '0 -4px 16px rgba(7,25,52,0.06)',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={13} />}
          onClick={() => router.push(`/dashboard/qs/${qs.id}`)}
        >
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Save size={13} />}
            loading={isSaving}
            onClick={handleSubmit(handleSave)}
          >
            Save Changes
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Send size={13} />}
            loading={isSubmitting}
            onClick={handleSubmit(handleSaveAndSubmit)}
          >
            Save & Submit
          </Button>
        </div>
      </div>
    </div>
  )
}