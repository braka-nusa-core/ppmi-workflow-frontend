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
import { useForm, useWatch, type DefaultValues, type FieldValues, type Path, type PathValue } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/config/routes'
import { clientToFields, planClientPrefill } from '@/lib/quotation-templates/shared/clientPrefill'
import { downloadBlob } from '@/lib/quotation-templates/shared/pdf'
import type { SavedTemplateQuotation } from '@/lib/quotation-templates/shared/repositoryTypes'
import { useElementWidth } from '@/components/quotation-templates/shared/useElementWidth'
import { usePreviewSync } from '@/components/quotation-templates/shared/usePreviewSync'
import type { TemplateModule } from './templateModule'

const SIDE_BY_SIDE_MIN_WIDTH = 1180 // workspace width (px) needed for editor + preview side by side

type View = 'edit' | 'document' | 'pdf'

/** A client the user just picked in the host's context panel. `seq` makes every pick a distinct event. */
export interface ClientPrefillRequest { seq: number; name: string; address: string | null }

/** A vessel candidate the user selected in the host's context panel. `seq` makes every selection a distinct event. */
export interface VesselPrefillRequest { seq: number; vessels: unknown[] }

/** Client change signal — clears vessels derived from previous client. `seq` makes every change a distinct event. */
export interface ClearVesselsRequest { seq: number }

interface WorkspaceProps<TData extends FieldValues, TTemplate extends { templateId: string; templateVersion: string }, TDoc> {
  module: TemplateModule<TData, TTemplate, TDoc>
  /** Open this saved quotation as soon as the template is ready (deep link). */
  initialId?: string
  /** A save went through (create or update). */
  onSaved?: (rec: SavedTemplateQuotation<TData>) => void
  /** "New blank" was used — the host resets whatever it keeps next to the form. */
  onNew?: () => void
  /** Existing client chosen by the user: fills the paper's client fields (see lib/.../clientPrefill.ts). */
  clientPrefill?: ClientPrefillRequest | null
  /** Vessels selected by the user for the selected existing client. */
  vesselPrefill?: VesselPrefillRequest | null
  /** Clear vessels when client changes. */
  clearVessels?: ClearVesselsRequest | null
  /** Called when vessels in form change (for tracking added vessel IDs). */
  onVesselsChange?: (vesselIds: string[]) => void
}

export function TemplateWorkspace<TData extends FieldValues, TTemplate extends { templateId: string; templateVersion: string }, TDoc>(
  { module: m, initialId, onSaved, onNew, clientPrefill, vesselPrefill, clearVessels, onVesselsChange }: WorkspaceProps<TData, TTemplate, TDoc>,
) {
  const repo = useMemo(() => m.repo(), [m])
  const form = useForm<TData>({ defaultValues: m.createBlank() as DefaultValues<TData> })
  const values = useWatch({ control: form.control }) as TData

  const rootRef = useRef<HTMLDivElement>(null)
  const editorPaneRef = useRef<HTMLDivElement>(null)
  const previewPaneRef = useRef<HTMLDivElement>(null)
  const width = useElementWidth(rootRef)
  const wide = width >= SIDE_BY_SIDE_MIN_WIDTH
  const dirty = form.formState.isDirty
  // Values this workspace auto-filled from a client (so a later client change never overwrites the user's own typing).
  const autofilled = useRef<Record<string, string>>({})
  const appliedSeq = useRef(0)
  const clearedSeq = useRef(0)

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
    autofilled.current = {}
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
    autofilled.current = {}
    setCurrent({ id: rec.id, templateVersion: rec.templateVersion })
    setPdf(null); setNotice(`Opened saved quotation ${rec.quotationNumber ? `${rec.quotationNumber} · ` : ''}${m.savedLabel(rec.data)} (template ${rec.templateVersion}).`)
  }, [repo, form, m, backend])

  // Mount: blank form, then the deep-linked quotation if there is one.
  useEffect(() => {
    void (async () => { await startNew(); if (initialId) await openSaved(initialId, true) })()
    void refreshList()
  }, [startNew, refreshList, openSaved, initialId])
  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf.url) }, [pdf])

  // Existing client picked → fill the paper's client fields from that client's real data. Never overwrites typed values.
  useEffect(() => {
    if (!clientPrefill || !template || !current || !m.clientFields) return
    if (clientPrefill.seq === appliedSeq.current) return
    appliedSeq.current = clientPrefill.seq
    const map = m.clientFields
    const next = clientToFields(map, clientPrefill)
    const all = form.getValues() as unknown as Record<string, unknown>
    const currentValues = Object.fromEntries(Object.keys(next).map((k) => [k, typeof all[k] === 'string' ? (all[k] as string) : '']))
    const plan = planClientPrefill({ current: currentValues, next, autofilled: autofilled.current })
    autofilled.current = plan.autofilled
    for (const [field, value] of Object.entries(plan.set)) {
      form.setValue(field as Path<TData>, value as PathValue<TData, Path<TData>>, { shouldDirty: true })
    }
    const label = (f: string) => (map.name.field === f ? map.name.label : map.address?.label ?? f)
    const filled = Object.entries(plan.set).filter(([, v]) => v !== '').map(([f]) => label(f))
    const parts: string[] = []
    if (filled.length) parts.push(`Filled ${filled.join(' and ')} from the selected client — review and edit before saving.`)
    if (plan.kept.length) parts.push(`${plan.kept.map(label).join(' and ')} already had your own text, so it was left unchanged.`)
    if (!parts.length) parts.push('The selected client has no data for the fields on this paper.')
    setNotice(parts.join(' '))
  }, [clientPrefill, template, current, form, m])

  // Vessels selected → append to vessels array. Runs after clientPrefill so user sees updated list.
  useEffect(() => {
    if (!vesselPrefill || !template || !current) return
    const formData = form.getValues() as unknown as Record<string, unknown>
    if (!Array.isArray(formData.vessels)) return
    
    // Filter out genuinely empty placeholder vessels (never touched by user)
    // A placeholder is empty if it has no name AND no identifying vessel info
    const isEmptyPlaceholder = (v: Record<string, unknown>) =>
      !v.name && !v.vesselId && !v.imoNumber
    
    const existing = formData.vessels as Array<Record<string, unknown>>
    const nonEmpty = existing.filter(v => !isEmptyPlaceholder(v))
    
    // Dedupe by vessel ID (prevent duplicate append)
    const existingIds = new Set(nonEmpty.map(v => String(v.id)))
    const newVessels = (vesselPrefill.vessels as Array<Record<string, unknown>>).filter(v => !existingIds.has(String(v.id)))
    
    if (newVessels.length === 0) {
      setNotice('Selected vessels are already in the quotation.')
      return
    }
    
    // Replace with non-empty vessels + new vessels (no empty placeholder at start)
    form.setValue('vessels' as Path<TData>, [...nonEmpty, ...newVessels] as PathValue<TData, Path<TData>>, { shouldDirty: true })
    setNotice(`Added ${newVessels.length} vessel${newVessels.length !== 1 ? 's' : ''} from the selected client — review and edit before saving.`)
  }, [vesselPrefill, template, current, form])

  // Sync vessel IDs to parent when vessels change in form
  useEffect(() => {
    if (!onVesselsChange) return
    const formData = form.getValues() as unknown as Record<string, unknown>
    if (!Array.isArray(formData.vessels)) return
    
    const vesselIds = (formData.vessels as Array<Record<string, unknown>>)
      .filter(v => v.id && String(v.id).trim())
      .map(v => String(v.id))
    
    onVesselsChange(vesselIds)
  }, [form, onVesselsChange, values]) // values triggers on any form change

  // Clear vessels when client changes (prevent old client vessels leaking into new client)
  useEffect(() => {
    if (!clearVessels || !template || !current) return
    if (clearVessels.seq === clearedSeq.current) return
    clearedSeq.current = clearVessels.seq
    
    const formData = form.getValues() as unknown as Record<string, unknown>
    if (!Array.isArray(formData.vessels)) return
    
    // Reset vessels to single empty placeholder (matching createBlank behavior)
    const blankData = m.createBlank() as Record<string, unknown>
    if (Array.isArray(blankData.vessels)) {
      form.setValue('vessels' as Path<TData>, blankData.vessels as PathValue<TData, Path<TData>>, { shouldDirty: true })
      setNotice('Client changed — vessel list cleared.')
    }
  }, [clearVessels, template, current, form, m])

  // Closing the tab / reloading with unsaved edits asks first.
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

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

  // Editor focus/click → matching section of the preview scrolls into view. Only while both panes are on screen
  // (side-by-side layout) and mounted — `ready` re-attaches the listener once the editor exists.
  usePreviewSync(editorPaneRef, previewPaneRef, wide && Boolean(template && doc))

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
        <Button type="button" variant="primary" icon={<Save size={14} />} onClick={() => void save()} disabled={!template}>{backend ? (current?.id ? 'Save changes' : 'Save quotation') : 'Save draft (mock)'}</Button>
        <span className={`text-[11px] ${dirty ? 'text-[#8c6d1f] font-semibold' : 'text-gray-400'}`} data-testid="save-state" role="status">{dirty ? 'Unsaved changes' : current?.id ? 'All changes saved' : 'Not saved yet'}</span>
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
            <div ref={editorPaneRef} className={showEditor ? 'min-w-0' : 'hidden'}><m.Editor template={template} form={form} /></div>
            <div ref={previewPaneRef} className={`${showRight ? 'min-w-0 space-y-2' : 'hidden'} ${wide ? 'sticky top-[72px] max-h-[calc(100vh-88px)] overflow-y-auto' : ''}`}>
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