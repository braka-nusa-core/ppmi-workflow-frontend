// FILE: components/quotation-templates/PniQuotationContextPanel.tsx
// Who the quotation is for (client) and its insurance type — the two things the
// backend needs that no insurer paper shows. Sits above the template workspace.
'use client'

import type { InsuranceType } from '@/types/insuranceTypes'
import type { Client } from '@/types/client'
import type { PniClientContext } from '@/lib/quotation-templates/shared/toPni'

interface Props {
  ctx: PniClientContext
  onChange: (next: PniClientContext) => void
  clients: Client[] | undefined
  clientsFailed: boolean
  insuranceTypes: InsuranceType[] | undefined
  /** Set once the quotation is saved: client can be changed, insurance type is fixed. */
  saved: { quotationNumber: string; status: string } | null
}

export function PniQuotationContextPanel({ ctx, onChange, clients, clientsFailed, insuranceTypes, saved }: Props) {
  const set = (patch: Partial<PniClientContext>) => onChange({ ...ctx, ...patch })
  const setNew = (patch: Partial<PniClientContext['newClient']>) => onChange({ ...ctx, newClient: { ...ctx.newClient, ...patch } })
  const typeName = insuranceTypes?.find((t) => t.id === ctx.insuranceTypeId)?.name

  return (
    <div className="card" data-testid="pni-context-panel">
      <div className="card-body space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold text-[#232b34]">Client &amp; insurance type</h2>
          {saved && <span className="text-[11px] text-gray-500">Saved as <strong>{saved.quotationNumber}</strong> · {saved.status}</span>}
        </div>

        {!saved && (
          <div role="group" aria-label="Client source" className="inline-flex rounded border border-gray-300 overflow-hidden text-xs">
            {(['existing', 'new'] as const).map((mode) => (
              <button key={mode} type="button" data-testid={`ctx-client-mode-${mode}`} aria-pressed={ctx.clientMode === mode}
                className={`px-3 py-1.5 ${ctx.clientMode === mode ? 'bg-navy-600 text-white' : 'bg-white'}`}
                onClick={() => set({ clientMode: mode })}>
                {mode === 'existing' ? 'Existing client' : 'New client'}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {(saved || ctx.clientMode === 'existing') ? (
            <label className="block text-xs">
              <span className="font-medium text-gray-700">Client</span>
              <select className="form-input w-full mt-1" data-testid="ctx-client-select" value={ctx.clientId} onChange={(e) => set({ clientId: e.target.value })}>
                <option value="">{clientsFailed ? 'Clients could not be loaded' : 'Select a client…'}</option>
                {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.clientCode})</option>)}
              </select>
            </label>
          ) : (
            <>
              <label className="block text-xs"><span className="font-medium text-gray-700">Client name *</span>
                <input className="form-input w-full mt-1" data-testid="ctx-new-client-name" value={ctx.newClient.name} onChange={(e) => setNew({ name: e.target.value })} /></label>
              <label className="block text-xs"><span className="font-medium text-gray-700">Contact person</span>
                <input className="form-input w-full mt-1" value={ctx.newClient.contactPerson} onChange={(e) => setNew({ contactPerson: e.target.value })} /></label>
              <label className="block text-xs md:col-span-2"><span className="font-medium text-gray-700">Address</span>
                <input className="form-input w-full mt-1" value={ctx.newClient.address} onChange={(e) => setNew({ address: e.target.value })} /></label>
              <label className="block text-xs"><span className="font-medium text-gray-700">Phone</span>
                <input className="form-input w-full mt-1" value={ctx.newClient.phone} onChange={(e) => setNew({ phone: e.target.value })} /></label>
              <label className="block text-xs"><span className="font-medium text-gray-700">Email</span>
                <input className="form-input w-full mt-1" type="email" value={ctx.newClient.email} onChange={(e) => setNew({ email: e.target.value })} /></label>
            </>
          )}

          <label className="block text-xs">
            <span className="font-medium text-gray-700">Insurance type {saved ? '' : '*'}</span>
            {saved ? (
              <input className="form-input w-full mt-1" data-testid="ctx-insurance-type" value={typeName ?? ''} disabled aria-label="Insurance type (fixed once saved)" />
            ) : (
              <select className="form-input w-full mt-1" data-testid="ctx-insurance-type" value={ctx.insuranceTypeId} onChange={(e) => set({ insuranceTypeId: e.target.value })}>
                <option value="">Select insurance type…</option>
                {(insuranceTypes ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            )}
          </label>
        </div>
      </div>
    </div>
  )
}
