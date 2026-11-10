// FILE: components/quotation-templates/TemplateWorkspace.tsx
// Generic workspace for an insurer template. Talks to data ONLY through the
// module's repository (the local mock for the prototype, the real P&I API for
// the creation flow — see repositoryTypes.ts). Layout is driven by the width
// of the workspace itself: side by side when there is room (editor + preview),
// otherwise Edit / Document / PDF tabs.

'use client'

import { Download, FileText, Save } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch, type DefaultValues, type FieldValues } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/config/routes'
import { downloadBlob } from '@/lib/quotation-templates/shared/pdf'
import type { SavedTemplateQuotation } from '@/lib/quotation-templates/shared/repositoryTypes'
import { useElementWidth } from '@/components/quotation-templates/shared/useElementWidth'
import type { TemplateModule } from './templateModule'

const SIDE_BY_SIDE_MIN_WIDTH = 1180 // workspace width (px) needed for editor + preview side by side

type View = 'edit' | 'document' | 'pdf'

interface WorkspaceProps<TData extends FieldValues, TTemplate extends { templateId: string; templateVersion: string }, TDoc> {
  module: TemplateModule<TData, TTemplate, TDoc>
  /** Open this saved quotation as soon as the template is ready (deep link). */
  initialId?: string
  /** A save went through (create or update). */
  onSaved?: (rec: SavedTemplateQuotation<TData>) => void
  /** “New blank” was used — the host resets whatever it keeps next to the form. */
  onNew?: () => void
}

export function TemplateWorkspace<TData extends FieldValues, TTemplate extends { templateId: string; templateVersion: string }, TDoc>(
  { module: m, initialId, onSaved, onNew }: WorkspaceProps<TData, TTemplate, TDoc>,
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
  const [actionError, setActionError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const backend = repo.persistence === 'backend'
  const [view, setView] = useState<View>('edit')
  const [busy, setBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdf, setPdf] = useState<{ url: string; key: string } | null>(null)

  const refreshList = useCallback(async () => {
    try { setSaved(await repo.listQuotations()) } catch (e) { setActionError(`Could not load saved quotations: ${e instanceof Error ? e.message : String(e)}`) }
  }, [repo])

  const startNew = useCallback(async () => {
    const tpl = await repo.getTemplate(m.templateId)
    if (!tpl) { setTemplateError(`The ${m.label} template could not be loaded.`); return }
    setTemplateError(null); setTemplate(tpl)
    form.reset(m.createBlank() as DefaultValues<TData>) // blank data: the template never injects values
    setCurrent({ templateVersion: tpl.templateVersion }); setPdf(null)
    setActionError(null); setWarning(null)
    setNotice('New quotation — standard wording loaded from the template.')
  }, [repo, form, m])

  const openSaved = useCallback(async (id: string, skipConfirm = false) => {
    if (!id) return
    if (!skipConfirm && form.formState.isDirty && !window.confirm('Discard unsaved changes?')) return
    setActionError(null); setWarning(null)
    let rec: SavedTemplateQuotation<TData> | null
    try { rec = await repo.getQuotation(id) } catch (e) { setActionError(`Could not open the quotation: ${e instanceof Error ? e.message : String(e)}`); return }
    if (!rec) { setNotice(backend ? `Quotation not found, or it is not a ${m.label} quotation.` : 'Saved quotation not found.'); return }
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
    setPdf(null); setNotice(`Opened saved quotation ${rec.quotationNumber ? `${rec.quotationNumber} · ` : ''}${m.savedLabel(rec.data)} (template ${rec.templateVersion}).`)
  }, [repo, form, m, backend])

  // Mount: blank form, then the deep-linked quotation if there is one.
  useEffect(() => {
    void (async () => { await startNew(); if (initialId) await openSaved(initialId, true) })()
    void refreshList()
  }, [startNew, refreshList, openSaved, initialId])
  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf.url) }, [pdf])

  const save = async () => {
    if (!template || !current) return
    setActionError(null); setWarning(null)
    const data = form.getValues() as TData
    try {
      const rec = await repo.saveQuotation({ id: current.id, templateId: template.templateId, templateVersion: current.templateVersion, data })
      setCurrent({ id: rec.id, templateVersion: rec.templateVersion })
      // The data as stored — for the backend that is what a reload would show, not what was typed.
      form.reset(rec.data as DefaultValues<TData>); await refreshList()
      setNotice(backend ? `Saved to the PPMI system${rec.quotationNumber ? ` as ${rec.quotationNumber}` : ''}.` : 'Saved to the local mock repository (this browser only).')
      if (rec.warning) setWarning(rec.warning)
      onSaved?.(rec)
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e))
    }
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
        {backend ? (
          <><strong>Quotations are saved to the PPMI system.</strong> The template wording is reproduced from the supplied {template ? m.insurerName(template) : m.label} sample — not yet confirmed by PPMI as the approved paper.</>
        ) : (
          <><strong>Prototype — mock data.</strong> Quotations are stored in this browser only (local mock repository). No backend request is made, and the template wording is reproduced from the supplied {template ? m.insurerName(template) : m.label} sample — not yet confirmed by PPMI as the approved paper.</>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="form-input w-72 max-w-full" aria-label="Open saved quotation" defaultValue="" onChange={(e) => { void openSaved(e.target.value); e.target.value = '' }}>
          <option value="">{backend ? 'Open saved quotation…' : 'Open saved (mock)…'}</option>
          {saved.map((s) => <option key={s.id} value={s.id}>{m.savedLabel(s.data)}</option>)}
        </select>
        <Button type="button" onClick={() => { if (!form.formState.isDirty || window.confirm('Discard unsaved changes?')) { void startNew(); onNew?.() } }}>New blank</Button>
        <Button type="button" variant="primary" icon={<Save size={14} />} onClick={() => void save()} disabled={!template}>{backend ? 'Save quotation' : 'Save draft (mock)'}</Button>
        <Button type="button" size="sm" icon={<FileText size={12} />} onClick={() => void previewPdf()} loading={busy} disabled={!doc || errors.length > 0}>Generate PDF preview</Button>
        <Button type="button" size="sm" variant="primary" icon={<Download size={12} />} onClick={() => void exportPdf()} loading={busy} disabled={!doc || errors.length > 0}>Export PDF</Button>
        {template && current && <span className="text-[11px] text-gray-500 ml-auto">Template: {m.insurerName(template)} · pinned version <code>{current.templateVersion}</code></span>}
      </div>
      {notice && (
        <p className="text-xs text-gray-600" role="status" data-testid="workspace-notice">
          {notice}
          {backend && current?.id && (<> <Link href={ROUTES.quotations.detail(current.id)} className="underline font-semibold text-navy-600">View quotation</Link></>)}
        </p>
      )}
      {warning && <div className="rounded border border-[#e6d3a3] bg-[#fdf8e8] px-3 py-2 text-xs text-[#6b5413]" role="alert" data-testid="workspace-warning">{warning}</div>}
      {actionError && <div className="rounded border border-[#f5b4b4] bg-[#fdecea] px-3 py-2 text-xs text-[#9b2020] whitespace-pre-line" role="alert" data-testid="workspace-error">{actionError}</div>}
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