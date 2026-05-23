'use client'

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { useForm }          from 'react-hook-form'
import { zodResolver }      from '@hookform/resolvers/zod'
import { Save, Send, X }   from 'lucide-react'
import { createQSSchema, type CreateQSFormData } from '@/lib/validations/qs'
import { Button }           from '@/components/ui/Button'
import { PageHeader }       from '@/components/layout/PageHeader'
import {
  PolicySection,
  InsuredSection,
  VesselSection,
  InsuranceSection,
  PremiumSection,
  NotesSection,
} from '@/components/qs/QSFormSections'
import { QSAttachmentUpload } from '@/components/qs/QSAttachmentUpload'
import type { QSDocument }  from '@/types/qs'

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
  qs: QSDocument
}

export function QSEditClient({ qs }: QSEditClientProps) {
  const router = useRouter()
  const [isSaving,     setSaving]     = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [activeSection, setActive]    = useState('policy')

  const form = useForm<CreateQSFormData>({
    resolver: zodResolver(createQSSchema),
    defaultValues: {
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
    },
  })

  const { handleSubmit, formState: { errors } } = form
  const errorCount = Object.keys(errors).length

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      router.push(`/dashboard/qs/${qs.id}`)
    } finally { setSaving(false) }
  }

  const onSubmit = async (_data: CreateQSFormData) => {
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      router.push(`/dashboard/qs/${qs.id}`)
    } finally { setSubmitting(false) }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

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
              className={`w-full text-left px-2 py-1.5 rounded text-[12px] font-medium transition-colors duration-100 ${
                activeSection === s.id
                  ? 'text-[#123d6b] bg-[#e8f3fb]'
                  : 'text-[#3a5068] hover:text-[#18273a] hover:bg-[#edf1f5]'
              }`}
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
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push(`/dashboard/qs/${qs.id}`)}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Save size={13} />} loading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="primary" size="sm" icon={<Send size={13} />} loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Save & Submit
          </Button>
        </div>
      </div>
    </div>
  )
}
