// FILE: components/pni/PniDetailPanels.tsx
'use client'

import type { ReactNode } from 'react'
import { Shield, Ship, Layers, FileText, CalendarClock, ClipboardList, Users2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { PniQuotationDetail, PniInsuranceBlock, PniVessel } from '@/types/pni'

// Same pattern as components/quotations/QuotationDetailPanels.tsx
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

function decimal(v: string | null): string {
  if (v === null || v === '') return '—'
  const n = Number(v)
  return Number.isNaN(n) ? v : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** Reference/security/trading/payment/signature fields specific to this P&I quotation — data GET /quotations/:id cannot provide. */
export function PniOverviewPanel({ pni }: { pni: PniQuotationDetail }) {
  return (
    <DetailSection icon={Shield} title={`P&I — ${pni.clubFormat.replaceAll('_', ' ')}`}>
      <dl className="grid grid-cols-3 gap-4">
        <FieldRow label="Reference Number" value={pni.referenceNumber} />
        <FieldRow label="Validity (Days)" value={pni.validityDays} />
        <FieldRow label="Assured Domicile" value={pni.assuredDomicile} />
        <FieldRow label="Broker" value={pni.broker} />
        <FieldRow label="Insurer / Security" value={pni.insurerOrSecurity} colSpan />
        <FieldRow label="Trading Limits" value={pni.tradingLimits} colSpan />
        <FieldRow label="Payment Terms" value={pni.paymentTermsText} colSpan />
        <FieldRow label="Subjectivities" value={pni.subjectivities} colSpan />
        <FieldRow label="Important Information" value={pni.importantInformation} colSpan />
        <FieldRow label="Signature Name" value={pni.signatureName} />
        <FieldRow label="Signature City" value={pni.signatureCity} />
        <FieldRow label="Signature Date" value={pni.signatureDate && formatDate(pni.signatureDate)} />
      </dl>
    </DetailSection>
  )
}

export function PniVesselsPanel({ vessels }: { vessels: PniVessel[] }) {
  return (
    <DetailSection icon={Ship} title={`Vessels (${vessels.length})`}>
      {vessels.length === 0 ? (
        <p className="text-[12px] text-[#b5cede]">No vessels recorded.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#7a8fa3] border-b border-[#edf1f5]">
                <th className="py-1.5 pr-3">Name</th>
                <th className="py-1.5 pr-3">IMO</th>
                <th className="py-1.5 pr-3">Type</th>
                <th className="py-1.5 pr-3">Built</th>
                <th className="py-1.5 pr-3">Flag</th>
                <th className="py-1.5 pr-3">Class</th>
                <th className="py-1.5 pr-3">GT</th>
                <th className="py-1.5">Port of Registry</th>
              </tr>
            </thead>
            <tbody>
              {vessels.map((v) => (
                <tr key={v.id} className="border-b border-[#f7f9fb] text-[#18273a]">
                  <td className="py-1.5 pr-3 font-medium">{v.name}</td>
                  <td className="py-1.5 pr-3">{v.imoNumber || '—'}</td>
                  <td className="py-1.5 pr-3">{v.vesselType || '—'}</td>
                  <td className="py-1.5 pr-3">{v.builtYear ?? '—'}</td>
                  <td className="py-1.5 pr-3">{v.flag || '—'}</td>
                  <td className="py-1.5 pr-3">{v.classNotApplicable ? '-' : (v.vesselClass || '—')}</td>
                  <td className="py-1.5 pr-3">{v.grossTonnage ?? '—'}</td>
                  <td className="py-1.5">{v.portOfRegistry || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DetailSection>
  )
}

function BlockDeductibles({ block, vesselsById }: { block: PniInsuranceBlock; vesselsById: Map<string, string> }) {
  if (block.deductibles.length === 0) return null
  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Deductibles</p>
      <ul className="flex flex-col gap-1">
        {block.deductibles.map((d) => (
          <li key={d.id} className="text-[12px] text-[#18273a]">
            <span className="font-medium">{d.scope.replaceAll('_', ' ')}</span>
            {d.claimCategory && ` — ${d.claimCategory}`}
            {': '}{d.amount ? `${d.currency} ${decimal(d.amount)}` : '—'}
            {d.description && ` (${d.description})`}
            {d.vesselScopes.length > 0 && (
              <span className="text-[#7a8fa3]"> · {d.vesselScopes.map((vs) => vesselsById.get(vs.vesselId) ?? vs.vesselId).join(', ')}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function ProvisionsList({ provisions, vesselsById, title }: { provisions: PniInsuranceBlock['provisions']; vesselsById: Map<string, string>; title: string }) {
  if (provisions.length === 0) return null
  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">{title}</p>
      <ul className="flex flex-col gap-1.5">
        {provisions.map((p) => (
          <li key={p.id} className="text-[12px] text-[#18273a]">
            <span className="font-medium">[{p.type}]</span> {p.title}
            {p.source === 'PREDEFINED' && <span className="text-[#7a8fa3]"> (predefined)</span>}
            {p.content && <div className="text-[#3a5068] mt-0.5">{p.content}</div>}
            {p.reference && <span className="text-[#7a8fa3]"> · Ref: {p.reference}</span>}
            {p.scope === 'SELECTED_VESSELS' && p.vesselScopes.length > 0 && (
              <span className="text-[#7a8fa3]"> · {p.vesselScopes.map((vs) => vesselsById.get(vs.vesselId) ?? vs.vesselId).join(', ')}</span>
            )}
            {p.scope === 'ALL_VESSELS' && <span className="text-[#7a8fa3]"> · All vessels</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CoverRestrictionsList({ items, title }: { items: PniInsuranceBlock['coverRestrictions']; title: string }) {
  if (items.length === 0) return null
  return (
    <div className="mt-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">{title}</p>
      <ul className="flex flex-col gap-1">
        {items.map((r) => (
          <li key={r.id} className={cn('text-[12px]', r.isSelected ? 'text-[#18273a]' : 'text-[#b5cede] line-through')}>
            {r.name}
            {(r.partReference || r.sectionReference) && (
              <span className="text-[#7a8fa3]"> ({[r.partReference, r.sectionReference].filter(Boolean).join(', ')})</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Insurance Blocks — including inheritance, nested deductibles/provisions/cover restrictions, and the vessels each block covers. */
export function PniInsuranceBlocksPanel({ pni }: { pni: PniQuotationDetail }) {
  const vesselsById = new Map(pni.vessels.map((v) => [v.id, v.name]))
  const blockNameById = new Map(pni.insuranceBlocks.map((b) => [b.id, b.typeOfInsurance]))
  const coveragesByBlock = new Map<string, { vessel: string; annualPremium: string | null; limitAmount: string | null; currency: string }[]>()
  pni.vessels.forEach((v) => {
    v.coverages.forEach((c) => {
      const list = coveragesByBlock.get(c.insuranceBlockId) ?? []
      list.push({ vessel: v.name, annualPremium: c.annualPremium, limitAmount: c.limitAmount, currency: c.currency })
      coveragesByBlock.set(c.insuranceBlockId, list)
    })
  })

  return (
    <DetailSection icon={Layers} title={`Insurance Blocks (${pni.insuranceBlocks.length})`}>
      {pni.insuranceBlocks.length === 0 ? (
        <p className="text-[12px] text-[#b5cede]">No insurance blocks recorded.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {pni.insuranceBlocks.map((block) => {
            const coverages = coveragesByBlock.get(block.id) ?? []
            return (
              <div key={block.id} className="border border-[#edf1f5] rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[13px] font-semibold text-[#18273a]">{block.typeOfInsurance}</h4>
                  <span className="text-[12px] text-[#3a5068]">
                    {block.currency} {decimal(block.premium)} <span className="text-[#7a8fa3]">({block.premiumBasis.replaceAll('_', ' ')})</span>
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-3">
                  <FieldRow label="Security" value={block.security} />
                  <FieldRow label="Policy Wording" value={block.policyWordingReference} />
                  <FieldRow label="Trading Area" value={block.tradingArea} />
                  <FieldRow label="Maximum Insured" value={block.maximumInsured && `${block.currency} ${decimal(block.maximumInsured)}`} />
                  <FieldRow
                    label="Inherits From"
                    value={block.inheritsFromBlockId && (blockNameById.get(block.inheritsFromBlockId) ?? block.inheritsFromBlockId)}
                  />
                  <FieldRow label="Payment Warranty" value={block.paymentWarrantyText} colSpan />
                </dl>
                {coverages.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Vessel Coverages</p>
                    <ul className="flex flex-col gap-1">
                      {coverages.map((c, i) => (
                        <li key={i} className="text-[12px] text-[#18273a]">
                          {c.vessel} — {c.currency} {decimal(c.annualPremium)}{c.limitAmount ? ` (limit ${decimal(c.limitAmount)})` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <BlockDeductibles block={block} vesselsById={vesselsById} />
                <ProvisionsList provisions={block.provisions} vesselsById={vesselsById} title="Provisions" />
                <CoverRestrictionsList items={block.coverRestrictions} title="Cover Restrictions" />
              </div>
            )
          })}
        </div>
      )}
    </DetailSection>
  )
}

/** Quote-level (not tied to any block) Provisions and Cover Restrictions. */
export function PniQuoteLevelPanel({ pni }: { pni: PniQuotationDetail }) {
  const vesselsById = new Map(pni.vessels.map((v) => [v.id, v.name]))
  if (pni.provisions.length === 0 && pni.coverRestrictions.length === 0) return null
  return (
    <DetailSection icon={FileText} title="Quote-Level Provisions & Cover Restrictions">
      <ProvisionsList provisions={pni.provisions} vesselsById={vesselsById} title="Provisions" />
      <CoverRestrictionsList items={pni.coverRestrictions} title="Cover Restrictions" />
    </DetailSection>
  )
}

export function PniInstallmentsPanel({ pni }: { pni: PniQuotationDetail }) {
  return (
    <DetailSection icon={CalendarClock} title={`Installments (${pni.installments.length})`}>
      {pni.installments.length === 0 ? (
        <p className="text-[12px] text-[#b5cede]">No installments recorded.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {pni.installments
            .slice()
            .sort((a, b) => a.installmentNo - b.installmentNo)
            .map((i) => (
              <li key={i.id} className="text-[12px] text-[#18273a]">
                #{i.installmentNo}: {i.currency} {decimal(i.amount)}{i.dueDate ? ` — due ${formatDate(i.dueDate)}` : ''}
              </li>
            ))}
        </ul>
      )}
    </DetailSection>
  )
}

export function PniAdminPanel({ pni }: { pni: PniQuotationDetail }) {
  if (pni.requiredDocuments.length === 0 && pni.organizationRoles.length === 0) return null
  return (
    <DetailSection icon={ClipboardList} title="Required Documents & Organization Roles">
      {pni.requiredDocuments.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1">Required Documents</p>
          <ul className="flex flex-col gap-1">
            {pni.requiredDocuments.map((d) => (
              <li key={d.id} className="text-[12px] text-[#18273a]">
                {d.name} {!d.isRequired && <span className="text-[#7a8fa3]">(optional)</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {pni.organizationRoles.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3] mb-1 flex items-center gap-1">
            <Users2 size={11} /> Organization Roles
          </p>
          <ul className="flex flex-col gap-1">
            {pni.organizationRoles.map((r) => (
              <li key={r.id} className="text-[12px] text-[#18273a]">
                {r.organization ? `${r.organization} — ` : ''}{r.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </DetailSection>
  )
}