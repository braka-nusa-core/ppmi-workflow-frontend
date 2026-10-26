// FILE: components/quotation-templates/TemplateWorkspace.tsx
// Generic workspace for an insurer template. Talks to data ONLY through the
// module's repository (currently a local mock). Layout is driven by the width
// of the workspace itself: side by side when there is room (editor + preview),
// otherwise Edit / Document / PDF tabs.

'use client'

import { Download, FileText, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch, type DefaultValues, type FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { downloadBlob } from '@/lib/quotation-templates/shared/pdf'
import type { SavedTemplateQuotation } from '@/lib/quotation-templates/shared/localMockRepository'
import { useElementWidth } from '@/components/quotation-templates/shared/useElementWidth'
import type { TemplateModule } from './templateModule'

const SIDE_BY_SIDE_MIN_WIDTH = 1180 // workspace width (px) needed for editor + preview side by side

type View = 'edit' | 'document' | 'pdf'

export function TemplateWorkspace<TData extends FieldValues, TTemplate extends { templateId: string; templateVersion: string }, TDoc>(
  { module: m }: { module: TemplateModule<TData, TTemplate, TDoc> },
) {
  const repo = useMemo(() => m.repo(), [m])
  const form = useForm<TData>({ defaultValues: m.createBlank() as DefaultValues<TData> })
  const values = useWatch({ control: form.control }) as TData

  const rootRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(rootRef)
  const wide = width >= SIDE_BY_SIDE_MIN_WIDTH

  const [template, setTemplate] = useState<TTemplate | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [current, setCurrent] = useState<{ id?: string; templateVersion: string } | null>(null)
  const [saved, setSaved] = useState<SavedTemplateQuotation<TData>[]>([])
  const [notice, setNotice] = useState('')
  const [view, setView] = useState<View>('edit')
  const [busy, setBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdf, setPdf] = useState<{ url: string; key: string } | null>(null)

  const refreshList = useCallback(async () => setSaved(await repo.listQuotations()), [repo])

  const startNew = useCallback(async () => {
    const tpl = await repo.getTemplate(m.templateId)
    if (!tpl) { setTemplateError(`The ${m.label} template could not be loaded.`); return }
    setTemplateError(null); setTemplate(tpl)
    form.reset(m.createBlank() as DefaultValues<TData>) // blank data: the template never injects values
    setCurrent({ templateVersion: tpl.templateVersion }); setPdf(null)
    setNotice('New quotation — standard wording loaded from the template.')
  }, [repo, form, m])

  useEffect(() => { void startNew(); void refreshList() }, [startNew, refreshList])
  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf.url) }, [pdf])

  const openSaved = async (id: string) => {
    if (!id) return
    if (form.formState.isDirty && !window.confirm('Discard unsaved changes?')) return
    const rec = await repo.getQuotation(id)
    if (!rec) { setNotice('Saved quotation not found.'); return }
    // pinned version: the quotation is shown with the template version it was saved with
    const tpl = await repo.getTemplate(rec.templateId, rec.templateVersion)
    if (!tpl) {
      setTemplate(null)
      setTemplateError(`Template version “${rec.templateVersion}” is not available. The saved data is untouched; editing and export stay disabled until that version can be retrieved.`)
      return
    }
    setTemplateError(null); setTemplate(tpl)
    form.reset(rec.data as DefaultValues<TData>) // saved values exactly as stored — no template defaults merged in
    setCurrent({ id: rec.id, templateVersion: rec.templateVersion })
    setPdf(null); setNotice(`Opened saved quotation ${m.savedLabel(rec.data)} (template ${rec.templateVersion}).`)
  }

  const save = async () => {
    if (!template || !current) return
    const data = form.getValues() as TData
    const rec = await repo.saveQuotation({ id: current.id, templateId: template.templateId, templateVersion: current.templateVersion, data })
    setCurrent({ id: rec.id, templateVersion: rec.templateVersion })
    form.reset(data as DefaultValues<TData>); await refreshList(); setNotice('Saved to the local mock repository (this browser only).')
  }

  const doc = useMemo(() => (template ? m.buildDocument(template, values) : null), [template, values, m])
  const docKey = useMemo(() => JSON.stringify(doc), [doc])
  const errors = useMemo(() => m.validate(values), [values, m])

  const makePdf = async () => { if (!doc) throw new Error('No document'); return m.renderPdf(doc) }
  const previewPdf = async () => {
    setBusy(true); setPdfError(null)
    try {
      const blob = await makePdf()
      setPdf((old) => { if (old) URL.revokeObjectURL(old.url); return { url: URL.createObjectURL(blob), key: docKey } })
      setView('pdf')
    } catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const exportPdf = async () => {
    setBusy(true); setPdfError(null)
    try { downloadBlob(await makePdf(), m.fileName(values)) }
    catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  const tabBtn = (v: View, label: string) => (
    <button type="button" role="tab" aria-selected={view === v} className={`px-3 py-1.5 ${view === v ? 'bg-navy-600 text-white' : 'bg-white'}`} onClick={() => setView(v)}>{label}</button>
  )
  // In side-by-side mode the editor is always visible, so the right panel only toggles document / PDF.
  const rightView: 'document' | 'pdf' = view === 'pdf' ? 'pdf' : 'document'
  const showEditor = wide || view === 'edit'
  const showRight = wide || view !== 'edit'
  const panel = (wide ? rightView : view) === 'pdf' ? (
    pdf ? (
      <>
        {pdf.key !== docKey && <p className="text-[11px] text-[#8c6d1f]">This PDF is out of date — generate it again to include your latest edits.</p>}
        <iframe title={`${m.label} PDF preview`} src={pdf.url} className="w-full h-[78vh] rounded border border-gray-300 bg-white" />
      </>
    ) : <p className="text-xs text-gray-500">No PDF generated yet — use “Generate PDF preview”.</p>
  ) : doc ? (
    <>
      <p className="text-[11px] text-gray-500">Continuous preview of the document model, scaled to fit. The exported PDF paginates onto A4.</p>
      <m.Preview document={doc} />
    </>
  ) : null

  return (
    <div ref={rootRef} className="space-y-3 min-w-0" data-layout={wide ? 'side-by-side' : 'tabbed'}>
      <div className="rounded border border-[#e6d3a3] bg-[#fdf8e8] px-3 py-2 text-xs text-[#6b5413]" role="note">
        <strong>Prototype — mock data.</strong> Quotations are stored in this browser only (local mock repository). No backend request is made, and the template wording is reproduced from the supplied {m.insurerName(template ?? ({} as TTemplate)) || m.label} sample — not yet confirmed by PPMI as the approved paper.
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="form-input w-72 max-w-full" aria-label="Open saved quotation" defaultValue="" onChange={(e) => { void openSaved(e.target.value); e.target.value = '' }}>
          <option value="">Open saved (mock)…</option>
          {saved.map((s) => <option key={s.id} value={s.id}>{m.savedLabel(s.data)}</option>)}
        </select>
        <Button type="button" onClick={() => { if (!form.formState.isDirty || window.confirm('Discard unsaved changes?')) void startNew() }}>New blank</Button>
        <Button type="button" variant="primary" icon={<Save size={14} />} onClick={() => void save()} disabled={!template}>Save draft (mock)</Button>
        <Button type="button" size="sm" icon={<FileText size={12} />} onClick={() => void previewPdf()} loading={busy} disabled={!doc || errors.length > 0}>Generate PDF preview</Button>
        <Button type="button" size="sm" variant="primary" icon={<Download size={12} />} onClick={() => void exportPdf()} loading={busy} disabled={!doc || errors.length > 0}>Export PDF</Button>
        {template && current && <span className="text-[11px] text-gray-500 ml-auto">Template: {m.insurerName(template)} · pinned version <code>{current.templateVersion}</code></span>}
      </div>
      {notice && <p className="text-xs text-gray-600" role="status">{notice}</p>}
      {templateError && <div className="rounded border border-[#f5b4b4] bg-[#fdecea] px-3 py-2 text-xs text-[#9b2020]" role="alert">{templateError}</div>}
      {errors.length > 0 && <ul className="text-[11px] text-[#9b2020] list-disc pl-4">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      {pdfError && <div className="rounded border border-[#f5b4b4] bg-[#fdecea] px-3 py-2 text-xs text-[#9b2020]" role="alert">PDF generation failed: {pdfError}</div>}

      {template && doc && (
        <>
          {!wide && (
            <div role="tablist" aria-label="Quotation workspace" className="inline-flex rounded border border-gray-300 overflow-hidden text-xs">
              {tabBtn('edit', 'Edit')}{tabBtn('document', 'Document preview')}{tabBtn('pdf', 'PDF preview')}
            </div>
          )}
          <div className={wide ? 'grid gap-4 items-start' : ''} style={wide ? { gridTemplateColumns: 'minmax(440px, 560px) minmax(0, 1fr)' } : undefined}>
            <div className={showEditor ? 'min-w-0' : 'hidden'}><m.Editor template={template} form={form} /></div>
            <div className={`${showRight ? 'min-w-0 space-y-2' : 'hidden'} ${wide ? 'sticky top-[72px] max-h-[calc(100vh-88px)] overflow-y-auto' : ''}`}>
              {wide && (
                <div role="tablist" aria-label="Preview" className="inline-flex rounded border border-gray-300 overflow-hidden text-xs">
                  {tabBtn('document', 'Document preview')}{tabBtn('pdf', 'PDF preview')}
                </div>
              )}
              {panel}
            </div>
          </div>
        </>
      )}
    </div>
  )
}