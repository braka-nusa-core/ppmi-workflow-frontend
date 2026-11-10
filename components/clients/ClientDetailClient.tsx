// FILE: components/clients/ClientDetailClient.tsx
'use client'

import { useMemo } from 'react'
import { PageSpinner } from '@/components/ui/Spinner'
import { PageHeader } from '@/components/layout/PageHeader'
import { CardSection } from '@/components/ui/Card'
import { ErrorState } from '@/components/feedback/ErrorState'
import { DataTable, type ColumnDef } from '@/components/table/DataTable'
import { TableFilters, type FilterDef } from '@/components/table/TableFilters'
import { DataSourceBadge } from '@/components/demo/DataSourceBadge'
import { useAuth } from '@/context/AuthContext'
import { useDataTable } from '@/hooks/useDataTable'
import { useClientDirectoryDetail, useClientPolicies, useVesselDetails } from '@/hooks/useClientDirectory'
import { UseExistingClientButton } from './UseExistingClientButton'
import { formatDate } from '@/lib/format'
import { ROUTES } from '@/config/routes'
import { VESSEL_POLICY_STATUSES, type VesselPolicyStatus } from '@/lib/clientDirectory/statuses'
import type { DirectoryPolicy, DirectoryVessel } from '@/types/clientDirectory'

const dash = (v: string | number | null | undefined) => (v === null || v === undefined || v === '' ? '—' : String(v))
const label = (s: string) => s.replace(/_/g, ' ')

/** Primary = original text from the source; secondary = backend-normalized value when it differs. */
function Stacked({ primary, secondary }: { primary: string | null; secondary?: string | null }) {
  return (
    <div className="text-xs">
      <div className="font-medium">{dash(primary)}</div>
      {secondary && secondary !== primary && <div className="text-[#9aa3ad] mt-0.5">{secondary}</div>}
    </div>
  )
}

type Row = DirectoryPolicy & { vessel: DirectoryVessel | null }

function buildColumns(vesselsEnabled: boolean): ColumnDef<Row>[] {
  const v = (fn: (x: DirectoryVessel) => string | number | null) =>
    (r: Row) => <span className="text-xs tabular-nums">{!vesselsEnabled ? '—' : r.vessel ? dash(fn(r.vessel)) : '…'}</span>
  return [
    { key: 'pol', header: 'Policy / Certificate', minWidth: 150,
      render: (r) => <Stacked primary={r.policyNumberRaw ?? r.policyNumber} secondary={r.policyNumberRaw ? r.policyNumber : null} /> },
    { key: 'ins', header: 'Assured (as in source)', minWidth: 220,
      render: (r) => <span className="text-xs break-words">{dash(r.insuredRaw)}</span> },
    { key: 'per', header: 'Policy period', minWidth: 190,
      render: (r) => (
        <Stacked
          primary={r.periodRaw ?? (r.periodStart || r.periodEnd ? `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}` : null)}
          secondary={r.periodRaw && (r.periodStart || r.periodEnd) ? `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}` : null}
        />
      ) },
    { key: 'ves', header: 'Vessel', minWidth: 130, render: (r) => <span className="text-xs font-medium">{dash(r.vesselName)}</span> },
    { key: 'type', header: 'Type', render: v((x) => x.vesselType) },
    { key: 'year', header: 'Built', align: 'right', render: v((x) => x.builtYear) },
    { key: 'gt', header: 'GT', align: 'right', render: v((x) => x.grossTonnage) },
    { key: 'class', header: 'Class', render: v((x) => x.vesselClass) },
    { key: 'club', header: 'Club', minWidth: 100,
      render: (r) => <Stacked primary={r.clubRaw ?? r.clubCode} secondary={r.clubRaw ? r.clubCode : null} /> },
    { key: 'status', header: 'Status', minWidth: 110,
      render: (r) => <Stacked primary={r.statusRaw ?? (r.status ? label(r.status) : null)} secondary={r.statusRaw && r.status ? label(r.status) : null} /> },
  ]
}

export function ClientDetailClient({ id }: { id: string }) {
  const { can, isLoading: authLoading } = useAuth()
  const canClient = can('client', 'read')
  const canPolicies = can('vessel-policy', 'read')
  const canVessels = can('vessel', 'read')
  const table = useDataTable({ defaultPageSize: 25 })
  const status = table.activeFilters.status as VesselPolicyStatus | undefined

  const clientQ = useClientDirectoryDetail(id, canClient)
  const policiesQ = useClientPolicies(
    { clientId: id, page: table.pagination.page, limit: table.pagination.pageSize, status: status || undefined },
    canClient && canPolicies,
  )

  const items = useMemo(() => policiesQ.data?.items ?? [], [policiesQ.data])
  const vesselIds = useMemo(() => Array.from(new Set(items.map((p) => p.vesselId))), [items])
  const vesselQs = useVesselDetails(vesselIds, canVessels)
  const vesselMap = new Map<string, DirectoryVessel>()
  vesselQs.forEach((q) => { if (q.data) vesselMap.set(q.data.id, q.data) })
  const failedVessels = vesselQs.filter((q) => q.isError).length
  const rows: Row[] = items.map((p) => ({ ...p, vessel: vesselMap.get(p.vesselId) ?? null }))

  const columns = useMemo(() => buildColumns(canVessels && failedVessels === 0), [canVessels, failedVessels])
  const filters: FilterDef[] = [{
    key: 'status', label: 'Status', type: 'select', placeholder: 'All',
    options: VESSEL_POLICY_STATUSES.map((s) => ({ value: s, label: label(s) })),
  }]

  if (authLoading || (canClient && clientQ.isLoading)) return <PageSpinner label="Loading client…" />
  if (!canClient) return <ErrorState message="Access denied" description="You need the client:read permission to view this client." />
  if (clientQ.isError) {
    const notFound = (clientQ.error as { status?: number })?.status === 404
    return notFound
      ? <ErrorState message="Client not found" description="This client does not exist or has been removed." />
      : <ErrorState message="Failed to load client" onRetry={() => clientQ.refetch()} />
  }
  const client = clientQ.data!

  return (
    <>
      <PageHeader
        title={client.name}
        breadcrumbs={[{ label: 'Client Management', href: ROUTES.clients.list }, { label: 'Detail' }]}
      />
      {/* Kept outside PageHeader's non-wrapping actions slot so it wraps on narrow screens. */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <DataSourceBadge source="live" />
        <UseExistingClientButton client={client} size="md" />
      </div>
      <div className="flex flex-col gap-4">
        <CardSection title="Company information" description="Client master record">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <dt className="text-[#9aa3ad]">Client / Company</dt>
              <dd className="text-[13px] text-[#232b34] mt-0.5 break-words">{client.name}</dd>
            </div>
            <div><dt className="text-[#9aa3ad]">Client code</dt><dd className="mt-0.5">{client.clientCode}</dd></div>
            <div><dt className="text-[#9aa3ad]">Contact person</dt><dd className="mt-0.5">{dash(client.contactPerson)}</dd></div>
            <div><dt className="text-[#9aa3ad]">Phone</dt><dd className="mt-0.5">{dash(client.phone)}</dd></div>
            <div><dt className="text-[#9aa3ad]">Email</dt><dd className="mt-0.5 break-all">{dash(client.email)}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[#9aa3ad]">Address</dt><dd className="mt-0.5 break-words">{dash(client.address)}</dd></div>
            <div><dt className="text-[#9aa3ad]">Created</dt><dd className="mt-0.5">{formatDate(client.createdAt)}</dd></div>
            <div><dt className="text-[#9aa3ad]">Policy / vessel records</dt>
              <dd className="mt-0.5">{canPolicies ? (policiesQ.data ? policiesQ.data.total : '…') : '—'}</dd></div>
          </dl>
        </CardSection>

        <CardSection
          title="Policy & vessel records"
          description="Original policy number, assured, period, club and status as stored; blank values show “—” and are never inferred"
        >
          {!canPolicies ? (
            <ErrorState message="Access denied" description="You need the vessel-policy:read permission to view policy records." />
          ) : policiesQ.isError ? (
            <ErrorState message="Failed to load policy records" onRetry={() => policiesQ.refetch()} />
          ) : (
            <>
              {!canVessels && (
                <p className="text-xs text-[#7a5000] mb-2">Vessel type, year built, GT and class need the vessel:read permission and are not shown.</p>
              )}
              {canVessels && failedVessels > 0 && (
                <p className="text-xs text-[#7a5000] mb-2">Vessel details could not be loaded for {failedVessels} vessel(s); type, year, GT and class are hidden.</p>
              )}
              <div className="data-table-wrapper">
                <TableFilters
                  filters={filters}
                  activeFilters={table.activeFilters}
                  onFilterChange={table.onFilterChange}
                  onClearFilters={table.onClearFilters}
                />
                <DataTable<Row>
                  columns={columns}
                  data={rows}
                  rowKey={(r) => r.id}
                  loading={policiesQ.isLoading}
                  pagination={table.fullPagination(policiesQ.data?.total ?? 0)}
                  onPageChange={table.onPageChange}
                  onPageSizeChange={table.onPageSizeChange}
                  emptyMessage="No policy or vessel records"
                  emptyDescription={status ? 'No records with this status' : undefined}
                />
              </div>
            </>
          )}
        </CardSection>
      </div>
    </>
  )
}
