import {
  Wallet, CreditCard, Landmark,
  Receipt, FileText, Paperclip,
  StickyNote, ExternalLink,
} from 'lucide-react'
import Link           from 'next/link'
import { cn }         from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import type { VoucherDocument } from '@/types/voucher'
import { PaymentTypeBadge }     from './VoucherStatusBadge'

// ─── Shared field row ────────────────────────────────────────────
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
    strong:   'text-[#18273a] font-semibold',
    muted:    'text-[#7a8fa3]',
    positive: 'text-[#1a5c38] font-semibold',
    danger:   'text-[#8c1f1f] font-semibold',
    default:  'text-[#18273a]',
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

// ─── Voucher Information ─────────────────────────────────────────
export function VoucherInfoPanel({ vch }: { vch: VoucherDocument }) {
  return (
    <DetailSection icon={Wallet} title="Voucher Information" id="voucher-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Voucher Number" value={vch.docNumber}  mono emphasis="strong" />
        <FieldRow label="Division"       value={vch.division === 'PI' ? 'P&I (Protection & Indemnity)' : 'H&M (Hull & Machinery)'} />
        <FieldRow label="Insured"        value={vch.insuredName} emphasis="strong" colSpan />
        {vch.vesselName && <FieldRow label="Vessel" value={vch.vesselName} />}
        {vch.processingDate && (
          <FieldRow label="Target Processing Date" value={formatDate(vch.processingDate)} />
        )}
        {vch.processedDate && (
          <FieldRow label="Processed On" value={formatDate(vch.processedDate)} emphasis="positive" />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Payment Information ─────────────────────────────────────────
export function PaymentInfoPanel({ vch }: { vch: VoucherDocument }) {
  return (
    <DetailSection icon={CreditCard} title="Payment Information" id="payment-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Payment Type</dt>
          <dd><PaymentTypeBadge type={vch.paymentType} /></dd>
        </div>
        <FieldRow label="Currency"       value={vch.currency} />
        <FieldRow
          label="Payment Amount"
          value={formatCurrency(vch.amount, vch.currency)}
          mono emphasis="strong"
          colSpan
        />
      </dl>
    </DetailSection>
  )
}

// ─── Bank Information ────────────────────────────────────────────
export function VoucherBankInfoPanel({ vch }: { vch: VoucherDocument }) {
  return (
    <DetailSection icon={Landmark} title="Bank & Beneficiary Information" id="bank-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Bank Name"        value={vch.bankName}      emphasis="strong" colSpan />
        <FieldRow label="Account Number"   value={vch.accountNumber} mono />
        <FieldRow label="Beneficiary Name" value={vch.accountName}   />
        {vch.bankBranch && <FieldRow label="Branch"     value={vch.bankBranch} />}
        {vch.swiftCode  && <FieldRow label="SWIFT Code" value={vch.swiftCode}  mono />}
      </dl>
    </DetailSection>
  )
}

// ─── Linked Invoice Panel ────────────────────────────────────────
export function LinkedInvoicePanel({ vch }: { vch: VoucherDocument }) {
  return (
    <DetailSection icon={Receipt} title="Linked Invoice" id="linked-invoice">
      <Link
        href={`/dashboard/invoice/${vch.invoiceId}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e8f3fb] flex-shrink-0">
          <Receipt size={15} className="text-[#123d6b]" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#18273a] font-mono">{vch.invoiceNumber}</p>
          <p className="text-[11px] text-[#3a5068]">
            {vch.insuredName}{vch.vesselName ? ` · ${vch.vesselName}` : ''}
          </p>
        </div>
        <ExternalLink size={13} className="text-[#7a8fa3] group-hover:text-[#123d6b] transition-colors" />
      </Link>
    </DetailSection>
  )
}

// ─── Linked QS Panel ─────────────────────────────────────────────
export function LinkedQSMiniPanel({ vch }: { vch: VoucherDocument }) {
  return (
    <DetailSection icon={FileText} title="Linked Quotation Sheet" id="linked-qs">
      <Link
        href={`/dashboard/qs/${vch.qsId}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#edf5fb] flex-shrink-0">
          <FileText size={15} className="text-[#2d6495]" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#18273a] font-mono">{vch.qsNumber}</p>
          <p className="text-[11px] text-[#3a5068]">Original quotation sheet</p>
        </div>
        <ExternalLink size={13} className="text-[#7a8fa3] group-hover:text-[#123d6b] transition-colors" />
      </Link>
    </DetailSection>
  )
}

// ─── Attachments ─────────────────────────────────────────────────
export function VoucherAttachmentsPanel({ vch }: { vch: VoucherDocument }) {
  const files = vch.attachments ?? []
  const fmtBytes = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`

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
                <Wallet size={12} className="text-[#123d6b]" />
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
export function VoucherNotesPanel({ vch }: { vch: VoucherDocument }) {
  return (
    <DetailSection icon={StickyNote} title="Internal Notes" id="notes">
      {vch.internalNotes ? (
        <p className="text-[13px] text-[#18273a] leading-relaxed whitespace-pre-wrap bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-3">
          {vch.internalNotes}
        </p>
      ) : (
        <p className="text-[12px] text-[#7a8fa3]">No internal notes</p>
      )}
    </DetailSection>
  )
}
