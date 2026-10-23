// FILE: components/quotation-templates/msig/MsigPrototypeClient.tsx
// Workspace for the MSIG template prototype. Talks to data ONLY through
// MsigQuotationRepository (currently a local mock — see repository.ts).

'use client'

import { Download, FileText, Save } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { TEMPLATE_INSURERS } from '@/lib/quotation-templates/insurers'
import { buildMsigDocument } from '@/lib/quotation-templates/msig/buildDocument'
import { downloadBlob, renderMsigPdfBlob } from '@/lib/quotation-templates/msig/exportPdf'
import { createBlankMsigData } from '@/lib/quotation-templates/msig/fixtures'
import { validateMsigData } from '@/lib/quotation-templates/msig/format'
import { createMsigRepository, type MsigSavedQuotation } from '@/lib/quotation-templates/msig/repository'
import { MSIG_TEMPLATE_ID } from '@/lib/quotation-templates/msig/template'
import { MSIG_CLUB_FORMAT, type MsigFormData, type MsigTemplate } from '@/lib/quotation-templates/msig/types'
import { MsigEditor } from './MsigEditor'
import { MsigPreview } from './MsigPreview'

function MsigWorkspace() {
  const repo = useMemo(() => createMsigRepository(), [])
  const form = useForm<MsigFormData>({ defaultValues: createBlankMsigData() })
  const values = useWatch({ control: form.control }) as MsigFormData

  const [template, setTemplate] = useState<MsigTemplate | null>(null)
  const [templateError, setTemplateError] = useState<string | null>(null)
  const [current, setCurrent] = useState<{ id?: string; templateVersion: string } | null>(null)
  const [saved, setSaved] = useState<MsigSavedQuotation[]>([])
  const [notice, setNotice] = useState('')
  const [tab, setTab] = useState<'document' | 'pdf'>('document')
  const [busy, setBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdf, setPdf] = useState<{ url: string; key: string } | null>(null)

  const refreshList = useCallback(async () => setSaved(await repo.listQuotations()), [repo])

  const startNew = useCallback(async () => {
    const tpl = await repo.getTemplate(MSIG_TEMPLATE_ID)
    if (!tpl) { setTemplateError('The MSIG template could not be loaded.'); return }
    setTemplateError(null); setTemplate(tpl)
    form.reset(createBlankMsigData())       // blank data: the template never injects values
    setCurrent({ templateVersion: tpl.templateVersion }); setNotice('New quotation — standard wording loaded from the template.')
  }, [repo, form])

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
    form.reset(rec.data)                     // saved values exactly as stored — no template defaults merged in
    setCurrent({ id: rec.id, templateVersion: rec.templateVersion })
    setPdf(null); setNotice(`Opened saved quotation ${rec.data.reference || rec.id} (template ${rec.templateVersion}).`)
  }

  const save = async () => {
    if (!template || !current) return
    const data = form.getValues()
    const rec = await repo.saveQuotation({ id: current.id, templateId: template.templateId, templateVersion: current.templateVersion, data })
    setCurrent({ id: rec.id, templateVersion: rec.templateVersion })
    form.reset(data); await refreshList(); setNotice('Saved to the local mock repository (this browser only).')
  }

  const doc = useMemo(() => (template ? buildMsigDocument(template, values) : null), [template, values])
  const docKey = useMemo(() => JSON.stringify(doc), [doc])
  const errors = useMemo(() => validateMsigData(values), [values])

  const makePdf = async () => {
    if (!doc) throw new Error('No document')
    return renderMsigPdfBlob(doc)
  }
  const previewPdf = async () => {
    setBusy(true); setPdfError(null)
    try {
      const blob = await makePdf()
      setPdf((old) => { if (old) URL.revokeObjectURL(old.url); return { url: URL.createObjectURL(blob), key: docKey } })
      setTab('pdf')
    } catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const exportPdf = async () => {
    setBusy(true); setPdfError(null)
    try { downloadBlob(await makePdf(), `MSIG-Quotation-${(values.reference || 'draft').replace(/[^\w.-]+/g, '_')}.pdf`) }
    catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="space-y-3">
      <div className="rounded border border-[#e6d3a3] bg-[#fdf8e8] px-3 py-2 text-xs text-[#6b5413]" role="note">
        <strong>Prototype — mock data.</strong> Quotations are stored in this browser only (local mock repository). No backend request is made, and the template wording is reproduced from the supplied MSIG sample — not yet confirmed by PPMI as the approved paper.
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select className="form-input w-72" aria-label="Open saved quotation" defaultValue="" onChange={(e) => { void openSaved(e.target.value); e.target.value = '' }}>
          <option value="">Open saved (mock)…</option>
          {saved.map((s) => <option key={s.id} value={s.id}>{(s.data.reference || '(no reference)')} — {s.data.assured || '(no assured)'}</option>)}
        </select>
        <Button type="button" onClick={() => { if (!form.formState.isDirty || window.confirm('Discard unsaved changes?')) void startNew() }}>New blank</Button>
        <Button type="button" variant="primary" icon={<Save size={14} />} onClick={() => void save()} disabled={!template}>Save draft (mock)</Button>
        {template && current && <span className="text-[11px] text-gray-500 ml-auto">Template: {template.insurerName} · pinned version <code>{current.templateVersion}</code></span>}
      </div>
      {notice && <p className="text-xs text-gray-600" role="status">{notice}</p>}
      {templateError && <div className="rounded border border-[#f5b4b4] bg-[#fdecea] px-3 py-2 text-xs text-[#9b2020]" role="alert">{templateError}</div>}

      {template && doc && (
        <div className="grid grid-cols-1 2xl:grid-cols-[minmax(520px,640px)_1fr] gap-4 items-start">
          <MsigEditor template={template} form={form} />
          <div className="2xl:sticky 2xl:top-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded border border-gray-300 overflow-hidden text-xs">
                <button type="button" className={`px-3 py-1.5 ${tab === 'document' ? 'bg-navy-600 text-white' : 'bg-white'}`} onClick={() => setTab('document')}>Document preview</button>
                <button type="button" className={`px-3 py-1.5 ${tab === 'pdf' ? 'bg-navy-600 text-white' : 'bg-white'}`} onClick={() => setTab('pdf')}>PDF preview</button>
              </div>
              <Button type="button" size="sm" icon={<FileText size={12} />} onClick={() => void previewPdf()} loading={busy} disabled={errors.length > 0}>Generate PDF preview</Button>
              <Button type="button" size="sm" variant="primary" icon={<Download size={12} />} onClick={() => void exportPdf()} loading={busy} disabled={errors.length > 0}>Export PDF</Button>
            </div>
            {errors.length > 0 && <ul className="text-[11px] text-[#9b2020] list-disc pl-4">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
            {pdfError && <div className="rounded border border-[#f5b4b4] bg-[#fdecea] px-3 py-2 text-xs text-[#9b2020]" role="alert">PDF generation failed: {pdfError}</div>}
            {tab === 'document' ? (
              <>
                <p className="text-[11px] text-gray-500">Continuous preview of the document model. The exported PDF paginates onto A4.</p>
                <MsigPreview document={doc} />
              </>
            ) : pdf ? (
              <>
                {pdf.key !== docKey && <p className="text-[11px] text-[#8c6d1f]">This PDF is out of date — generate it again to include your latest edits.</p>}
                <iframe title="MSIG PDF preview" src={pdf.url} className="w-full h-[85vh] rounded border border-gray-300 bg-white" />
              </>
            ) : <p className="text-xs text-gray-500">No PDF generated yet — use “Generate PDF preview”.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

export function MsigPrototypeClient() {
  const [code, setCode] = useState('')
  return (
    <div className="space-y-4">
      <div className="card"><div className="card-body flex flex-wrap items-center gap-3">
        <label htmlFor="insurer" className="text-xs font-medium text-gray-700">Insurer</label>
        <select id="insurer" className="form-input w-72" value={code} onChange={(e) => setCode(e.target.value)}>
          <option value="">Select insurer…</option>
          {TEMPLATE_INSURERS.map((i) => <option key={i.code} value={i.code} disabled={!i.supported}>{i.label}{i.supported ? '' : ' — template not in this phase'}</option>)}
        </select>
      </div></div>
      {code === MSIG_CLUB_FORMAT && <MsigWorkspace />}
    </div>
  )
}