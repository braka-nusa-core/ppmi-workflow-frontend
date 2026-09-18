'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { DataTable, type ColumnDef } from '@/components/table/DataTable'
import { ErrorState } from '@/components/feedback/ErrorState'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { useQuotations } from '@/hooks/useQuotations'
import { useAuth } from '@/context/AuthContext'
import { ROUTES } from '@/config/routes'
import { formatDate } from '@/lib/format'
import { getQuotationStatusLabel, QUOTATION_STATUS_BADGE_VARIANT } from '@/lib/quotationStatus'
import type { QuotationListItem } from '@/types/quotation'
import type { ApiError } from '@/types/api'

// ─── Columns ──────────────────────────────────────────────────────
// GET /quotations has no server-side sort/filter today, so columns
// here are display-only (no `sortable`) — sorting would need to be
// client-side over the full result set if ever added, not invented
// as a fake server capability.
function buildQuotationColumns(
  onView: (row: QuotationListItem) => void
): ColumnDef<QuotationListItem>[] {
  return [
    {
      key: 'quotationNumber',
      header: 'QS Number',
      render: (row) => (
        <button
          type="button"
          onClick={() => onView(row)}
          className="font-mono text-[13px] font-medium text-[#1e4a70] hover:underline text-left"
        >
          {row.quotationNumber}
        </button>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (row) => (
        <div className="flex flex-col">
          <span className="text-[13px] text-[#232b34]">{row.client?.name ?? '—'}</span>
          {row.client?.clientCode && (
            <span className="text-[11px] text-[#9aa3ad]">{row.client.clientCode}</span>
          )}
        </div>
      ),
    },
    {
      key: 'technicalUnit',
      header: 'Technical Unit',
      render: (row) => (
        <span className="text-[13px] text-[#4d5966]">
          {row.technicalUnit?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'insuranceType',
      header: 'Insurance Type',
      render: (row) => (
        <span className="text-[13px] text-[#4d5966]">{row.insuranceType?.name ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={QUOTATION_STATUS_BADGE_VARIANT[row.status]} dot>
          {getQuotationStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      align: 'right',
      render: (row) => (
        <span className="text-[13px] text-[#4d5966]">{formatDate(row.updatedAt)}</span>
      ),
    },
  ]
}

export function QuotationListClient() {
  const router = useRouter()
  const { can, isLoading: authLoading } = useAuth()
  const { data, isLoading, isError, error, refetch } = useQuotations()

  const columns = useMemo(
    () => buildQuotationColumns((row) => router.push(ROUTES.quotations.detail(row.id))),
    [router]
  )

  const apiError = error as ApiError | undefined

  // Auth must finish resolving before trusting can('quotation','read') —
  // see QuotationDetailClient for the full explanation (Phase 3D fix).
  if (authLoading) {
    return <PageSpinner label="Loading…" />
  }

  // quotation:read gate — UX only, matching the same pattern used by
  // QuotationDetailClient. The backend independently enforces this on
  // every request.
  if (!can('quotation', 'read')) {
    return (
      <ErrorState
        message="You don't have access to view quotations"
        description="Contact your administrator if you believe this is incorrect."
      />
    )
  }

  return (
    <>
      <PageHeader
        title="Quotations"
        description="Quotation Slip (QS) records — new quotation domain"
        breadcrumbs={[{ label: 'Quotations' }]}
        actions={
          can('quotation', 'create') ? (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={13} />}
              onClick={() => router.push(ROUTES.quotations.new)}
            >
              New Quotation
            </Button>
          ) : undefined
        }
      />

      <div className="data-table-wrapper">
        {isError ? (
          <ErrorState
            message={apiError?.message ?? 'Failed to load quotations'}
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<QuotationListItem>
            columns={columns}
            data={data ?? []}
            rowKey={(row) => row.id}
            loading={isLoading}
            onRowDoubleClick={(row) => router.push(ROUTES.quotations.detail(row.id))}
            emptyMessage="No quotations found"
            emptyDescription="Quotations created by Teknik will appear here."
          />
        )}
      </div>
    </>
  )
}