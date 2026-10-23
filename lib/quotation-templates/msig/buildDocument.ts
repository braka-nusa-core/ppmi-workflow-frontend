// FILE: lib/quotation-templates/msig/buildDocument.ts
// Pure function: template (fixed wording) + form data → ordered document
// blocks. Both renderers (HTML preview, PDF) consume ONLY this output, so
// they cannot drift apart in content or order.

import { formatAmount, formatDate } from './format'
import type { MsigDocBlock, MsigDocument, MsigFormData, MsigTemplate, MsigVessel } from './types'

function vesselValue(v: MsigVessel, key: MsigTemplate['vesselFields'][number]['key']): string {
  switch (key) {
    case 'class':        return v.classNotApplicable ? '-' : v.vesselClass
    case 'name':         return v.name
    case 'type':         return v.type
    case 'imoNumber':    return v.imoNumber
    case 'grossTonnage': return v.grossTonnage
    case 'builtYear':    return v.builtYear
    case 'flag':         return v.flag
    case 'portOfRegistry': return v.portOfRegistry
  }
}

export function buildMsigDocument(template: MsigTemplate, data: MsigFormData): MsigDocument {
  const blocks: MsigDocBlock[] = []

  for (const el of template.elements) {
    switch (el.kind) {
      case 'title':
        blocks.push({ type: 'title', text: el.text })
        break
      case 'lead':
        blocks.push({ type: 'lead', text: el.text })
        break
      case 'field':
        blocks.push({ type: 'row', id: el.id, gapBefore: el.gapBefore ?? 0, label: el.label, paragraphs: [{ text: (data[el.field] ?? '').trim() }] })
        break
      case 'text':
        blocks.push({ type: 'row', id: el.id, gapBefore: el.gapBefore ?? 0, fullWidth: el.fullWidth, label: el.label, labelAlign: el.labelAlign, paragraphs: el.paragraphs })
        break
      case 'vessels':
        for (const v of data.vessels) {
          blocks.push({
            type: 'vessel',
            id: `${el.id}-${v.id}`, gapBefore: el.gapBefore ?? 0,
            label: el.label,
            rows: template.vesselFields.map((f) => ({ label: f.label, value: vesselValue(v, f.key).trim() })),
          })
        }
        break
      case 'amount':
        blocks.push({
          type: 'amount', id: el.id, gapBefore: el.gapBefore ?? 0, label: el.label, currency: el.currency,
          amount: formatAmount(data[el.coverage][el.field] ?? ''), remark: el.remark,
        })
        break
      case 'signature': {
        const date = formatDate(data.issueDate ?? '')
        blocks.push({
          type: 'signature', id: el.id, gapBefore: el.gapBefore ?? 0,
          placeDate: date ? `${template.companyName}, ${date}` : template.companyName,
          eoe: el.eoe, acceptLabel: el.acceptLabel, signatoryLabel: el.signatoryLabel,
        })
        break
      }
    }
  }
  return { blocks, footer: template.footer }
}