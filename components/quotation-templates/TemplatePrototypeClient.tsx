// FILE: components/quotation-templates/TemplatePrototypeClient.tsx
// The P&I quotation creation page: insurer selector → client & insurance type →
// the insurer's template workspace (editor, document preview, PDF), all saving
// to the real P&I API through PniBackendTemplateRepository. Only insurers with
// a registered module are selectable; Inigo / HYDOR have no template yet.
//
// Entry points (ROUTES.quotations.pniNew):  /…/template-prototype
//   ?clientId=<backend Client id>   start for that client (Client Management)
//   ?id=<quotation id>              open a saved P&I quotation in its template
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClientPrefillNotice } from '@/components/clients/ClientPrefillNotice'
import { ErrorState } from '@/components/feedback/ErrorState'
import { PageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/context/AuthContext'
import { useClientPrefill } from '@/hooks/useClientPrefill'
import { useClients } from '@/hooks/useClients'
import { useInsuranceTypes } from '@/hooks/useInsuranceTypes'
import { fetchPniQuotation } from '@/lib/api/pni'
import { TEMPLATE_INSURERS } from '@/lib/quotation-templates/insurers'
import { quotationText } from '@/lib/quotation-templates/shared/fromPni'
import { emptyClientContext, type PniClientContext } from '@/lib/quotation-templates/shared/toPni'
import { createPniBackendModules } from './pniBackendModules'
import { PniQuotationContextPanel } from './PniQuotationContextPanel'
import { TemplateWorkspace } from './TemplateWorkspace'

export function TemplatePrototypeClient({ initialId }: { initialId?: string }) {
  const { can, user, technicalDepartment, isLoading: authLoading } = useAuth()
  // Same rule as the Quotations list's "New Quotation" for P&I: quotation:create + P&I department (or superadmin).
  const allowed = can('quotation', 'create') && (Boolean(user?.isSuperAdmin) || technicalDepartment() === 'P&I')

  const [code, setCode] = useState('')
  const [deepLinkId, setDeepLinkId] = useState(initialId)
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null)
  const [ctx, setCtx] = useState<PniClientContext>(emptyClientContext)
  const [saved, setSaved] = useState<{ quotationNumber: string; status: string } | null>(null)
  const ctxRef = useRef(ctx)
  ctxRef.current = ctx

  const clientsQ = useClients()
  const typesQ = useInsuranceTypes()
  const prefill = useClientPrefill(
    clientsQ.data,
    (id) => { if (!initialId) setCtx((c) => ({ ...c, clientMode: 'existing', clientId: id })) },
    undefined,
    clientsQ.isError,
  )

  // What the repository reads when saving, and reports back when it loads/saves a quotation.
  const bridge = useMemo(() => ({
    get: () => ctxRef.current,
    loaded: (d: Parameters<typeof quotationText>[0]) => {
      setCtx({ clientMode: 'existing', clientId: quotationText(d, 'clientId') ?? '', insuranceTypeId: quotationText(d, 'insuranceTypeId') ?? '', newClient: emptyClientContext().newClient })
      setSaved({ quotationNumber: d.quotation.quotationNumber, status: d.quotation.status })
    },
  }), [])
  const modules = useMemo(() => createPniBackendModules(bridge), [bridge])

  // Deep link to a saved quotation: its own club decides the template.
  useEffect(() => {
    if (!initialId) return
    let live = true
    fetchPniQuotation(initialId)
      .then((d) => {
        if (!live) return
        if (TEMPLATE_INSURERS.some((i) => i.code === d.club.code && i.supported)) setCode(d.club.code)
        else setDeepLinkError(`There is no insurer template for ${d.club.name} (${d.club.code}) yet, so this quotation cannot be opened here.`)
      })
      .catch((e: { status?: number }) => live && setDeepLinkError(e?.status === 404 ? 'This P&I quotation was not found.' : 'The quotation could not be loaded.'))
    return () => { live = false }
  }, [initialId])

  const setUrl = useCallback((query: string) => window.history.replaceState(null, '', `${window.location.pathname}${query}`), [])
  const onInsurerChange = (next: string) => { setCode(next); setSaved(null); setDeepLinkId(undefined); setUrl('') }

  if (authLoading) return <PageSpinner label="Loading…" />
  if (!allowed) return <ErrorState message="Access denied" description="You don't have permission to create P&I quotations." />

  return (
    <div className="space-y-4 min-w-0">
      <div className="card"><div className="card-body flex flex-wrap items-center gap-3">
        <label htmlFor="insurer" className="text-xs font-medium text-gray-700">Insurer</label>
        <select id="insurer" className="form-input w-72 max-w-full" value={code} onChange={(e) => onInsurerChange(e.target.value)}>
          <option value="">Select insurer…</option>
          {TEMPLATE_INSURERS.map((i) => <option key={i.code} value={i.code} disabled={!i.supported}>{i.label}{i.supported ? '' : ' — template not available yet'}</option>)}
        </select>
      </div></div>

      {deepLinkError && <ErrorState message="Cannot open this quotation" description={deepLinkError} />}

      {code && (
        <>
          <ClientPrefillNotice state={prefill} />
          <PniQuotationContextPanel
            ctx={ctx} onChange={setCtx} saved={saved}
            clients={clientsQ.data} clientsFailed={clientsQ.isError} insuranceTypes={typesQ.data}
          />
        </>
      )}

      {/* key: switching insurer remounts the workspace, so no form state leaks between templates */}
      {code === modules.msig.code && (
        <TemplateWorkspace key={code} module={modules.msig} initialId={deepLinkId}
          onSaved={(rec) => { setSaved({ quotationNumber: rec.quotationNumber ?? '', status: rec.status ?? '' }); setUrl(`?id=${rec.id}`) }}
          onNew={() => { setCtx(emptyClientContext()); setSaved(null); setDeepLinkId(undefined); setUrl('') }} />
      )}
      {code === modules.eagle.code && (
        <TemplateWorkspace key={code} module={modules.eagle} initialId={deepLinkId}
          onSaved={(rec) => { setSaved({ quotationNumber: rec.quotationNumber ?? '', status: rec.status ?? '' }); setUrl(`?id=${rec.id}`) }}
          onNew={() => { setCtx(emptyClientContext()); setSaved(null); setDeepLinkId(undefined); setUrl('') }} />
      )}
    </div>
  )
}
