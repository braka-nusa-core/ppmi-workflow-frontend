// FILE: components/pni/PniTemplateView.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, FileText } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { CardSection } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/feedback/ErrorState'
import { usePniQuotation } from '@/hooks/usePni'
import { getPniTemplateAdapter } from '@/components/quotation-templates/pniTemplates'
import { downloadBlob } from '@/lib/quotation-templates/shared/pdf'
import { ROUTES } from '@/config/routes'

/**
 * Insurer paper (MSIG / Eagle) rendered from the SAVED P&I quotation.
 * Data comes only from GET /pni/quotations/:id via React Query — no local
 * repository, no browser storage — so an edit shows up here as soon as the
 * detail query refetches (the edit mutation invalidates it).
 */
export function PniTemplateView({ id }: { id: string }) {
  const router = useRouter()
  const { data: pni, isLoading, isError, error, refetch } = usePniQuotation(id)
  const adapter = getPniTemplateAdapter(pni?.club.code)
  const rendered = useMemo(() => (pni && adapter ? adapter.render(pni) : null), [pni, adapter])

  const docKey = useMemo(() => JSON.stringify(rendered?.document ?? null), [rendered])
  const [busy, setBusy] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdf, setPdf] = useState<string | null>(null)

  // A new document (after an edit) makes any generated PDF stale — drop it rather than show old values.
  useEffect(() => {
    setPdf((old) => { if (old) URL.revokeObjectURL(old); return null })
  }, [docKey])
  useEffect(() => () => { if (pdf) URL.revokeObjectURL(pdf) }, [pdf])

  if (isLoading) return <PageSpinner label="Loading quotation…" />
  if (isError || !pni) {
    const notFound = (error as { status?: number } | null)?.status === 404
    return (
      <div className="page-container">
        <ErrorState
          message={notFound ? 'P&I quotation not found' : 'Failed to load the quotation'}
          description={notFound ? 'This quotation does not exist or is not a P&I quotation.' : 'Please try again.'}
          onRetry={notFound ? undefined : () => refetch()}
        />
      </div>
    )
  }

  const number = pni.quotation.quotationNumber
  const back = () => router.push(ROUTES.quotations.detail(id))

  const makePdf = async () => { if (!adapter || !rendered) throw new Error('No document'); return adapter.renderPdf(rendered.document) }
  const previewPdf = async () => {
    setBusy(true); setPdfError(null)
    try {
      const url = URL.createObjectURL(await makePdf())
      setPdf((old) => { if (old) URL.revokeObjectURL(old); return url })
    } catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }
  const exportPdf = async () => {
    setBusy(true); setPdfError(null)
    try { downloadBlob(await makePdf(), adapter!.fileName(pni)) }
    catch (e) { setPdfError(e instanceof Error ? e.message : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Insurer template — ${number}`}
        breadcrumbs={[
          { label: 'Quotations', href: ROUTES.quotations.list },
          { label: number, href: ROUTES.quotations.detail(id) },
          { label: 'Insurer template' },
        ]}
        actions={
          <>
            <Button variant="ghost" size="sm" icon={<ArrowLeft size={13} />} onClick={back}>Back to quotation</Button>
            {adapter && rendered && (
              <>
                <Button size="sm" icon={<FileText size={12} />} onClick={() => void previewPdf()} loading={busy}>Generate PDF preview</Button>
                <Button size="sm" variant="primary" icon={<Download size={12} />} onClick={() => void exportPdf()} loading={busy}>Export PDF</Button>
              </>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-4 min-w-0">
        <CardSection title="Template" description="Chosen from this quotation’s own P&I club">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs" data-testid="template-info">
            <div><dt className="text-[#9aa3ad]">P&I club</dt><dd className="mt-0.5">{pni.club.name} ({pni.club.code})</dd></div>
            <div>
              <dt className="text-[#9aa3ad]">Template linked in the backend</dt>
              <dd className="mt-0.5">{pni.qsTemplate ? `${pni.qsTemplate.name}${pni.qsTemplate.templateVersion ? ` (${pni.qsTemplate.templateVersion})` : ''}` : 'None linked to this quotation'}</dd>
            </div>
            {rendered && (
              <>
                <div><dt className="text-[#9aa3ad]">Paper</dt><dd className="mt-0.5">{rendered.template.insurerName}</dd></div>
                <div><dt className="text-[#9aa3ad]">Frontend template version</dt><dd className="mt-0.5"><code>{rendered.template.templateVersion}</code></dd></div>
                <div className="sm:col-span-2 text-[#9aa3ad]">{rendered.template.sourceNote} Rendered live from the saved quotation; nothing is stored in this browser.</div>
              </>
            )}
          </dl>
        </CardSection>

        {!adapter && (
          <ErrorState
            message="No insurer template for this club yet"
            description={`There is no paper template for ${pni.club.name} (${pni.club.code}). The quotation data itself is unaffected.`}
          />
        )}

        {adapter && rendered && (
          <>
            {rendered.gaps.length > 0 && (
              <div className="rounded border border-[#e6d3a3] bg-[#fdf8e8] px-3 py-2 text-xs text-[#6b5413]" role="note" data-testid="template-gaps">
                <strong>Not filled from the quotation ({rendered.gaps.length})</strong>
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

            <CardSection title="Document preview" description="Continuous preview of the template document; the exported PDF paginates onto A4">
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
          </>
        )}
      </div>
    </div>
  )
}
