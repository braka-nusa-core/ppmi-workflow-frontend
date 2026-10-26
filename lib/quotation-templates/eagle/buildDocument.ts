// FILE: lib/quotation-templates/eagle/buildDocument.ts
// Pure function: Eagle template + form data → ordered document blocks. Both
// renderers (HTML preview, PDF) consume ONLY this output.

import { formatDateEagle, formatWhole } from './format'
import type { EagleAmountSlot, EagleDocBlock, EagleDocument, EagleFormData, EagleTemplate, EagleVessel } from './types'

const fill = (text: string, amounts: EagleFormData['amounts']) =>
  text.replace(/\{\{(\w+)\}\}/g, (_, k: EagleAmountSlot) => formatWhole(amounts[k] ?? ''))

const cell = (v: EagleVessel, key: string): string => String((v as unknown as Record<string, unknown>)[key] ?? '').trim()

export function buildEagleDocument(t: EagleTemplate, d: EagleFormData): EagleDocument {
  const blocks: EagleDocBlock[] = []
  const sub = (ps: { text: string; gapBefore: number; indent?: number }[]) => ps.map((p) => ({ ...p, text: fill(p.text, d.amounts) }))

  blocks.push({ type: 'title', text: t.title })
  blocks.push({ type: 'refLine', label: t.quotationNoLabel, value: d.reference.trim() })
  blocks.push({
    type: 'headerRows',
    rows: t.headerRows.map((r) => {
      const raw = r.fixed ?? (r.field ? d[r.field] : '')
      const v = r.amount ? formatWhole(raw) : raw.trim()
      return { label: r.label, value: r.fixed ? r.fixed : `${r.prefix ?? ''}${v}${r.suffix ?? ''}` }
    }),
  })
  blocks.push({ type: 'paragraphs', id: 'intro', gapBefore: 6.6, pitch: 11.4, paragraphs: sub(t.intro) })
  blocks.push({ type: 'dateSignature', date: formatDateEagle(d.issueDate), byLabel: t.signature.byLabel, signatoryLabel: t.signature.signatoryLabel })
  blocks.push({ type: 'paragraphs', id: 'insurer', gapBefore: 2, pitch: 11.4, paragraphs: sub(t.insurerParagraphs) })
  blocks.push({ type: 'paragraphs', id: 'fair', gapBefore: 0, pitch: 14.1, paragraphs: sub(t.fairPresentation) })
  for (const el of t.body) {
    if (el.kind === 'bar') blocks.push({ type: 'bar', id: el.id, text: el.text, gapBefore: 14 })
    else blocks.push({ type: 'row', id: el.id, labelLines: el.labelLines, pitch: el.pitch, paragraphs: sub(el.paragraphs) })
  }
  blocks.push({ type: 'paragraphs', id: 'fair-repeat', gapBefore: 14, pitch: 14.1, paragraphs: sub(t.fairRepeat) })

  const info = t.information
  blocks.push({ type: 'bar', id: 'info', text: info.bar, gapBefore: 14 })
  blocks.push({ type: 'table', id: 'vessels', gapBefore: 24, columns: info.vesselColumns, rows: d.vessels.map((v) => info.vesselColumns.map((c) => cell(v, c.key))) })
  blocks.push({
    type: 'table', id: 'premium', gapBefore: 10, caption: info.caption, columns: info.premiumColumns,
    rows: d.vessels.map((v) => info.premiumColumns.map((c) => (c.key === 'annualPremium' || c.key === 'limit' ? formatWhole(cell(v, c.key)) : cell(v, c.key)))),
    total: { column: 2, value: formatWhole(d.premiumTotal) },
  })
  blocks.push({ type: 'acceptance', label: t.acceptance.label, signatoryLabel: t.acceptance.signatoryLabel })
  blocks.push({ type: 'paragraphs', id: 'disclaimer', gapBefore: 24, pitch: 13.5, fontSize: 11, paragraphs: sub(t.disclaimer) })

  const co = t.coassureds
  blocks.push({ type: 'bar', id: 'coassureds', text: co.bar, bold: true, gapBefore: 14 })
  blocks.push({
    type: 'coassureds', columns: co.columns,
    rows: d.vessels.map((v) => ({
      vessel: v.name.trim(), cover: co.cover,
      lines: v.roles.map((r) => `${r.organisation.trim()}${co.roleJoiner}${r.role.trim()}`),
    })),
  })
  return { blocks, footer: t.footer }
}