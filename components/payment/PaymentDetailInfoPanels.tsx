import {
  Receipt,
  Wallet,
  FileText,
  StickyNote,
  ExternalLink,
} from 'lucide-react'
import Link            from 'next/link'
import { cn }          from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import type { PaymentDocument } from '@/types/payment'

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

// ─── Payment Information ─────────────────────────────────────────
export function PaymentInfoPanel({ pay }: { pay: PaymentDocument }) {
  return (
    <DetailSection icon={Receipt} title="Payment Information" id="payment-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Payment Number" value={pay.docNumber} mono />
        <FieldRow label="Insured" value={pay.insuredName} />
        {pay.vesselName && <FieldRow label="Vessel" value={pay.vesselName} />}
        <FieldRow label="Currency" value={pay.currency} />
        <FieldRow label="Due Date" value={pay.dueDate ? formatDate(pay.dueDate) : undefined} />
        {pay.paidDate && <FieldRow label="Last Paid Date" value={formatDate(pay.paidDate)} />}
      </dl>
    </DetailSection>
  )
}

// ─── Payment Summary ──────────────────────────────────────────────
export function PaymentSummaryPanel({ pay }: { pay: PaymentDocument }) {
  return (
    <DetailSection icon={Wallet} title="Payment Summary" id="payment-summary">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Total Amount" value={formatCurrency(pay.totalAmount, pay.currency)} mono emphasis="strong" />
        <FieldRow label="Paid Amount" value={formatCurrency(pay.paidAmount, pay.currency)} mono emphasis="positive" />
        <FieldRow
          label="Remaining Amount"
          value={formatCurrency(pay.remainingAmount, pay.currency)}
          mono
          emphasis={pay.remainingAmount > 0 ? 'danger' : 'muted'}
        />
        {pay.lastPaymentMethod && <FieldRow label="Last Payment Method" value={pay.lastPaymentMethod} />}
        {pay.lastReferenceNumber && <FieldRow label="Last Reference No." value={pay.lastReferenceNumber} mono />}
      </dl>
    </DetailSection>
  )
}

// ─── Linked Documents Panel ────────────────────────────────────────
// Invoice is the primary/always-present origin (Phase 7). Voucher/QS
// are optional upstream display context — only rendered when both id
// and number are actually present on the response.
export function PaymentLinkedDocsPanel({ pay }: { pay: PaymentDocument }) {
  const links = [
    { label: 'Invoice', number: pay.invoiceNumber, href: `/dashboard/invoice/${pay.invoiceId}`, icon: Receipt,  color: 'bg-[#e8f3fb]', iconColor: 'text-[#123d6b]' },
    ...(pay.voucherId && pay.voucherNumber ? [{ label: 'Voucher Invoice', number: pay.voucherNumber, href: `/dashboard/voucher/${pay.voucherId}`, icon: Wallet,   color: 'bg-[#edf5fb]', iconColor: 'text-[#2d6495]' }] : []),
    ...(pay.qsId && pay.qsNumber ? [{ label: 'QS', number: pay.qsNumber, href: `/dashboard/qs/${pay.qsId}`, icon: FileText, color: 'bg-[#f0f4f7]', iconColor: 'text-[#3a5068]' }] : []),
  ]

  return (
    <DetailSection icon={ExternalLink} title="Linked Documents" id="linked-docs">
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
          >
            <div className={cn('flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0', link.color)}>
              <link.icon size={15} className={link.iconColor} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[#7a8fa3]">{link.label}</p>
              <p className="text-[13px] font-semibold text-[#18273a] font-mono">{link.number}</p>
            </div>
            <ExternalLink size={13} className="text-[#7a8fa3] group-hover:text-[#123d6b] transition-colors" />
          </Link>
        ))}
      </div>
    </DetailSection>
  )
}

// ─── Notes Panel ───────────────────────────────────────────────────
export function PaymentNotesPanel({ pay }: { pay: PaymentDocument }) {
  if (!pay.internalNotes) return null
  return (
    <DetailSection icon={StickyNote} title="Notes" id="notes">
      <p className="text-[13px] text-[#3a5068] leading-relaxed whitespace-pre-wrap">{pay.internalNotes}</p>
    </DetailSection>
  )
}
