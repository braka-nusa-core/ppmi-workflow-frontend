// FILE: components/pni/PniDocumentView.tsx
// The saved P&I quotation shown AS ITS INSURER PAPER (MSIG / Eagle): the same document
// preview the template editor shows while editing, the same PDF renderer behind
// Generate / Export. It renders the SAVED quotation from GET /pni/quotations/:id — no local
// repository, no browser storage — so an edit appears as soon as the detail query refetches.
// Read-only by design: changes are made in the template editor (the Edit action).
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, FileText, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CardSection } from '@/components/ui/Card'
import { getPniTemplateAdapter } from '@/components/quotation-templates/pniTemplates'
import { downloadBlob } from '@/lib/quotation-templates/shared/pdf'
import type { PniQuotationDetail } from '@/types/pni'

export function PniDocumentView({ pni }: { pni: PniQuotationDetail }) {
  const adapter = getPniTemplateAdapter(pni.club.code)
  const rendered = useMemo(() => (adapter ? adapter.render(pni) : null), [adapter, pni])

  const docKey = useMemo(() => JSON.stringify(rendered?.document ?? null), [rendered])
  const [busy, setBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdf, setPdf] = useState<string | null>(null)

  // A changed document (after an edit) makes any generated PDF stale — drop it rather than show old values.
  useEffect(() => { setPdf((old) => { if (old) URL.revokeObjectURL(old); return null }) }, [docKey])
  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf) }, [pdf])

  if (!adapter || !rendered) return null

  const makePdf = () => adapter.renderPdf(rendered.document)
  const previewPdf = async () => {
    setBusy(true); setPdfError(null)
    try { const url = URL.createObjectURL(await makePdf()); setPdf((old) => { if (old) URL.revokeObjectURL(old); return url }) }
    catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const exportPdf = async () => {
    setBusy(true); setPdfError(null)
    try { downloadBlob(await makePdf(), adapter.fileName(pni)) }
    catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="flex flex-col gap-4 min-w-0" data-testid="pni-document-view">
      <CardSection
        title={`Quotation document — ${rendered.template.insurerName}`}
        description="The saved quotation as it prints on the insurer’s paper. Read-only — use Edit to change it."
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-[11px] text-gray-600" data-testid="document-readonly-badge"><Lock size={10} aria-hidden /> Saved · read-only</span>
          <span className="text-[11px] text-[#9aa3ad]">Template version <code>{rendered.template.templateVersion}</code> · {rendered.template.sourceNote}</span>
          <span className="ml-auto flex gap-2">
            <Button size="sm" icon={<FileText size={12} />} onClick={() => void previewPdf()} loading={busy}>Generate PDF preview</Button>
            <Button size="sm" variant="primary" icon={<Download size={12} />} onClick={() => void exportPdf()} loading={busy}>Export PDF</Button>
          </span>
        </div>
      </CardSection>

      {rendered.gaps.length > 0 && (
        <div className="rounded border border-[#e6d3a3] bg-[#fdf8e8] px-3 py-2 text-xs text-[#6b5413]" role="note" data-testid="template-gaps">
          <strong>Not filled on this document ({rendered.gaps.length})</strong> — these values are missing from the saved quotation and are left blank, not invented:
          <ul className="list-disc pl-4 mt-1 space-y-0.5">
            {rendered.gaps.map((g) => <li key={`${g.field}|${g.message}`}><strong>{g.field}:</strong> {g.message}</li>)}
          </ul>
        </div>
      )}

      {pdfError && <div className="rounded border border-[#f5b4b4] bg-[#fdecea] px-3 py-2 text-xs text-[#9b2020]" role="alert">PDF generation failed: {pdfError}</div>}
      {pdf && (
        <CardSection title="PDF preview">
          <iframe title={`${adapter.label} PDF preview`} src={pdf} className="w-full h-[78vh] rounded border border-gray-300 bg-white" />
        </CardSection>
      )}

      <CardSection title="Document" description="Continuous preview of the document; the exported PDF paginates onto A4">
        <div data-testid="pni-template-preview"><adapter.Preview document={rendered.document} /></div>
      </CardSection>

      {rendered.notPrinted.length > 0 && (
        <details className="card" data-testid="template-not-printed">
          <summary className="card-body cursor-pointer text-xs font-semibold text-[#232b34]">
            Quotation data not printed on this paper ({rendered.notPrinted.reduce((n, s) => n + s.items.length, 0)})
          </summary>
          <div className="card-body pt-0 text-xs space-y-3">
            <p className="text-[#9aa3ad]">Saved on the quotation but without a place on this insurer’s paper (its wording is fixed). Nothing here is lost or edited.</p>
            {rendered.notPrinted.map((s) => (
              <div key={s.title}>
                <div className="font-semibold text-[#4d5966]">{s.title}</div>
                <ul className="list-disc pl-4 mt-0.5 space-y-0.5">{s.items.map((it) => <li key={it} className="break-words">{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
