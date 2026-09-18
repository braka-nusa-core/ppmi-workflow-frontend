'use client'

import type { ReactNode } from 'react'
import { FileText, Building2, Shield, Send, Paperclip } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/format'
import type {
  QuotationDetail,
  QuotationAttachment,
  QuotationSubmission,
} from '@/types/quotation'

// ─── Shared field row / section (same pattern as components/qs/QSDetailInfoPanels.tsx) ─
function FieldRow({
  label,
  value,
  mono,
  colSpan,
}: {
  label:    string
  value:    ReactNode
  mono?:    boolean
  colSpan?: boolean
}) {
  return (
    <div className={cn('flex flex-col gap-0.5', colSpan && 'col-span-2')}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">
        {label}
      </dt>
      <dd className={cn('text-[13px] leading-snug text-[#18273a]', mono && 'font-mono tracking-tight')}>
        {value ?? <span className="text-[#b5cede]">—</span>}
      </dd>
    </div>
  )
}

function DetailSection({
  icon: Icon,
  title,
  children,
}: {
  icon:     React.ElementType
  title:    string
  children: ReactNode
}) {
  return (
    <section className="card">
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

// ─── Decimal display helper ─────────────────────────────────────
// Quotation.rate/premium/deductible/brokerage and Coverage.value are
// Prisma Decimal columns that arrive as numeric strings (see
// types/quotation.ts). No `currency` field exists on Quotation at
// all, so this deliberately does NOT call the app's formatCurrency()
// (which requires an IDR/USD currency) — that would invent a currency
// the backend never provided. This only adds thousands separators
// without altering the underlying value.
function formatDecimal(value: string | null): string {
  if (value === null || value === '') return '—'
  const num = Number(value)
  if (!Number.isFinite(num)) return value
  return num.toLocaleString('id-ID')
}

// ─── General Information ────────────────────────────────────────
export function QuotationOverviewPanel({ quotation }: { quotation: QuotationDetail }) {
  return (
    <DetailSection icon={FileText} title="General Information">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="QS Number" value={quotation.quotationNumber} mono colSpan />
        <FieldRow label="Quotation Date" value={formatDate(quotation.quotationDate)} />
        <FieldRow label="Period" value={
          quotation.periodStart || quotation.periodEnd
            ? `${formatDate(quotation.periodStart)} — ${formatDate(quotation.periodEnd)}`
            : null
        } />
        <FieldRow label="Insured" value={quotation.insured} colSpan />
        <FieldRow label="Address" value={quotation.address} colSpan />
        <FieldRow label="Interest" value={quotation.interest} colSpan />
      </dl>
    </DetailSection>
  )
}

// ─── Client & Technical Unit ─────────────────────────────────────
export function QuotationClientPanel({ quotation }: { quotation: QuotationDetail }) {
  return (
    <DetailSection icon={Building2} title="Client & Technical Information">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Client" value={quotation.client?.name} colSpan />
        <FieldRow label="Client Code" value={quotation.client?.clientCode} mono />
        <FieldRow label="Insurance Type" value={quotation.insuranceType?.name} />
        <FieldRow label="Technical Unit" value={quotation.technicalUnit?.name} />
      </dl>
    </DetailSection>
  )
}

// ─── Premium / Financial ─────────────────────────────────────────
export function QuotationFinancialPanel({ quotation }: { quotation: QuotationDetail }) {
  return (
    <DetailSection icon={Shield} title="Premium / Financial Information">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Rate"       value={formatDecimal(quotation.rate)} />
        <FieldRow label="Premium"    value={formatDecimal(quotation.premium)} />
        <FieldRow label="Deductible" value={formatDecimal(quotation.deductible)} />
        <FieldRow label="Brokerage"  value={formatDecimal(quotation.brokerage)} />
      </dl>
    </DetailSection>
  )
}

// ─── Insurance Submission / Review ───────────────────────────────
// A quotation may have multiple submissions, each with its own review
// trail — deliberately not flattened into a single approved/not flag.
export function QuotationSubmissionsPanel({ submissions }: { submissions: QuotationSubmission[] }) {
  if (submissions.length === 0) return null
  return (
    <DetailSection icon={Send} title="Insurance Submission / Review">
      <div className="flex flex-col gap-4">
        {submissions.map((s) => (
          <div key={s.id} className="border border-[#e3e9ef] rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold text-[#18273a]">
                {s.insuranceCompany.name}
              </p>
              <p className="text-[11px] text-[#9aa3ad]">Sent {formatDateTime(s.sentAt)}</p>
            </div>
            <p className="text-[12px] text-[#4d5966] mb-2">
              Sent by {s.sentBy.fullname}
              {s.note && ` — ${s.note}`}
            </p>
            {s.reviews.length > 0 ? (
              <ul className="flex flex-col gap-1.5 pl-3 border-l-2 border-[#e3e9ef]">
                {s.reviews.map((r) => (
                  <li key={r.id} className="text-[12px] text-[#18273a]">
                    <span className="font-medium">{r.action}</span> by {r.recordedBy?.fullname ?? '—'}
                    {' '}on {formatDateTime(r.reviewedAt)}
                    {r.note && ` — ${r.note}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-[#b5cede]">Awaiting insurer review</p>
            )}
          </div>
        ))}
      </div>
    </DetailSection>
  )
}

// ─── Attachments ──────────────────────────────────────────────────
// Metadata only — no upload/delete in this phase, and no document-type
// categorization since the backend does not currently return one.
export function QuotationAttachmentsPanel({ attachments }: { attachments: QuotationAttachment[] }) {
  if (attachments.length === 0) return null
  return (
    <DetailSection icon={Paperclip} title="Attachments">
      <ul className="flex flex-col divide-y divide-[#eef2f6]">
        {attachments.map((a) => (
          <li key={a.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
            <div className="flex flex-col">
              <span className="text-[13px] text-[#18273a]">{a.fileName ?? 'Untitled file'}</span>
              <span className="text-[11px] text-[#9aa3ad]">
                {a.mimeType ?? 'Unknown type'}
                {a.fileSize != null && ` · ${(a.fileSize / 1024).toFixed(0)} KB`}
                {a.createdAt && ` · Uploaded ${formatDateTime(a.createdAt)}`}
              </span>
            </div>
            {a.url && (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-[#1e4a70] hover:underline flex-shrink-0"
              >
                View
              </a>
            )}
          </li>
        ))}
      </ul>
    </DetailSection>
  )
}