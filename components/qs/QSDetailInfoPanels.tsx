import {
  FileText,
  Ship,
  Shield,
  DollarSign,
  Paperclip,
  StickyNote,
  ExternalLink,
} from 'lucide-react'
import { cn }               from '@/lib/utils'
import { formatCurrency, formatDate, formatNumber } from '@/lib/format'
import type { QSDocument } from '@/types/qs'

// ─── Shared field row ────────────────────────────────────────────
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
  emphasis?: 'strong' | 'muted' | 'danger' | 'positive'
  colSpan?:  boolean
}) {
  const valueClass = {
    strong:   'text-[#18273a] font-semibold',
    muted:    'text-[#7a8fa3]',
    danger:   'text-[#8c1f1f] font-semibold',
    positive: 'text-[#1a5c38] font-semibold',
    default:  'text-[#18273a]',
  }[emphasis ?? 'default']

  return (
    <div className={cn('flex flex-col gap-0.5', colSpan && 'col-span-2')}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">
        {label}
      </dt>
      <dd className={cn('text-[13px] leading-snug', valueClass, mono && 'font-mono tracking-tight')}>
        {value ?? <span className="text-[#b5cede]">—</span>}
      </dd>
    </div>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────
function DetailSection({
  icon: Icon,
  title,
  children,
  id,
}: {
  icon:     React.ElementType
  title:    string
  children: React.ReactNode
  id?:      string
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
      <div className="card-body">
        {children}
      </div>
    </section>
  )
}

// ─── Policy Information ──────────────────────────────────────────
export function PolicyInfoPanel({ qs }: { qs: QSDocument }) {
  return (
    <DetailSection icon={FileText} title="Policy Information" id="policy">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="QS Number"     value={qs.docNumber}    mono emphasis="strong" />
        <FieldRow label="QS Type"       value={qs.type === 'NEW' ? 'New Policy' : 'Renewal'} />
        <FieldRow label="Division"      value={qs.division === 'PI' ? 'P&I (Protection & Indemnity)' : 'H&M (Hull & Machinery)'} />
        <FieldRow label="Broker / Agent" value={qs.broker} />
        <FieldRow label="Effective Date" value={formatDate(qs.effectiveDate)} />
        <FieldRow label="Expiry Date"    value={formatDate(qs.expiryDate)}   />
        <FieldRow label="Insured Name"   value={qs.insuredName}              colSpan emphasis="strong" />
        {qs.insuredAddress && (
          <FieldRow label="Address"       value={qs.insuredAddress}          colSpan />
        )}
        {qs.insuredContact && (
          <FieldRow label="Contact"       value={qs.insuredContact}          />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Vessel Information ──────────────────────────────────────────
export function VesselInfoPanel({ qs }: { qs: QSDocument }) {
  return (
    <DetailSection icon={Ship} title="Vessel Information" id="vessel">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Vessel Name"  value={qs.vesselName}       emphasis="strong" colSpan />
        <FieldRow label="Vessel Type"  value={qs.vesselType}       />
        <FieldRow label="Flag State"   value={qs.vesselFlag}       />
        <FieldRow label="GRT"          value={qs.vesselGRT ? formatNumber(qs.vesselGRT) + ' GT' : undefined} />
        <FieldRow label="Year Built"   value={qs.vesselBuiltYear}  />
        <FieldRow label="IMO Number"   value={qs.imoNumber}   mono />
      </dl>
    </DetailSection>
  )
}

// ─── Insurance Information ───────────────────────────────────────
export function InsuranceInfoPanel({ qs }: { qs: QSDocument }) {
  return (
    <DetailSection icon={Shield} title="Insurance Information" id="insurance">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Insurance Type" value={qs.insuranceType} emphasis="strong" />
        {qs.deductible != null && (
          <FieldRow
            label="Deductible"
            value={formatCurrency(qs.deductible, qs.currency)}
            mono
          />
        )}
        {qs.coverageDetail && (
          <div className="col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1.5">
              Coverage Detail
            </dt>
            <dd className="text-[12px] text-[#18273a] leading-relaxed bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-2.5">
              {qs.coverageDetail}
            </dd>
          </div>
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Premium Information ─────────────────────────────────────────
export function PremiumInfoPanel({ qs }: { qs: QSDocument }) {
  return (
    <DetailSection icon={DollarSign} title="Premium Information" id="premium">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Currency"       value={qs.currency}           />
        <FieldRow
          label="Premium Amount"
          value={formatCurrency(qs.premiumAmount, qs.currency)}
          mono
          emphasis="strong"
        />
        {qs.currency === 'USD' && qs.exchangeRate && (
          <FieldRow
            label="Exchange Rate"
            value={`USD 1 = IDR ${formatNumber(qs.exchangeRate)}`}
            mono
          />
        )}
        {qs.currency === 'USD' && qs.premiumIDR && (
          <FieldRow
            label="IDR Equivalent"
            value={formatCurrency(qs.premiumIDR, 'IDR')}
            mono
            emphasis="positive"
          />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Attachments ─────────────────────────────────────────────────
function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentsPanel({ attachments }: { attachments?: QSDocument['attachments'] }) {
  const files = attachments ?? []

  return (
    <DetailSection icon={Paperclip} title="Attached Documents" id="documents">
      {files.length === 0 ? (
        <p className="text-[12px] text-[#7a8fa3]">No documents attached</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
            >
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[#e8f3fb] flex-shrink-0">
                <FileText size={12} className="text-[#123d6b]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#18273a] truncate">{file.filename}</p>
                <p className="text-[10px] text-[#7a8fa3]">
                  {formatBytes(file.filesize)} · Uploaded by {file.uploadedBy} · {formatDate(file.uploadedAt)}
                </p>
              </div>
              <button
                className="flex items-center gap-1 text-[11px] text-[#7a8fa3] hover:text-[#123d6b] transition-colors duration-100 opacity-0 group-hover:opacity-100"
              >
                <ExternalLink size={12} />
                Open
              </button>
            </div>
          ))}
        </div>
      )}
    </DetailSection>
  )
}

// ─── Internal Notes ──────────────────────────────────────────────
export function NotesPanel({ notes }: { notes?: string }) {
  return (
    <DetailSection icon={StickyNote} title="Internal Notes" id="notes">
      {notes ? (
        <p className="text-[13px] text-[#18273a] leading-relaxed whitespace-pre-wrap bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-3">
          {notes}
        </p>
      ) : (
        <p className="text-[12px] text-[#7a8fa3]">No internal notes</p>
      )}
    </DetailSection>
  )
}
