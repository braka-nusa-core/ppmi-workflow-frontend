// FILE: components/quotation-templates/msig/MsigEditor.tsx
// Document-oriented editor. Walks the TEMPLATE in printed order: standard
// wording is shown read-only (protected — there is no input behind it), and
// inputs appear only for the values the Phase 2 spec marks EDIT / REP.
// P&I and War P&I are separate cards with separate amount fields.

'use client'

import { Lock, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useWatch, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { amountError } from '@/lib/quotation-templates/msig/format'
import { createBlankVessel } from '@/lib/quotation-templates/msig/fixtures'
import type { MsigFormData, MsigSection, MsigTemplate, MsigTemplateElement } from '@/lib/quotation-templates/msig/types'

const SECTION_TITLES: Record<MsigSection, { title: string; note?: string }> = {
  quotation: { title: 'Quotation details and general terms' },
  pni: { title: 'P&I coverage block', note: 'Block membership of Warranties / Survey Warranty is unconfirmed — shown in printed order.' },
  war: { title: 'War P&I coverage block', note: 'Separate from the P&I block: its own wording and its own amounts.' },
  closing: { title: 'Validity and signature' },
}

function Row({ id, label, protectedText, children }: { id: string; label?: string; protectedText?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[210px_1fr] gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="text-xs font-semibold italic text-gray-700 leading-snug">
        {label}
        <div className="not-italic font-normal text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
          {protectedText && <Lock size={9} aria-hidden />} {id}{protectedText ? ' · standard wording' : ''}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Protected({ paragraphs }: { paragraphs: { text: string; bold?: boolean }[] }) {
  return (
    <div aria-readonly="true" className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 space-y-1.5 select-text whitespace-pre-line">
      {paragraphs.map((p, i) => <p key={i} className={p.bold ? 'font-semibold' : undefined}>{p.text}</p>)}
    </div>
  )
}

export function MsigEditor({ template, form }: { template: MsigTemplate; form: UseFormReturn<MsigFormData> }) {
  const { register, control } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'vessels', keyName: 'rhfKey' })
  const values = useWatch({ control }) as MsigFormData

  const groups: { section: MsigSection; items: MsigTemplateElement[] }[] = []
  for (const el of template.elements) {
    const last = groups[groups.length - 1]
    if (last && last.section === el.section) last.items.push(el)
    else groups.push({ section: el.section, items: [el] })
  }

  const renderEl = (el: MsigTemplateElement) => {
    switch (el.kind) {
      case 'title':
      case 'lead':
        return <Row key={el.id} id={el.id} protectedText><Protected paragraphs={[{ text: el.text, bold: el.kind === 'title' }]} /></Row>
      case 'field':
        return (
          <Row key={el.id} id={el.id} label={el.label}>
            <input className="form-input" {...register(el.field)} aria-label={el.label} />
          </Row>
        )
      case 'text':
        return <Row key={el.id} id={el.id} label={el.label} protectedText><Protected paragraphs={el.paragraphs} /></Row>
      case 'amount': {
        const err = amountError(values?.[el.coverage]?.[el.field] ?? '')
        return (
          <Row key={el.id} id={el.id} label={el.label}>
            <div className="flex items-start gap-2">
              <span className="mt-2 text-xs text-gray-600">{el.currency}</span>
              <div className="w-44">
                <input className={`form-input text-right ${err ? 'error' : ''}`} inputMode="decimal" {...register(`${el.coverage}.${el.field}`)} aria-label={`${el.coverage === 'pni' ? 'P&I' : 'War P&I'} ${el.label}`} />
                {err && <p className="text-[11px] text-[#8c1f1f] mt-0.5">{err}</p>}
              </div>
              <div className="flex-1"><Protected paragraphs={[{ text: el.remark }]} /></div>
            </div>
          </Row>
        )
      }
      case 'vessels':
        return (
          <div key={el.id} className="py-2 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold italic text-gray-700">{el.label} <span className="not-italic font-normal text-[10px] text-gray-400">{el.id} · repeatable</span></div>
              <Button type="button" size="sm" icon={<Plus size={12} />} onClick={() => append(createBlankVessel())}>Add vessel</Button>
            </div>
            {fields.length === 0 && <p className="text-xs text-[#8c6d1f]">No vessel: no “{el.label}” block will print. (Minimum vessel count is unconfirmed.)</p>}
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={f.rhfKey} className="rounded border border-gray-200 p-3" data-testid="vessel-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700">{el.label} {i + 1}</span>
                    <Button type="button" size="sm" variant="ghost" icon={<Trash2 size={12} />} onClick={() => remove(i)} aria-label={`Remove vessel ${i + 1}`}>Remove</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                    {template.vesselFields.map((vf) => {
                      if (vf.key === 'class') {
                        return (
                          <label key={vf.key} className="text-xs text-gray-600">{vf.label}
                            <input className="form-input mt-0.5" disabled={!!values?.vessels?.[i]?.classNotApplicable} {...register(`vessels.${i}.vesselClass`)} />
                            <span className="flex items-center gap-1 mt-1 text-[11px]"><input type="checkbox" {...register(`vessels.${i}.classNotApplicable`)} /> No class (prints “-”)</span>
                          </label>
                        )
                      }
                      const name = ({ name: 'name', type: 'type', imoNumber: 'imoNumber', grossTonnage: 'grossTonnage', builtYear: 'builtYear', flag: 'flag', portOfRegistry: 'portOfRegistry' } as const)[vf.key]
                      return (
                        <label key={vf.key} className="text-xs text-gray-600">{vf.label}
                          <input className="form-input mt-0.5" {...register(`vessels.${i}.${name}`)} />
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'signature':
        return (
          <div key={el.id}>
            <Row id={el.id} label="Place / date line">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-700 rounded bg-gray-50 border border-gray-200 px-2 py-1">{template.companyName},</span>
                <input type="date" className="form-input w-44" {...register('issueDate')} aria-label="Issue date" />
              </div>
            </Row>
            <Row id={el.id} label="Acceptance block" protectedText>
              <Protected paragraphs={[{ text: el.eoe }, { text: el.acceptLabel }, { text: el.signatoryLabel }]} />
            </Row>
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {groups.map((g, gi) => (
        <section key={gi} className={`card ${g.section === 'pni' ? 'border-l-4 border-l-navy-500' : g.section === 'war' ? 'border-l-4 border-l-[#a97b50]' : ''}`}>
          <div className="card-header">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{SECTION_TITLES[g.section].title}</h3>
              {SECTION_TITLES[g.section].note && <p className="text-[11px] text-gray-500 mt-0.5">{SECTION_TITLES[g.section].note}</p>}
            </div>
          </div>
          <div className="card-body">{g.items.map(renderEl)}</div>
        </section>
      ))}
    </div>
  )
}