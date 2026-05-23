import {
  Receipt,
  Building2,
  CreditCard,
  FileText,
  Paperclip,
  StickyNote,
  ExternalLink,
  Landmark,
} from 'lucide-react'
import Link            from 'next/link'
import { cn }          from '@/lib/utils'
import { formatCurrency, formatDate, daysUntilDue } from '@/lib/format'
import type { InvoiceDocument } from '@/types/invoice'

// ─── Shared ──────────────────────────────────────────────────────
function FieldRow({
  label,
  value,
  mono,
  emphasis,
  colSpan,
}: {
  label:     string
  value:     React.ReactNode
  mono?:     boolean
  emphasis?: 'strong' | 'muted' | 'positive' | 'danger'
  colSpan?:  boolean
}) {
  const cls = {
    strong:  'text-[#18273a] font-semibold',
    muted:   'text-[#7a8fa3]',
    positive:'text-[#1a5c38] font-semibold',
    danger:  'text-[#8c1f1f] font-semibold',
    default: 'text-[#18273a]',
  }[emphasis ?? 'default']

  return (
    <div className={cn('flex flex-col gap-0.5', colSpan && 'col-span-2')}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">{label}</dt>
      <dd className={cn('text-[13px] leading-snug', cls, mono && 'font-mono tracking-tight')}>
        {value ?? <span className="text-[#b5cede]">—</span>}
      </dd>
    </div>
  )
}

function DetailSection({
  icon: Icon, title, children, id,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; id?: string
}) {
  return (
    <section id={id} className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <Icon size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">{title}</h3>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </section>
  )
}

// ─── Invoice Information ─────────────────────────────────────────
export function InvoiceInfoPanel({ inv }: { inv: InvoiceDocument }) {
  return (
    <DetailSection icon={Receipt} title="Invoice Information" id="invoice-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Invoice Number" value={inv.docNumber} mono emphasis="strong" />
        <FieldRow label="Division"       value={inv.division === 'PI' ? 'P&I (Protection & Indemnity)' : 'H&M (Hull & Machinery)'} />
        <FieldRow label="Issue Date"     value={formatDate(inv.issueDate)} />
        <FieldRow label="Due Date"       value={formatDate(inv.dueDate)} />
        {inv.sentDate && (
          <FieldRow label="Sent Date"    value={formatDate(inv.sentDate)} />
        )}
        {inv.paidDate && (
          <FieldRow label="Paid Date"    value={formatDate(inv.paidDate)} emphasis="positive" />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Billing Information ─────────────────────────────────────────
export function BillingInfoPanel({ inv }: { inv: InvoiceDocument }) {
  return (
    <DetailSection icon={Building2} title="Billing Information" id="billing-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Insured Name"    value={inv.insuredName}    emphasis="strong" colSpan />
        {inv.vesselName && (
          <FieldRow label="Vessel"        value={inv.vesselName}     />
        )}
        {inv.billingContact && (
          <FieldRow label="Contact"       value={inv.billingContact} />
        )}
        {inv.billingAddress && (
          <FieldRow label="Billing Address" value={inv.billingAddress} colSpan />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Payment Summary ─────────────────────────────────────────────
export function PaymentSummaryPanel({ inv }: { inv: InvoiceDocument }) {
  const days        = daysUntilDue(inv.dueDate)
  const isOverdue   = (days ?? 0) < 0 && inv.paymentStatus !== 'PAID'
  const paidPct     = inv.totalAmount > 0
    ? Math.min(Math.round((inv.paidAmount / inv.totalAmount) * 100), 100)
    : 0

  return (
    <DetailSection icon={CreditCard} title="Payment Summary" id="payment-summary">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[#3a5068]">
            {inv.paymentStatus === 'PAID' ? 'Fully Paid' : 'Payment Progress'}
          </span>
          <span className={cn(
            'text-[12px] font-semibold',
            inv.paymentStatus === 'PAID' ? 'text-[#1a5c38]' :
            isOverdue ? 'text-[#8c1f1f]' : 'text-[#18273a]'
          )}>
            {paidPct}%
          </span>
        </div>
        <div className="h-2 bg-[#edf1f5] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${paidPct}%`,
              background: inv.paymentStatus === 'PAID' ? '#1a5c38' :
                          isOverdue ? '#8c1f1f' : '#123d6b',
            }}
          />
        </div>
        {isOverdue && (
          <p className="text-[11px] text-[#8c1f1f] font-medium mt-1.5">
            {Math.abs(days ?? 0)} days overdue
          </p>
        )}
        {!isOverdue && days !== null && days <= 7 && inv.paymentStatus !== 'PAID' && (
          <p className="text-[11px] text-[#7a5000] font-medium mt-1.5">
            Due in {days} days
          </p>
        )}
      </div>

      {/* Amount breakdown */}
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        {inv.subtotal !== inv.totalAmount && (
          <FieldRow label="Subtotal" value={formatCurrency(inv.subtotal, inv.currency)} mono />
        )}
        {inv.taxAmount != null && inv.taxAmount > 0 && (
          <FieldRow label={`Tax (${inv.taxRate}%)`} value={formatCurrency(inv.taxAmount, inv.currency)} mono />
        )}
        {inv.discount != null && inv.discount > 0 && (
          <FieldRow label="Discount" value={`− ${formatCurrency(inv.discount, inv.currency)}`} mono />
        )}
        <FieldRow label="Invoice Total"    value={formatCurrency(inv.totalAmount, inv.currency)}    mono emphasis="strong" />
        <FieldRow label="Amount Paid"      value={formatCurrency(inv.paidAmount,  inv.currency)}    mono emphasis={inv.paidAmount > 0 ? 'positive' : 'muted'} />
        <FieldRow
          label="Remaining Balance"
          value={formatCurrency(inv.remainingAmount, inv.currency)}
          mono
          emphasis={inv.remainingAmount > 0 ? (isOverdue ? 'danger' : 'strong') : 'positive'}
        />
        {inv.paymentTerms && (
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">
              Payment Terms
            </dt>
            <dd className="text-[12px] text-[#18273a] leading-relaxed bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-2">
              {inv.paymentTerms}
            </dd>
          </div>
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Bank Information ────────────────────────────────────────────
export function BankInfoPanel({ inv }: { inv: InvoiceDocument }) {
  const bank = inv.bankInfo
  if (!bank) return null

  return (
    <DetailSection icon={Landmark} title="Bank Information" id="bank-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
        <FieldRow label="Bank Name"       value={bank.bankName}      emphasis="strong" colSpan />
        <FieldRow label="Account Number"  value={bank.accountNumber} mono />
        <FieldRow label="Account Name"    value={bank.accountName}   />
        {bank.bankBranch && <FieldRow label="Branch"     value={bank.bankBranch} />}
        {bank.swiftCode  && <FieldRow label="SWIFT Code" value={bank.swiftCode}  mono />}
      </dl>
    </DetailSection>
  )
}

// ─── Linked QS Panel ─────────────────────────────────────────────
export function LinkedQSPanel({ inv }: { inv: InvoiceDocument }) {
  return (
    <DetailSection icon={FileText} title="Linked Quotation Sheet" id="linked-qs">
      <Link
        href={`/dashboard/qs/${inv.qsId}`}
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg border border-[#d5e3ef]',
          'hover:border-[#93c4e5] hover:bg-[#f7f9fb]',
          'transition-colors duration-100 group'
        )}
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e8f3fb] flex-shrink-0">
          <FileText size={15} className="text-[#123d6b]" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#18273a] font-mono">{inv.qsNumber}</p>
          <p className="text-[11px] text-[#3a5068]">
            {inv.insuredName}
            {inv.vesselName ? ` · ${inv.vesselName}` : ''}
          </p>
        </div>
        <ExternalLink
          size={13}
          className="text-[#7a8fa3] group-hover:text-[#123d6b] transition-colors"
        />
      </Link>
    </DetailSection>
  )
}

// ─── Attachments ─────────────────────────────────────────────────
export function InvoiceAttachmentsPanel({ inv }: { inv: InvoiceDocument }) {
  const files = inv.attachments ?? []

  function fmtBytes(b: number) {
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <DetailSection icon={Paperclip} title="Attachments" id="attachments">
      {files.length === 0 ? (
        <p className="text-[12px] text-[#7a8fa3]">No documents attached</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#e8f3fb] flex-shrink-0">
                <Receipt size={12} className="text-[#123d6b]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#18273a] truncate">{f.filename}</p>
                <p className="text-[10px] text-[#7a8fa3]">
                  {fmtBytes(f.filesize)} · {f.uploadedBy} · {formatDate(f.uploadedAt)}
                </p>
              </div>
              <button className="flex items-center gap-1 text-[11px] text-[#7a8fa3] hover:text-[#123d6b] transition-colors opacity-0 group-hover:opacity-100">
                <ExternalLink size={12} /> Open
              </button>
            </div>
          ))}
        </div>
      )}
    </DetailSection>
  )
}

// ─── Notes ───────────────────────────────────────────────────────
export function InvoiceNotesPanel({ inv }: { inv: InvoiceDocument }) {
  return (
    <DetailSection icon={StickyNote} title="Internal Notes" id="notes">
      {inv.internalNotes ? (
        <p className="text-[13px] text-[#18273a] leading-relaxed whitespace-pre-wrap bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-3">
          {inv.internalNotes}
        </p>
      ) : (
        <p className="text-[12px] text-[#7a8fa3]">No internal notes</p>
      )}
    </DetailSection>
  )
}
