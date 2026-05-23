'use client'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { useForm }           from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { Save, Send, X, Info } from 'lucide-react'
import { createQSSchema, type CreateQSFormData } from '@/lib/validations/qs'
import { Button }            from '@/components/ui/Button'
import { PageHeader }        from '@/components/layout/PageHeader'
import {
  PolicySection,
  InsuredSection,
  VesselSection,
  InsuranceSection,
  PremiumSection,
  NotesSection,
} from './QSFormSections'
import { QSAttachmentUpload } from './QSAttachmentUpload'
import { cn } from '@/lib/utils'

// ─── Section nav ─────────────────────────────────────────────────
const SECTIONS = [
  { id: 'policy',    label: 'Policy Information'  },
  { id: 'insured',   label: 'Insured Information' },
  { id: 'vessel',    label: 'Vessel Information'  },
  { id: 'insurance', label: 'Insurance Info'      },
  { id: 'premium',   label: 'Premium'             },
  { id: 'documents', label: 'Documents'           },
  { id: 'notes',     label: 'Notes'               },
]

export function QSCreateClient() {
  const router = useRouter()
  const [isSaving,    setSaving]    = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [activeSection, setActiveSection] = useState('policy')

  const form = useForm<CreateQSFormData>({
    resolver: zodResolver(createQSSchema),
    defaultValues: {
      type:          'NEW',
      division:      'PI',
      currency:      'IDR',
      premiumAmount: 0,
    },
  })

  const { handleSubmit, formState: { errors } } = form
  const errorCount = Object.keys(errors).length

  // Save as draft
  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800)) // replace with API call
      router.push('/dashboard/qs')
    } finally {
      setSaving(false)
    }
  }

  // Submit for approval
  const onSubmit = async () => {
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1000)) // replace with API call
      router.push('/dashboard/qs')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="page-container pb-0">
        <PageHeader
          title="New Quotation Sheet"
          description="Create a new QS document to begin the workflow"
          breadcrumbs={[
            { label: 'QS', href: '/dashboard/qs' },
            { label: 'New QS' },
          ]}
        />
      </div>

      {/* ── Main: sidebar nav + form ─────────────────────────── */}
      <div className="flex flex-1 min-h-0 gap-0">

        {/* Left: section nav */}
        <div
          className="w-[188px] flex-shrink-0 border-r border-[#edf1f5] py-4 px-3 sticky top-[56px] h-fit"
          style={{ background: '#f7f9fb' }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-2 px-2">
            Sections
          </p>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollTo(s.id)}
              className={cn(
                'w-full text-left px-2 py-1.5 rounded text-[12px] font-medium transition-colors duration-100',
                activeSection === s.id
                  ? 'text-[#123d6b] bg-[#e8f3fb]'
                  : 'text-[#3a5068] hover:text-[#18273a] hover:bg-[#edf1f5]'
              )}
            >
              {s.label}
            </button>
          ))}

          {/* Error count */}
          {errorCount > 0 && (
            <div className="mt-4 px-2 py-2 rounded-md bg-[#fdecea] border border-[#f0a0a0]">
              <p className="text-[11px] font-semibold text-[#8c1f1f]">
                {errorCount} field{errorCount > 1 ? 's' : ''} need attention
              </p>
            </div>
          )}
        </div>

        {/* Right: form content */}
        <div className="flex-1 overflow-y-auto page-container pt-6">

          {/* QS Number preview banner */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-6"
            style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}
          >
            <Info size={14} className="text-[#123d6b] flex-shrink-0" />
            <p className="text-[12px] text-[#123d6b]">
              QS number will be auto-generated on save:{' '}
              <strong className="font-mono">QS-2025-0144</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-0 divide-y divide-[#f0f4f7]">

              <div id="policy"    className="pb-8"><PolicySection    form={form} /></div>
              <div id="insured"   className="py-8"><InsuredSection   form={form} /></div>
              <div id="vessel"    className="py-8"><VesselSection    form={form} /></div>
              <div id="insurance" className="py-8"><InsuranceSection form={form} /></div>
              <div id="premium"   className="py-8"><PremiumSection   form={form} /></div>

              {/* Documents */}
              <div id="documents" className="py-8">
                <div className="mb-4 pb-3 border-b border-[#edf1f5]">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">Attachments</h4>
                  <p className="text-[11px] text-[#7a8fa3] mt-0.5">
                    Upload supporting documents — certificates, previous policy, classification
                  </p>
                </div>
                <QSAttachmentUpload />
              </div>

              {/* Notes */}
              <div id="notes" className="py-8">
                <NotesSection form={form} />
              </div>

            </div>

            {/* Bottom spacer for sticky footer */}
            <div className="h-20" />
          </form>
        </div>
      </div>

      {/* ── Sticky Action Footer ─────────────────────────────── */}
      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background:  'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop:   '1px solid #d5e3ef',
          boxShadow:   '0 -4px 16px rgba(7,25,52,0.06)',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={13} />}
          onClick={() => router.push('/dashboard/qs')}
        >
          Cancel
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Save size={13} />}
            loading={isSaving}
            onClick={handleSaveDraft}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Send size={13} />}
            loading={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            Submit QS
          </Button>
        </div>
      </div>
    </div>
  )
}
