'use client'

import { useState, useEffect }   from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm }               from 'react-hook-form'
import { zodResolver }           from '@hookform/resolvers/zod'
import { Save, Send, X, FileText, Info } from 'lucide-react'
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validations/invoice'
import { Button }                from '@/components/ui/Button'
import { PageHeader }            from '@/components/layout/PageHeader'
import { QSAttachmentUpload }    from '@/components/qs/QSAttachmentUpload'
import {
  InvoiceInfoSection,
  BillingInfoSection,
  PaymentInfoSection,
  BankInfoSection,
  InvoiceNotesSection,
} from './InvoiceFormSections'
import { cn } from '@/lib/utils'

// Mock QS lookup — replace with API call
const QS_LOOKUP: Record<string, {
  qsNumber:    string
  division:    'PI' | 'HM'
  insuredName: string
  vesselName:  string
  currency:    'IDR' | 'USD'
  premiumAmount: number
}> = {
  'qs-001': {
    qsNumber: 'QS-2025-0143', division: 'HM',
    insuredName: 'PT Soechi Lines Tbk', vesselName: 'MV Soechi Cilacap',
    currency: 'USD', premiumAmount: 48500,
  },
  'qs-002': {
    qsNumber: 'QS-2025-0142', division: 'PI',
    insuredName: 'PT Arpeni Pratama Ocean Line', vesselName: 'MV Artha Kencana',
    currency: 'USD', premiumAmount: 72000,
  },
}

const SECTIONS = [
  { id: 'invoice',   label: 'Invoice Info'   },
  { id: 'billing',   label: 'Billing Info'   },
  { id: 'payment',   label: 'Payment Info'   },
  { id: 'bank',      label: 'Bank Info'      },
  { id: 'documents', label: 'Documents'      },
  { id: 'notes',     label: 'Notes'          },
]

export function InvoiceCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const qsIdParam    = searchParams.get('qsId') ?? ''

  const [isSaving,     setSaving]     = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)
  const [activeSection, setActive]    = useState('invoice')
  const linkedQS = qsIdParam ? QS_LOOKUP[qsIdParam] : null

  const form = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      qsId:     qsIdParam,
      division: linkedQS?.division ?? 'PI',
      currency: linkedQS?.currency ?? 'IDR',
      subtotal: linkedQS?.premiumAmount ?? 0,
      issueDate: new Date().toISOString().slice(0, 10),
    },
  })

  const { handleSubmit, formState: { errors }, setValue } = form
  const errorCount = Object.keys(errors).length

  // Auto-fill from linked QS
  useEffect(() => {
    if (!linkedQS) return
    setValue('insuredName', linkedQS.insuredName)
    setValue('vesselName',  linkedQS.vesselName)
    setValue('division',    linkedQS.division)
    setValue('currency',    linkedQS.currency)
    setValue('subtotal',    linkedQS.premiumAmount)
  }, [linkedQS, setValue])

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      router.push('/dashboard/invoice')
    } finally { setSaving(false) }
  }

  const onSubmit = async (_data: CreateInvoiceFormData) => {
    setSubmitting(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      router.push('/dashboard/invoice')
    } finally { setSubmitting(false) }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="page-container pb-0">
        <PageHeader
          title="New Invoice"
          description={linkedQS
            ? `Creating invoice from ${linkedQS.qsNumber}`
            : 'Create a new invoice document'
          }
          breadcrumbs={[
            { label: 'Invoice', href: '/dashboard/invoice' },
            { label: 'New Invoice' },
          ]}
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-0">
        {/* Section nav */}
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
          {errorCount > 0 && (
            <div className="mt-4 px-2 py-2 rounded-md bg-[#fdecea] border border-[#f0a0a0]">
              <p className="text-[11px] font-semibold text-[#8c1f1f]">
                {errorCount} field{errorCount > 1 ? 's' : ''} need attention
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto page-container pt-6">

          {/* Auto-fill notice when created from QS */}
          {linkedQS && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6"
              style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}
            >
              <FileText size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-[#123d6b]">
                  Auto-filled from {linkedQS.qsNumber}
                </p>
                <p className="text-[11px] text-[#2d6495] mt-0.5">
                  Insured name, vessel, currency and premium amount have been pre-filled.
                  Review and adjust as needed before issuing.
                </p>
              </div>
            </div>
          )}

          {/* Invoice number preview */}
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg mb-6"
            style={{ background: '#f7f9fb', border: '1px solid #d5e3ef' }}
          >
            <Info size={13} className="text-[#7a8fa3] flex-shrink-0" />
            <p className="text-[12px] text-[#3a5068]">
              Invoice number will be auto-generated:{' '}
              <strong className="font-mono text-[#18273a]">INV-2025-0139</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-0 divide-y divide-[#f0f4f7]">
              <div id="invoice"   className="pb-8">
                <InvoiceInfoSection form={form} linkedQSNumber={linkedQS?.qsNumber} />
              </div>
              <div id="billing"   className="py-8"><BillingInfoSection   form={form} /></div>
              <div id="payment"   className="py-8"><PaymentInfoSection   form={form} /></div>
              <div id="bank"      className="py-8"><BankInfoSection      form={form} /></div>
              <div id="documents" className="py-8">
                <div className="mb-4 pb-3 border-b border-[#edf1f5]">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">Attachments</h4>
                  <p className="text-[11px] text-[#7a8fa3] mt-0.5">
                    Attach invoice PDF, policy schedule, or supporting documents
                  </p>
                </div>
                <QSAttachmentUpload />
              </div>
              <div id="notes" className="py-8"><InvoiceNotesSection form={form} /></div>
            </div>
            <div className="h-20" />
          </form>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background:     'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop:      '1px solid #d5e3ef',
          boxShadow:      '0 -4px 16px rgba(7,25,52,0.06)',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          icon={<X size={13} />}
          onClick={() => router.push('/dashboard/invoice')}
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
            Issue Invoice
          </Button>
        </div>
      </div>
    </div>
  )
}
