// FILE: components/quotation-templates/TemplatePrototypeClient.tsx
// The ONE P&I quotation editor (create AND edit): insurer selector → client &
// insurance type → the insurer's template workspace (editor, live document
// preview, PDF), all saving to the real P&I API through PniBackendTemplateRepository.
// Only insurers with a registered module are selectable; Inigo / HYDOR have no template yet.
//
// Entry points (ROUTES.quotations.pniNew):  /…/template-prototype
//   ?clientId=<backend Client id>   start for that client (Client Management)
//   ?id=<quotation id>              EDIT a saved P&I quotation in its template
//                                   (ROUTES.quotations.pniTemplateEdit) — saving PATCHes that
//                                   quotation; it never creates a second one.
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Pencil, PlusCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ClientPrefillNotice } from '@/components/clients/ClientPrefillNotice'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageSpinner } from '@/components/ui/Spinner'
import { ROUTES } from '@/config/routes'
import { useAuth } from '@/context/AuthContext'
import { useClientPrefill } from '@/hooks/useClientPrefill'
import { useVesselPrefill } from '@/hooks/useVesselPrefill'
import { useQueryClient } from '@tanstack/react-query'
import { useClients } from '@/hooks/useClients'
import { useInsuranceTypes } from '@/hooks/useInsuranceTypes'
import { pniKeys } from '@/hooks/usePni'
import { quotationKeys } from '@/hooks/useQuotations'
import { fetchPniQuotation } from '@/lib/api/pni'
import { isQuotationEditableByUser, isStatusEditable, isTechnicalUnitOwner } from '@/lib/quotationEditability'
import { getQuotationStatusLabel } from '@/lib/quotationStatus'
import { TEMPLATE_INSURERS } from '@/lib/quotation-templates/insurers'
import { quotationText } from '@/lib/quotation-templates/shared/fromPni'
import { emptyClientContext, type PniClientContext } from '@/lib/quotation-templates/shared/toPni'
import { mapToMsigVessel, mapToEagleVessel } from '@/lib/quotation-templates/shared/vesselPrefill'
import type { Client } from '@/types/client'
import type { QuotationStatus } from '@/types/quotation'
import { createPniBackendModules } from './pniBackendModules'
import { PniQuotationContextPanel } from './PniQuotationContextPanel'
import { VesselPrefillSelector } from './VesselPrefillSelector'
import { TemplateWorkspace, type ClientPrefillRequest, type VesselPrefillRequest } from './TemplateWorkspace'

/** What the edit gate needs to know about the quotation being opened (from GET /pni/quotations/:id). */
interface EditTarget { number: string; status: QuotationStatus; technicalUnit: { name: string } | null }

export function TemplatePrototypeClient({ initialId }: { initialId?: string }) {
  const router = useRouter()
  const qc = useQueryClient()
  const { can, user, technicalDepartment, isLoading: authLoading } = useAuth()
  const editing = Boolean(initialId)
  // Create: same rule as the Quotations list's "New Quotation" for P&I — quotation:create + P&I department (or superadmin).
  const canCreate = can('quotation', 'create') && (Boolean(user?.isSuperAdmin) || technicalDepartment() === 'P&I')

  const [code, setCode] = useState('')
  const [deepLinkId, setDeepLinkId] = useState(initialId)
  const [deepLinkError, setDeepLinkError] = useState<string | null>(null)
  const [target, setTarget] = useState<EditTarget | null>(null)
  const [ctx, setCtx] = useState<PniClientContext>(emptyClientContext)
  const [saved, setSaved] = useState<{ id: string; quotationNumber: string; status: string } | null>(null)
  const [prefill, setPrefill] = useState<ClientPrefillRequest | null>(null)
  const [vesselPrefill, setVesselPrefill] = useState<VesselPrefillRequest | null>(null)
  const [clearVessels, setClearVessels] = useState<{ seq: number } | null>(null)
  const [vesselSelection, setVesselSelection] = useState<Set<string>>(new Set())
  const [hasAddedVessels, setHasAddedVessels] = useState(false)
  const [addedVesselIds, setAddedVesselIds] = useState<Set<string>>(new Set())
  const [pendingClientChange, setPendingClientChange] = useState<PniClientContext | null>(null)
  const prefillSeq = useRef(0)
  const vesselSeq = useRef(0)
  const clearSeq = useRef(0)
  const ctxRef = useRef(ctx)
  ctxRef.current = ctx

  const clientsQ = useClients()
  const typesQ = useInsuranceTypes()

  /** The user picked an existing client → ask the workspace to fill the paper's client fields from its real data. */
  const requestPrefill = useCallback((client: Client | undefined) => {
    if (!client) return
    setPrefill({ seq: ++prefillSeq.current, name: client.name, address: client.address })
  }, [])

  const prefillState = useClientPrefill(
    clientsQ.data,
    (id) => {
      if (initialId) return
      setCtx((c) => ({ ...c, clientMode: 'existing', clientId: id }))
      requestPrefill(clientsQ.data?.find((c) => c.id === id))
    },
    undefined,
    clientsQ.isError,
  )

  const onCtxChange = (next: PniClientContext) => {
    if (next.clientMode === 'existing' && next.clientId && next.clientId !== ctx.clientId) {
      // Client changing — confirm if user has added vessels
      if (hasAddedVessels) {
        setPendingClientChange(next)
        return // Show confirmation dialog
      }
      
      // No vessels added — proceed directly
      clearVesselsAndSwitchClient(next)
    } else {
      setCtx(next)
    }
  }

  const clearVesselsAndSwitchClient = (next: PniClientContext) => {
    // Clear vessel candidates and selection
    setVesselSelection(new Set())
    setAddedVesselIds(new Set())
    setHasAddedVessels(false)
    // Signal template workspace to clear vessels
    clearSeq.current += 1
    setClearVessels({ seq: clearSeq.current })
    
    requestPrefill(clientsQ.data?.find((c) => c.id === next.clientId))
    setCtx(next)
  }

  const confirmClientChange = () => {
    if (!pendingClientChange) return
    clearVesselsAndSwitchClient(pendingClientChange)
    setPendingClientChange(null)
  }

  const cancelClientChange = () => {
    setPendingClientChange(null)
  }

  const vesselQ = useVesselPrefill(ctx.clientMode === 'existing' ? ctx.clientId : undefined)

  const onVesselIdsChange = useCallback((vesselIds: string[]) => {
    setAddedVesselIds(new Set(vesselIds))
  }, [])

  const onVesselAppend = useCallback(() => {
    if (vesselSelection.size === 0) return
    const selected = vesselQ.candidates.filter((c) => vesselSelection.has(c.vessel.id))
    const mapper = code === 'MSIG' ? mapToMsigVessel : code === 'EOM' ? mapToEagleVessel : null
    if (!mapper) return
    const vessels = selected.map((c) => mapper(c.vessel, c.policy))
    setVesselPrefill({ seq: ++vesselSeq.current, vessels })
    
    // Track added vessel IDs
    setAddedVesselIds(prev => {
      const next = new Set(prev)
      selected.forEach(c => next.add(c.vessel.id))
      return next
    })
    
    setVesselSelection(new Set())
    setHasAddedVessels(true)
  }, [vesselSelection, vesselQ.candidates, code])

  // What the repository reads when saving, and reports back when it loads/saves a quotation.
  const bridge = useMemo(() => ({
    get: () => ctxRef.current,
    loaded: (d: Parameters<typeof quotationText>[0]) => {
      setCtx({ clientMode: 'existing', clientId: quotationText(d, 'clientId') ?? '', insuranceTypeId: quotationText(d, 'insuranceTypeId') ?? '', newClient: emptyClientContext().newClient })
      setSaved({ id: d.quotationId, quotationNumber: d.quotation.quotationNumber, status: d.quotation.status })
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
        setTarget({ number: d.quotation.quotationNumber, status: d.quotation.status as QuotationStatus, technicalUnit: d.quotation.technicalUnit })
        if (TEMPLATE_INSURERS.some((i) => i.code === d.club.code && i.supported)) setCode(d.club.code)
        else setDeepLinkError(`There is no insurer template for ${d.club.name} (${d.club.code}) yet, so this quotation cannot be opened here.`)
      })
      .catch((e: { status?: number }) => live && setDeepLinkError(e?.status === 404 ? 'This P&I quotation was not found.' : 'The quotation could not be loaded.'))
    return () => { live = false }
  }, [initialId])

  const setUrl = useCallback((query: string) => window.history.replaceState(null, '', `${window.location.pathname}${query}`), [])
  const onInsurerChange = (next: string) => { setCode(next); setSaved(null); setDeepLinkId(undefined); setUrl('') }
  const startOver = () => { setCtx(emptyClientContext()); setSaved(null); setPrefill(null); setDeepLinkId(undefined); setUrl('') }
  const onSaved = (rec: { id: string; quotationNumber?: string; status?: string }) => {
    setSaved({ id: rec.id, quotationNumber: rec.quotationNumber ?? '', status: rec.status ?? '' }); setUrl(`?id=${rec.id}`)
    // This editor writes through lib/api/pni directly (not the usePni mutations), so refresh what the
    // detail page and the list cached — the same keys useUpdatePniQuotation invalidates.
    qc.invalidateQueries({ queryKey: pniKeys.detail(rec.id) })
    qc.invalidateQueries({ queryKey: quotationKeys.detail(rec.id) })
    qc.invalidateQueries({ queryKey: pniKeys.lists() })
    qc.invalidateQueries({ queryKey: quotationKeys.lists() })
  }

  if (authLoading) return <PageSpinner label="Loading…" />

  if (!editing && !canCreate) return <ErrorState message="Access denied" description="You don't have permission to create P&I quotations." />

  if (editing) {
    const detailHref = ROUTES.quotations.detail(initialId as string)
    const back = (
      <div className="mt-4"><Button variant="secondary" onClick={() => router.push(detailHref)}>Back to quotation</Button></div>
    )
    if (deepLinkError) return <><ErrorState message="Cannot open this quotation" description={deepLinkError} />{back}</>
    if (!target) return <PageSpinner label="Loading P&I quotation…" />
    // Same UX rules as the legacy P&I edit page (the backend re-checks every PATCH regardless).
    const mayEdit = can('quotation', 'update') && isQuotationEditableByUser({ status: target.status, technicalUnit: target.technicalUnit }, user)
    if (!mayEdit) {
      const reason = !isStatusEditable(target.status)
        ? `This quotation is ${getQuotationStatusLabel(target.status)} and can no longer be edited.`
        : !isTechnicalUnitOwner({ technicalUnit: target.technicalUnit }, user)
          ? 'This quotation belongs to a different technical unit than yours.'
          : "You don't have permission to edit quotations."
      return <><ErrorState message="Editing unavailable" description={reason} />{back}</>
    }
  }

  const selectedClient = clientsQ.data?.find((c) => c.id === ctx.clientId)

  return (
    <div className="space-y-4 min-w-0">
      <div className="card"><div className="card-body flex flex-wrap items-center gap-3">
        <label htmlFor="insurer" className="text-xs font-medium text-gray-700">Insurer</label>
        <select id="insurer" className="form-input w-72 max-w-full" value={code} disabled={editing} onChange={(e) => onInsurerChange(e.target.value)}>
          <option value="">Select insurer…</option>
          {TEMPLATE_INSURERS.map((i) => <option key={i.code} value={i.code} disabled={!i.supported}>{i.label}{i.supported ? '' : ' — template not available yet'}</option>)}
        </select>
        {editing && <span className="text-[11px] text-gray-500">The insurer is fixed by the saved quotation.</span>}
      </div></div>

      {code && (
        <div
          data-testid="pni-mode-banner" data-mode={saved ? 'edit' : 'create'} role="status"
          className={`flex flex-wrap items-center gap-2 rounded border px-3 py-2 text-xs ${saved ? 'border-[#93c4e5] bg-[#e8f4fd] text-[#123d6b]' : 'border-gray-200 bg-gray-50 text-gray-700'}`}
        >
          {saved ? <Pencil size={13} aria-hidden /> : <PlusCircle size={13} aria-hidden />}
          {saved ? (
            <span><strong>Editing {saved.quotationNumber || 'saved quotation'}</strong>{saved.status ? ` · ${getQuotationStatusLabel(saved.status as QuotationStatus)}` : ''} — “Save changes” updates this quotation; no new quotation is created.</span>
          ) : (
            <span><strong>New quotation</strong> — nothing is saved until you press “Save quotation”.</span>
          )}
          {saved && (
            <Link href={ROUTES.quotations.detail(saved.id)} className="ml-auto inline-flex items-center gap-1 font-semibold underline">
              <ArrowLeft size={12} aria-hidden /> Back to quotation
            </Link>
          )}
        </div>
      )}

      {code && (
        <>
          <ClientPrefillNotice state={prefillState} />
          <PniQuotationContextPanel
            ctx={ctx} onChange={onCtxChange} saved={saved}
            clients={clientsQ.data} clientsFailed={clientsQ.isError} insuranceTypes={typesQ.data}
            selectedClient={selectedClient}
          />
          {ctx.clientMode === 'existing' && ctx.clientId && !saved && (
            <VesselPrefillSelector
              candidates={vesselQ.candidates}
              loading={vesselQ.loading}
              error={vesselQ.error}
              selected={vesselSelection}
              addedVesselIds={addedVesselIds}
              onSelectionChange={setVesselSelection}
              onAppend={onVesselAppend}
            />
          )}
        </>
      )}

      {/* key: switching insurer remounts the workspace, so no form state leaks between templates */}
      {code === modules.msig.code && (
        <TemplateWorkspace
          key={code}
          module={modules.msig}
          initialId={deepLinkId}
          clientPrefill={prefill}
          vesselPrefill={vesselPrefill}
          clearVessels={clearVessels}
          onVesselsChange={onVesselIdsChange}
          onSaved={onSaved}
          onNew={startOver}
        />
      )}
      {code === modules.eagle.code && (
        <TemplateWorkspace
          key={code}
          module={modules.eagle}
          initialId={deepLinkId}
          clientPrefill={prefill}
          vesselPrefill={vesselPrefill}
          clearVessels={clearVessels}
          onVesselsChange={onVesselIdsChange}
          onSaved={onSaved}
          onNew={startOver}
        />
      )}

      <ConfirmDialog
        open={pendingClientChange !== null}
        title="Change Client"
        message="Changing the client will remove vessel information associated with the previous client. Continue?"
        confirmLabel="Continue"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={confirmClientChange}
        onCancel={cancelClientChange}
      />
    </div>
  )
}
