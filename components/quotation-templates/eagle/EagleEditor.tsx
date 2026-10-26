// FILE: components/quotation-templates/eagle/EagleEditor.tsx
// Document-oriented editor for the Eagle template. Standard wording is shown
// read-only (collapsible — there is no input behind it); inputs exist only for
// the values the Phase 2 spec marks editable: header fields, the typed numbers
// inside clauses, the vessel/premium tables, the premium total and co-assured
// roles. No dropdown options exist (none confirmed by PPMI).

'use client'

import { Lock, Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useWatch, type Control, type UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { createBlankEagleVessel, createBlankRole } from '@/lib/quotation-templates/eagle/fixtures'
import { wholeAmountError } from '@/lib/quotation-templates/eagle/format'
import type { EagleAmountSlot, EagleClauseParagraph, EagleFormData, EagleTemplate } from '@/lib/quotation-templates/eagle/types'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[170px_1fr] gap-3 py-1.5 items-start text-xs text-gray-700">
      <span className="font-medium pt-2">{label}{hint && <span className="block text-[10px] font-normal text-gray-400">{hint}</span>}</span>
      <span>{children}</span>
    </label>
  )
}

function Protected({ title, ps, values, open }: { title: string; ps: EagleClauseParagraph[]; values: EagleFormData['amounts']; open?: boolean }) {
  const fill = (t: string) => t.replace(/\{\{(\w+)\}\}/g, (_, k: EagleAmountSlot) => values?.[k] || '____')
  return (
    <details open={open} className="rounded border border-gray-200 bg-gray-50 text-xs text-gray-700">
      <summary className="cursor-pointer px-2.5 py-1.5 font-medium flex items-center gap-1.5 select-none"><Lock size={10} aria-hidden /> {title}<span className="ml-auto text-[10px] font-normal text-gray-400">standard wording</span></summary>
      <div aria-readonly="true" className="px-2.5 pb-2 space-y-1.5 select-text">
        {ps.map((p, i) => <p key={i} style={{ marginLeft: p.indent ?? 0 }} className="whitespace-pre-line">{fill(p.text)}</p>)}
      </div>
    </details>
  )
}

function RolesEditor({ control, index, form }: { control: Control<EagleFormData>; index: number; form: UseFormReturn<EagleFormData> }) {
  const { fields, append, remove } = useFieldArray({ control, name: `vessels.${index}.roles`, keyName: 'rhfKey' })
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between"><span className="text-[11px] font-medium text-gray-600">Co-assureds and roles <span className="text-gray-400">(prints “organisation as role”)</span></span>
        <Button type="button" size="sm" variant="ghost" icon={<Plus size={11} />} onClick={() => append(createBlankRole())}>Add</Button></div>
      {fields.map((f, k) => (
        <div key={f.rhfKey} className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-1">
          <input className="form-input" placeholder="Organisation" aria-label={`Vessel ${index + 1} co-assured ${k + 1} organisation`} {...form.register(`vessels.${index}.roles.${k}.organisation`)} />
          <input className="form-input" placeholder="Role" aria-label={`Vessel ${index + 1} co-assured ${k + 1} role`} {...form.register(`vessels.${index}.roles.${k}.role`)} />
          <Button type="button" size="sm" variant="ghost" icon={<Trash2 size={11} />} onClick={() => remove(k)} aria-label={`Remove co-assured ${k + 1}`} />
        </div>
      ))}
    </div>
  )
}

export function EagleEditor({ template, form }: { template: EagleTemplate; form: UseFormReturn<EagleFormData> }) {
  const { register, control } = form
  const { fields, append, remove } = useFieldArray({ control, name: 'vessels', keyName: 'rhfKey' })
  const values = useWatch({ control }) as EagleFormData
  const err = (v?: string) => wholeAmountError(v ?? '')
  // A plain render function (NOT a component): a component defined inside render would remount — and lose focus — on every keystroke.
  const amountInput = (name: `amounts.${EagleAmountSlot}` | 'limitAmount' | 'premiumTotal' | `vessels.${number}.annualPremium` | `vessels.${number}.limit`, label: string) => {
    const v = name.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], values) as string | undefined
    const e = err(v)
    return (
      <div>
        <input className={`form-input text-right ${e ? 'error' : ''}`} inputMode="numeric" aria-label={label} {...register(name)} />
        {e && <p className="text-[11px] text-[#8c1f1f] mt-0.5">{e}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <section className="card">
        <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Quotation details</h3></div>
        <div className="card-body">
          <Field label={template.quotationNoLabel}><input className="form-input" aria-label="Quotation No." {...register('reference')} /></Field>
          {template.headerRows.map((r) => {
            if (r.fixed) return <Field key={r.label} label={r.label}><span className="block rounded border border-gray-200 bg-gray-50 px-2 py-1.5">{r.fixed} <Lock size={9} className="inline text-gray-400" aria-hidden /></span></Field>
            if (r.field === 'limitAmount') return (
              <Field key={r.label} label={r.label} hint={`prints “${r.prefix}…${r.suffix}”`}>{amountInput('limitAmount', 'Limits amount')}</Field>
            )
            return (
              <Field key={r.label} label={r.label} hint={r.suffix ? `“${r.suffix.trim()}” is added automatically` : undefined}>
                <input className="form-input" aria-label={r.label} {...register(r.field!)} />
              </Field>
            )
          })}
          <Field label="Date (signature area)"><input type="date" className="form-input w-44" aria-label="Issue date" {...register('issueDate')} /></Field>
        </div>
      </section>

      <section className="card border-l-4 border-l-navy-500">
        <div className="card-header"><div><h3 className="text-sm font-semibold text-gray-800">Standard wording and typed amounts</h3><p className="text-[11px] text-gray-500 mt-0.5">Printed in source order. Wording is protected; only the amounts below it can be typed.</p></div></div>
        <div className="card-body space-y-2">
          <Protected title="Introduction (page 1)" ps={template.intro} values={values?.amounts} />
          <Protected title="Fair presentation (page 2)" ps={template.fairPresentation} values={values?.amounts} />
          {template.body.map((el) => {
            if (el.kind === 'bar') return <div key={el.id} className="text-[11px] font-semibold text-center border border-gray-400 py-0.5 mt-2">{el.text}</div>
            const slots = Array.from(new Set(el.paragraphs.flatMap((p) => Array.from(p.text.matchAll(/\{\{(\w+)\}\}/g)).map((m) => m[1] as EagleAmountSlot))))
            return (
              <div key={el.id} className="space-y-1">
                <Protected title={el.labelLines.join(' ')} ps={el.paragraphs} values={values?.amounts} />
                {slots.map((s) => (
                  <div key={s} className="grid grid-cols-[1fr_150px] gap-2 items-start pl-2 text-xs text-gray-700">
                    <span className="pt-2">{template.amountSlots.find((a) => a.slot === s)?.label ?? s}</span>
                    {amountInput(`amounts.${s}`, template.amountSlots.find((a) => a.slot === s)?.label ?? s)}
                  </div>
                ))}
              </div>
            )
          })}
          <Protected title="Fair presentation (repeated, page 9)" ps={template.fairRepeat} values={values?.amounts} />
        </div>
      </section>

      <section className="card border-l-4 border-l-[#a97b50]">
        <div className="card-header"><div><h3 className="text-sm font-semibold text-gray-800">Vessels, premium and co-assureds</h3><p className="text-[11px] text-gray-500 mt-0.5">One entry per vessel: feeds the vessel table, the premium table and the co-assured table.</p></div>
          <Button type="button" size="sm" icon={<Plus size={12} />} onClick={() => append(createBlankEagleVessel())}>Add vessel</Button></div>
        <div className="card-body space-y-3">
          {fields.length === 0 && <p className="text-xs text-[#8c6d1f]">No vessel: the tables print without rows. (Minimum vessel count is unconfirmed.)</p>}
          {fields.map((f, i) => (
            <div key={f.rhfKey} className="rounded border border-gray-200 p-3" data-testid="vessel-card">
              <div className="flex items-center justify-between mb-2"><span className="text-xs font-medium text-gray-700">Vessel {i + 1}</span>
                <Button type="button" size="sm" variant="ghost" icon={<Trash2 size={12} />} onClick={() => remove(i)} aria-label={`Remove vessel ${i + 1}`}>Remove</Button></div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-gray-600">
                {([['Id', 'vesselId'], ['Vessel', 'name'], ['IMO No.', 'imoNumber'], ['GT', 'grossTonnage'], ['Built', 'builtYear'], ['Type', 'vesselType'], ['Flag', 'flag'], ['Class', 'vesselClass']] as const).map(([label, key]) => (
                  <label key={key}>{label}<input className="form-input mt-0.5" {...register(`vessels.${i}.${key}`)} /></label>
                ))}
                <label>Annual Premium USD{amountInput(`vessels.${i}.annualPremium`, `Vessel ${i + 1} annual premium`)}</label>
                <label>Limit USD{amountInput(`vessels.${i}.limit`, `Vessel ${i + 1} limit`)}</label>
              </div>
              <RolesEditor control={control} index={i} form={form} />
            </div>
          ))}
          <div className="grid grid-cols-[1fr_150px] gap-2 items-start text-xs text-gray-700">
            <span className="pt-2 font-medium">Premium total <span className="text-gray-400 font-normal">(unlabelled sum row under Annual Premium — typed, not calculated)</span></span>
            {amountInput('premiumTotal', 'Premium total')}
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header"><h3 className="text-sm font-semibold text-gray-800">Acceptance and closing</h3></div>
        <div className="card-body space-y-2">
          <Protected title={`${template.acceptance.label} · ${template.acceptance.signatoryLabel}`} ps={[{ text: `${template.acceptance.label}\n${template.acceptance.signatoryLabel}`, gapBefore: 0 }]} values={values?.amounts} />
          <Protected title="Closing paragraph (page 10)" ps={template.disclaimer} values={values?.amounts} />
        </div>
      </section>
    </div>
  )
}