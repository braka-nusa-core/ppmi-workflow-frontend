import {
  CreditCard, Receipt, Wallet, FileText,
   StickyNote, ExternalLink,
} from 'lucide-react'
import Link          from 'next/link'
import { cn }        from '@/lib/utils'
import { formatCurrency, formatDate, daysUntilDue } from '@/lib/format'
import type { PaymentDocument } from '@/types/payment'
import { PaymentStatusBadge, VerificationStatusBadge, PaymentMethodBadge } from './PaymentStatusBadge'

// ─── Shared helpers ──────────────────────────────────────────────
function FieldRow({
  label, value, mono, emphasis, colSpan,
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
  const days    = daysUntilDue(pay.dueDate)
  const overdue = (days ?? 0) < 0 && pay.paymentStatus !== 'PAID'

  return (
    <DetailSection icon={CreditCard} title="Payment Information" id="payment-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Payment Number"  value={pay.docNumber} mono emphasis="strong" />
        <FieldRow label="Division"        value={pay.division === 'PI' ? 'P&I (Protection & Indemnity)' : 'H&M (Hull & Machinery)'} />
        <FieldRow label="Insured"         value={pay.insuredName} emphasis="strong" colSpan />
        {pay.vesselName && <FieldRow label="Vessel" value={pay.vesselName} />}
        <FieldRow
          label="Due Date"
          value={
            <span className={overdue ? 'text-[#8c1f1f] font-semibold' : ''}>
              {formatDate(pay.dueDate)}
              {overdue && ` (${Math.abs(days ?? 0)}d overdue)`}
            </span>
          }
        />
        {pay.paidDate && <FieldRow label="Paid Date" value={formatDate(pay.paidDate)} emphasis="positive" />}
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Payment Status</dt>
          <dd><PaymentStatusBadge status={pay.paymentStatus} /></dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Verification</dt>
          <dd><VerificationStatusBadge status={pay.verificationStatus} /></dd>
        </div>
        {pay.isInstallment && (
          <FieldRow label="Payment Type" value={`Installment (${pay.installmentCount} payments)`} />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Payment Summary Panel ───────────────────────────────────────
export function PaymentSummaryPanel({ pay }: { pay: PaymentDocument }) {
  const paidPct = pay.totalAmount > 0
    ? Math.min(Math.round((pay.paidAmount / pay.totalAmount) * 100), 100)
    : 0
  const isOverdue = pay.paymentStatus === 'OVERDUE'

  return (
    <DetailSection icon={CreditCard} title="Financial Summary" id="financial-summary">
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[#3a5068]">
            {pay.paymentStatus === 'PAID' ? 'Fully Paid' : 'Payment Progress'}
          </span>
          <span className={cn('text-[12px] font-semibold',
            pay.paymentStatus === 'PAID' ? 'text-[#1a5c38]' :
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
              background: pay.paymentStatus === 'PAID' ? '#1a5c38' :
                          isOverdue ? '#8c1f1f' : '#123d6b',
            }}
          />
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Total Amount"     value={formatCurrency(pay.totalAmount, pay.currency)}     mono emphasis="strong" />
        <FieldRow label="Paid Amount"      value={formatCurrency(pay.paidAmount,  pay.currency)}     mono emphasis={pay.paidAmount > 0 ? 'positive' : 'muted'} />
        <FieldRow
          label="Remaining Balance"
          value={formatCurrency(pay.remainingAmount, pay.currency)}
          mono
          emphasis={pay.remainingAmount > 0 ? (isOverdue ? 'danger' : 'strong') : 'positive'}
          colSpan
        />

        {/* Last payment */}
        {pay.lastPaymentDate && (
          <>
            <FieldRow label="Last Payment Date"   value={formatDate(pay.lastPaymentDate)} />
            <FieldRow label="Last Payment Amount" value={formatCurrency(pay.lastPaymentAmount!, pay.currency)} mono emphasis="positive" />
            {pay.lastPaymentMethod && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Last Method</dt>
                <dd><PaymentMethodBadge method={pay.lastPaymentMethod} /></dd>
              </div>
            )}
            {pay.lastReferenceNumber && (
              <FieldRow label="Last Reference" value={pay.lastReferenceNumber} mono />
            )}
          </>
        )}
      </dl>

      {/* Verification info */}
      {pay.verificationStatus !== 'UNVERIFIED' && (
        <div className="mt-4 pt-4 border-t border-[#f0f4f7]">
          {pay.verificationStatus === 'VERIFIED' ? (
            <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-[#eaf6f0] border border-[#96d6b4]">
              <span className="text-[12px] text-[#1a5c38]">
                ✓ Verified by {pay.verifiedBy} on {formatDate(pay.verifiedAt!)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-3 py-2 rounded-md bg-[#fdecea] border border-[#f0a0a0]">
              <span className="text-[12px] font-semibold text-[#8c1f1f]">Flagged for Review</span>
              {pay.flagReason && (
                <span className="text-[11px] text-[#8c1f1f]">{pay.flagReason}</span>
              )}
            </div>
          )}
          {pay.verificationNotes && (
            <p className="text-[11px] text-[#3a5068] mt-2">{pay.verificationNotes}</p>
          )}
        </div>
      )}
    </DetailSection>
  )
}

// ─── Linked Documents Panel ──────────────────────────────────────
export function PaymentLinkedDocsPanel({ pay }: { pay: PaymentDocument }) {
  const links = [
    { label: 'Voucher', number: pay.voucherNumber, href: `/dashboard/voucher/${pay.voucherId}`, icon: Wallet,   color: 'bg-[#edf5fb]', iconColor: 'text-[#2d6495]' },
    { label: 'Invoice', number: pay.invoiceNumber, href: `/dashboard/invoice/${pay.invoiceId}`, icon: Receipt,  color: 'bg-[#e8f3fb]', iconColor: 'text-[#123d6b]' },
    { label: 'QS',      number: pay.qsNumber,      href: `/dashboard/qs/${pay.qsId}`,           icon: FileText, color: 'bg-[#f0f4f7]', iconColor: 'text-[#3a5068]' },
  ]

  return (
    <DetailSection icon={Receipt} title="Linked Documents" id="linked-docs">
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
          >
            <div className={cn('flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0', link.color)}>
              <link.icon size={13} className={link.iconColor} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#7a8fa3] font-medium uppercase tracking-wide">{link.label}</p>
              <p className="text-[12px] font-semibold text-[#18273a] font-mono">{link.number}</p>
            </div>
            <ExternalLink size={12} className="text-[#7a8fa3] group-hover:text-[#123d6b] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </DetailSection>
  )
}

// ─── Notes ───────────────────────────────────────────────────────
export function PaymentNotesPanel({ pay }: { pay: PaymentDocument }) {
  return (
    <DetailSection icon={StickyNote} title="Internal Notes" id="notes">
      {pay.internalNotes ? (
        <p className="text-[13px] text-[#18273a] leading-relaxed whitespace-pre-wrap bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-3">
          {pay.internalNotes}
        </p>
      ) : (
        <p className="text-[12px] text-[#7a8fa3]">No internal notes</p>
      )}
    </DetailSection>
  )
}
