'use client'

import { useEffect }               from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm }                  from 'react-hook-form'
import { zodResolver }              from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save, Send, X, Receipt } from 'lucide-react'
import { createVoucherSchema, type CreateVoucherFormData } from '@/lib/validations/voucher'
import { createVoucher }            from '@/lib/api/voucher'
import type { BackendVoucherStatus } from '@/types/backend/voucher'
import { fetchInvoiceDetail }       from '@/lib/api/invoice'
import { Button }                   from '@/components/ui/Button'
import { PageHeader }               from '@/components/layout/PageHeader'
import { QSAttachmentUpload }       from '@/components/qs/QSAttachmentUpload'
import {
  VoucherInfoSection,
  VoucherPaymentSection,
  VoucherBankSection,
  VoucherApprovalSection,
  VoucherNotesSection,
} from './VoucherFormSections'
import { useToast }  from '@/context/ToastContext'
import { cn }        from '@/lib/utils'

const SECTIONS = [
  { id: 'voucher',   label: 'Voucher Info'  },
  { id: 'payment',   label: 'Payment Info'  },
  { id: 'bank',      label: 'Bank Info'     },
  { id: 'approval',  label: 'Approval'      },
  { id: 'documents', label: 'Documents'     },
  { id: 'notes',     label: 'Notes'         },
]

export function VoucherCreateClient() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const queryClient  = useQueryClient()
  const { success, error: toastError } = useToast()

  const invoiceIdParam = searchParams.get('invoiceId') ?? ''
  const [activeSection, setActive] = [
    'voucher',
    (s: string) => { document.getElementById(s)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  ]

  // ── Fetch linked invoice (when navigated from Invoice detail) ─
  const { data: invoice } = useQuery({
    queryKey: ['invoice-detail', invoiceIdParam],
    queryFn:  () => fetchInvoiceDetail(invoiceIdParam),
    enabled:  !!invoiceIdParam,
  })

  const form = useForm<CreateVoucherFormData>({
    resolver: zodResolver(createVoucherSchema),
    defaultValues: {
      invoiceId:    invoiceIdParam,
      division:     'PI',
      currency:     'IDR',
      amount:       0,
      bankName:     '',
      accountNumber:'',
      accountName:  '',
    },
  })

  const { handleSubmit, formState: { errors }, setValue, getValues } = form
  const errorCount = Object.keys(errors).length

  // Pre-fill form from invoice once loaded
  useEffect(() => {
    if (!invoice) return
    setValue('division', invoice.division)
    setValue('currency', invoice.currency)
    setValue('amount',   invoice.totalAmount)
    if (invoice.bankInfo?.bankName)      setValue('bankName',      invoice.bankInfo.bankName)
    if (invoice.bankInfo?.accountNumber) setValue('accountNumber', invoice.bankInfo.accountNumber)
    if (invoice.bankInfo?.accountName)   setValue('accountName',   invoice.bankInfo.accountName)
  }, [invoice, setValue])

  // ── Create mutation ───────────────────────────────────────────
  // status is passed explicitly so the adapter can set it correctly:
  //   Save Draft → 'DRAFT', Submit → 'PENDING'
  const createMutation = useMutation({
    mutationFn: ({ data, status }: { data: CreateVoucherFormData; status: BackendVoucherStatus }) =>
      createVoucher(data, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      success('Voucher Created', `${res.data.docNumber} has been saved successfully.`)
      router.push('/dashboard/voucher')
    },
    onError: () => {
      toastError('Save failed', 'Could not save the voucher. Please check your inputs and try again.')
    },
  })

  // Save as Draft — light validation only
  const handleSaveDraft = () => {
    const data = getValues()
    if (!data.invoiceId || !data.voucherNumber || !data.bankName || !data.accountNumber || !data.amount) {
      toastError('Required fields missing', 'Please fill in Invoice, Voucher Number, Bank Name, Account Number, and Amount before saving.')
      return
    }
    createMutation.mutate({ data: { ...data, paymentType: data.paymentType ?? 'BANK_TRANSFER' }, status: 'DRAFT' })
  }

  // Full submit — runs Zod validation first
  const onSubmit = (data: CreateVoucherFormData) => {
    createMutation.mutate({ data, status: 'PENDING' })
  }

  const scrollTo = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const isSaving     = createMutation.isPending
  const isSubmitting = createMutation.isPending

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title="New Voucher"
          description={invoice ? `Creating voucher from ${invoice.docNumber}` : 'Create a new payment voucher'}
          breadcrumbs={[
            { label: 'Voucher', href: '/dashboard/voucher' },
            { label: 'New Voucher' },
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

        {/* Form */}
        <div className="flex-1 overflow-y-auto page-container pt-6">

          {/* Invoice pre-fill banner */}
          {invoice && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-lg mb-6" style={{ background: '#e8f3fb', border: '1px solid #93c4e5' }}>
              <Receipt size={14} className="text-[#123d6b] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-semibold text-[#123d6b]">Auto-filled from {invoice.docNumber}</p>
                <p className="text-[11px] text-[#2d6495] mt-0.5">
                  Division, currency, amount, and bank details have been pre-filled from the linked invoice. Review before submitting.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-0 divide-y divide-[#f0f4f7]">
              <div id="voucher"   className="pb-8">
                <VoucherInfoSection
                  form={form}
                  linkedInvoiceNumber={invoice?.docNumber}
                  linkedQSNumber={invoice?.qsNumber}
                />
              </div>
              <div id="payment"   className="py-8"><VoucherPaymentSection  form={form} /></div>
              <div id="bank"      className="py-8"><VoucherBankSection     form={form} /></div>
              <div id="approval"  className="py-8"><VoucherApprovalSection form={form} /></div>
              <div id="documents" className="py-8">
                <div className="mb-4 pb-3 border-b border-[#edf1f5]">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">Attachments</h4>
                  <p className="text-[11px] text-[#7a8fa3] mt-0.5">Attach voucher form, bank confirmation, or supporting finance documents</p>
                </div>
                <QSAttachmentUpload />
              </div>
              <div id="notes" className="py-8"><VoucherNotesSection form={form} /></div>
            </div>
            <div className="h-20" />
          </form>
        </div>
      </div>

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', borderTop: '1px solid #d5e3ef', boxShadow: '0 -4px 16px rgba(7,25,52,0.06)' }}
      >
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={() => router.push('/dashboard/voucher')}>
          Cancel
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<Save size={13} />} loading={isSaving} onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button variant="primary" size="sm" icon={<Send size={13} />} loading={isSubmitting} onClick={handleSubmit(onSubmit)}>
            Submit Voucher
          </Button>
        </div>
      </div>
    </div>
  )
}