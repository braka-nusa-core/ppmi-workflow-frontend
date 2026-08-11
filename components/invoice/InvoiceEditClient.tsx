'use client'

import { useState, useEffect }        from 'react'
import { useRouter }                   from 'next/navigation'
import { useForm }                     from 'react-hook-form'
import { zodResolver }                 from '@hookform/resolvers/zod'
import { useQuery, useQueryClient }    from '@tanstack/react-query'
import { Save, Send, X }              from 'lucide-react'
import { notFound }                    from 'next/navigation'
import { createInvoiceSchema, type CreateInvoiceFormData } from '@/lib/validations/invoice'
import { Button }                      from '@/components/ui/Button'
import { PageHeader }                  from '@/components/layout/PageHeader'
import { QSAttachmentUpload }          from '@/components/qs/QSAttachmentUpload'
import { LoadingSkeleton }             from '@/components/feedback/LoadingSkeleton'
import { ErrorState }                  from '@/components/feedback/ErrorState'
import {
  InvoiceInfoSection,
  BillingInfoSection,
  PaymentInfoSection,
  BankInfoSection,
  InvoiceNotesSection,
} from './InvoiceFormSections'
import { cn }                          from '@/lib/utils'
import { fetchInvoiceDetail, updateInvoice, issueInvoice } from '@/lib/api/invoice'

const SECTIONS = [
  { id: 'invoice',   label: 'Invoice Info'   },
  { id: 'billing',   label: 'Billing Info'   },
  { id: 'payment',   label: 'Payment Info'   },
  { id: 'bank',      label: 'Bank Info'      },
  { id: 'documents', label: 'Documents'      },
  { id: 'notes',     label: 'Notes'          },
]

export function InvoiceEditClient({ id }: { id: string }) {
  const router  = useRouter()
  const qc      = useQueryClient()

  const [isSaving,      setSaving]     = useState(false)
  const [isSubmitting,  setSubmitting] = useState(false)
  const [activeSection, setActive]     = useState('invoice')
  const [apiError,      setApiError]   = useState<string | null>(null)
  const [isPopulated,   setPopulated]  = useState(false)

  const form = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
  })

  const { handleSubmit, formState: { errors }, reset } = form
  const errorCount = Object.keys(errors).length

  // ── Fetch existing invoice ──────────────────────────────────────
  const { data: invoice, isLoading, isError, refetch } = useQuery({
    queryKey: ['invoice-detail', id],
    queryFn:  () => fetchInvoiceDetail(id),
  })

  // ── Guard: only DRAFT can be edited ──────────────────────────────
  // Redirect to detail if status is not editable
  useEffect(() => {
    if (!invoice) return
    if (invoice.status !== 'DRAFT') {
      notFound()
    }
  }, [invoice])

  // ── Populate form once data loads ───────────────────────────────
  useEffect(() => {
    if (!invoice || isPopulated) return
    reset({
      voucherInvoiceId: invoice.voucherInvoiceId ?? '',
      division:       invoice.division,
      insuredName:    invoice.insuredName,
      vesselName:     invoice.vesselName     ?? '',
      billingAddress: invoice.billingAddress ?? '',
      billingContact: invoice.billingContact ?? '',
      currency:       invoice.currency,
      subtotal:       invoice.subtotal,
      issueDate:      invoice.issueDate?.slice(0, 10) ?? '',
      dueDate:        invoice.dueDate?.slice(0, 10)   ?? '',
      internalNotes:  invoice.internalNotes  ?? '',
    })
    setPopulated(true)
  }, [invoice, isPopulated, reset])

  // ── Shared invalidation ─────────────────────────────────────────
  const invalidate = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['invoice-detail', id] }),
      qc.invalidateQueries({ queryKey: ['invoice-list'] }),
    ])
  }

  // ── Save changes (PATCH, keep existing status) ──────────────────
  const handleSave = async () => {
    setSaving(true)
    setApiError(null)
    try {
      const values = form.getValues()
      await updateInvoice(id, {          // PATCH /invoices/:id
        insuredName:   values.insuredName,
        currency:      values.currency,
        issueDate:     values.issueDate,
        dueDate:       values.dueDate,
        subtotal:      values.subtotal,
        internalNotes: values.internalNotes,
      })
      await invalidate()
      router.push(`/dashboard/invoice/${id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save changes. Please try again.'
      setApiError(msg)
    } finally { setSaving(false) }
  }

  // ── Save & Issue (PATCH fields + transition to ISSUED) ──────────
  const onSubmit = async (data: CreateInvoiceFormData) => {
    setSubmitting(true)
    setApiError(null)
    try {
      // First patch the latest field values, then transition to ISSUED
      await updateInvoice(id, {
        insuredName:   data.insuredName,
        currency:      data.currency,
        issueDate:     data.issueDate,
        dueDate:       data.dueDate,
        subtotal:      data.subtotal,
        internalNotes: data.internalNotes,
      })
      await issueInvoice(id)             // PATCH /invoices/:id { status: 'ISSUED' }
      await invalidate()
      router.push(`/dashboard/invoice/${id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to issue invoice. Please try again.'
      setApiError(msg)
    } finally { setSubmitting(false) }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActive(id)
  }

  // ── Loading / error states ──────────────────────────────────────
  if (isLoading) return <div className="flex items-center justify-center h-64"><LoadingSkeleton /></div>

  if (isError || !invoice) {
    return (
      <ErrorState
        message="Failed to load invoice"
        description="An error occurred while loading this invoice for editing."
        onRetry={() => refetch()}
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit ${invoice.docNumber}`}
          description="Update invoice information"
          breadcrumbs={[
            { label: 'Invoice', href: '/dashboard/invoice' },
            { label: invoice.docNumber, href: `/dashboard/invoice/${invoice.id}` },
            { label: 'Edit' },
          ]}
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-0">
        {/* Section nav */}
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

          {/* API error banner */}
          {apiError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6"
              style={{ background: '#fdecea', border: '1px solid #f0a0a0' }}>
              <p className="text-[12px] font-semibold text-[#8c1f1f]">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-0 divide-y divide-[#f0f4f7]">
              <div id="invoice"   className="pb-8">
                <InvoiceInfoSection form={form} linkedVoucherNumber={invoice.voucherInvoiceNumber} />
              </div>
              <div id="billing"   className="py-8"><BillingInfoSection  form={form} /></div>
              <div id="payment"   className="py-8"><PaymentInfoSection  form={form} /></div>
              <div id="bank"      className="py-8"><BankInfoSection     form={form} /></div>
              <div id="documents" className="py-8">
                <div className="mb-4 pb-3 border-b border-[#edf1f5]">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">Attachments</h4>
                  <p className="text-[11px] text-[#7a8fa3] mt-0.5">Manage existing attachments or upload new files.</p>
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
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #d5e3ef',
          boxShadow: '0 -4px 16px rgba(7,25,52,0.06)',
        }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />}
          onClick={() => router.push(`/dashboard/invoice/${invoice.id}`)}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Save size={13} />}
            loading={isSaving} onClick={handleSave}>
            Save Changes
          </Button>
          <Button variant="primary" size="sm" icon={<Send size={13} />}
            loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Save & Issue
          </Button>
        </div>
      </div>
    </div>
  )
}