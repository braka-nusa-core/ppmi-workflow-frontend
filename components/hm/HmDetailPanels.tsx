// FILE: components/hm/HmDetailPanels.tsx
'use client'

import type { ReactNode } from 'react'
import { Ship, CalendarClock, Users2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { HmQuotationDetail } from '@/types/hm'
import type { Quotation } from '@/types/quotation'

// Same local pattern as components/pni/PniDetailPanels.tsx.
function FieldRow({ label, value, colSpan }: { label: string; value: ReactNode; colSpan?: boolean }) {
  return (
    <div className={cn('flex flex-col gap-0.5', colSpan && 'col-span-2')}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">{label}</dt>
      <dd className="text-[13px] leading-snug text-[#18273a]">{value ?? <span className="text-[#b5cede]">—</span>}</dd>
    </div>
  )
}

function DetailSection({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: ReactNode }) {
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

function decimal(v: string | null | undefined): string {
  if (v === null || v === undefined || v === '') return '—'
  const n = Number(v)
  return Number.isNaN(n) ? v : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Insurance/risk information + sum insured/premium/deductible/
 * brokerage — the fields Phase 3B's form actually writes, split
 * between the base Quotation (insured/address/interest/sumInsured/
 * rate/premium/deductibleText/brokerage/etc.) and HmQuotation
 * (vesselType/tradingWarranty/toggles). Nothing here is invented
 * beyond what those two responses return.
 */
export function HmOverviewPanel({ quotation, hm }: { quotation: Quotation; hm: HmQuotationDetail }) {
  return (
    <DetailSection icon={Ship} title="H&M — Insurance Information">
      <dl className="grid grid-cols-3 gap-4">
        <FieldRow label="The Insured" value={quotation.insured} />
        <FieldRow label="Address" value={quotation.address} colSpan />
        <FieldRow label="Interest" value={quotation.interest} colSpan />
        <FieldRow label="Type of Vessel" value={hm.vesselType} />
        <FieldRow label="Sum Insured" value={quotation.sumInsured && `${quotation.sumInsuredCurrency ?? ''} ${decimal(quotation.sumInsured)}`.trim()} />
        <FieldRow label="Periode" value={quotation.periodText} />
        <FieldRow label="Trading Warranty" value={hm.tradingWarranty} colSpan />
        <FieldRow label="Deductible (as stated)" value={quotation.deductibleText} colSpan />
        <FieldRow
          label="Brokerage"
          value={hm.brokerageEnabled ? 'Shown on this quotation (see Financial panel below)' : <span className="text-[#b5cede]">Not shown on this quotation</span>}
        />
        <FieldRow label="Insurance (label)" value={quotation.insuranceLabelValue} />
        <FieldRow label="Confirmed & Accepted By" value={quotation.confirmedAcceptedBy} />
      </dl>
    </DetailSection>
  )
}

export function HmInstallmentsPanel({ hm }: { hm: HmQuotationDetail }) {
  if (!hm.premiumPaymentEnabled) {
    return (
      <DetailSection icon={CalendarClock} title="Premium Payment">
        <p className="text-[12px] text-[#b5cede]">No installment schedule on this quotation.</p>
      </DetailSection>
    )
  }
  return (
    <DetailSection icon={CalendarClock} title={`Installments (${hm.installments.length})`}>
      {hm.installments.length === 0 ? (
        <p className="text-[12px] text-[#b5cede]">No installments recorded.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {hm.installments
            .slice()
            .sort((a, b) => a.installmentNo - b.installmentNo)
            .map((i) => (
              <li key={i.id} className="text-[12px] text-[#18273a]">
                #{i.installmentNo}
                {i.percentage ? ` (${decimal(i.percentage)}%)` : ''}
                {': '}{i.currency ?? ''} {decimal(i.amount)}
                {i.dueDate ? ` — due ${formatDate(i.dueDate)}` : i.dueAfterDays ? ` — due ${i.dueAfterDays} days after inception` : ''}
              </li>
            ))}
        </ul>
      )}
    </DetailSection>
  )
}

export function HmAdjusterSurveyorPanel({ hm }: { hm: HmQuotationDetail }) {
  if (hm.quotation.adjusters.length === 0 && hm.quotation.surveyors.length === 0) return null
  return (
    <DetailSection icon={Users2} title="Adjuster & Surveyor">
      {hm.quotation.adjusters.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Nominated Adjusters</p>
          <ul className="flex flex-col gap-1">
            {hm.quotation.adjusters.map((a) => (
              <li key={a.adjusterId} className="text-[12px] text-[#18273a]">{a.adjuster.name}</li>
            ))}
          </ul>
        </div>
      )}
      {hm.quotation.surveyors.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Surveyors</p>
          <ul className="flex flex-col gap-1">
            {hm.quotation.surveyors.map((s) => (
              <li key={s.surveyorId} className="text-[12px] text-[#18273a]">{s.surveyor.name}</li>
            ))}
          </ul>
        </div>
      )}
    </DetailSection>
  )
}