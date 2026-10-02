// FILE: components/cargo/CargoDetailPanels.tsx
'use client'

import type { ReactNode } from 'react'
import { Ship, Users2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { CargoQuotationDetail, CargoInstituteClause } from '@/types/cargo'
import type { Quotation } from '@/types/quotation'

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

const INSTITUTE_CARGO_CLAUSE_LABELS: Record<CargoInstituteClause, string> = {
  INSTITUTE_CARGO_A:   'Institute Cargo Clause (A)',
  INSTITUTE_CARGO_B:   'Institute Cargo Clause (B)',
  INSTITUTE_CARGO_C:   'Institute Cargo Clause (C)',
  INSTITUTE_BULK_OIL:  'Institute Bulk Oil Clauses',
  INSTITUTE_COAL:      'Institute Coal Clauses',
  INSTITUTE_CARGO_AIR: 'Institute Cargo Clauses (Air)',
}

/**
 * Insurance/voyage information - fields written by Phase 4B's form,
 * split between the base Quotation (insured/address/sumInsured/rate/
 * deductibleText/etc.) and CargoQuotation (interestInsured, the two
 * voyage fields, etd/eta/conveyance/instituteCargoClause). Rate/Premium reuse the
 * existing generic QuotationFinancialPanel rather than duplicating it
 * here - same decision HmDetailPanels.tsx made.
 */
export function CargoOverviewPanel({ quotation, cargo }: { quotation: Quotation; cargo: CargoQuotationDetail }) {
  return (
    <DetailSection icon={Ship} title="Cargo — Insurance & Voyage Information">
      <dl className="grid grid-cols-3 gap-4">
        <FieldRow label="The Insured" value={quotation.insured} />
        <FieldRow label="Address" value={quotation.address} colSpan />
        <FieldRow label="Interest Insured" value={cargo.interestInsured} colSpan />
        <FieldRow label="Sum Insured" value={quotation.sumInsured && `${quotation.sumInsuredCurrency ?? ''} ${decimal(quotation.sumInsured)}`.trim()} />
        <FieldRow label="Voyage From" value={cargo.voyageFrom} />
        <FieldRow label="Voyage To" value={cargo.voyageTo} />
        <FieldRow label="Sailing Date (ETD)" value={cargo.etd && formatDate(cargo.etd)} />
        <FieldRow label="Sailing Date (ETA)" value={cargo.eta && formatDate(cargo.eta)} />
        <FieldRow label="Conveyance" value={cargo.conveyance} />
        <FieldRow label="Deductible (as stated)" value={quotation.deductibleText} colSpan />
        <FieldRow
          label="Institute Cargo Clause"
          value={cargo.instituteCargoClause ? INSTITUTE_CARGO_CLAUSE_LABELS[cargo.instituteCargoClause] : <span className="text-[#9b6a1f]">Not selected — required before submission</span>}
          colSpan
        />
        <FieldRow label="Insurance (label)" value={quotation.insuranceLabelValue} />
        <FieldRow label="Confirmed & Accepted By" value={quotation.confirmedAcceptedBy} />
      </dl>
    </DetailSection>
  )
}

export function CargoAdjusterSurveyorPanel({ cargo }: { cargo: CargoQuotationDetail }) {
  if (cargo.quotation.adjusters.length === 0 && cargo.quotation.surveyors.length === 0) return null
  return (
    <DetailSection icon={Users2} title="Adjuster & Surveyor">
      {cargo.quotation.adjusters.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Nominated Adjusters</p>
          <ul className="flex flex-col gap-1">
            {cargo.quotation.adjusters.map((a) => (
              <li key={a.adjusterId} className="text-[12px] text-[#18273a]">{a.adjuster.name}</li>
            ))}
          </ul>
        </div>
      )}
      {cargo.quotation.surveyors.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Surveyors</p>
          <ul className="flex flex-col gap-1">
            {cargo.quotation.surveyors.map((s) => (
              <li key={s.surveyorId} className="text-[12px] text-[#18273a]">{s.surveyor.name}</li>
            ))}
          </ul>
        </div>
      )}
    </DetailSection>
  )
}