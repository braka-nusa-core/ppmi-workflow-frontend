'use client'

import { useMemo }             from 'react'
import { useRouter }           from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Download }      from 'lucide-react'
import { DataTable }           from '@/components/table/DataTable'
import { TableFilters }        from '@/components/table/TableFilters'
import type { FilterDef }      from '@/components/table/TableFilters'
import { PageHeader }          from '@/components/layout/PageHeader'
import { Button }              from '@/components/ui/Button'
import { ConfirmModal }        from '@/components/modal/BaseModal'
import { ErrorState }          from '@/components/feedback/ErrorState'
import { useDataTable }        from '@/hooks/useDataTable'
import { useModal }            from '@/hooks/useModal'
import { useRole }             from '@/hooks/useRole'
import { useToast }            from '@/context/ToastContext'
import { buildVoucherColumns } from './VoucherTableColumns'
import { fetchVoucherList, updateVoucher } from '@/lib/api/voucher'
import type { VoucherListItem, VoucherStatus, VoucherPaymentType } from '@/types/voucher'
import type { Division } from '@/types/workflow'

const VOUCHER_FILTERS: FilterDef[] = [
  {
    key: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'DRAFT',   label: 'Draft'   },
      { value: 'PENDING', label: 'Pending' },
      { value: 'CLOSED',  label: 'Closed'  },
    ],
  },
  {
    key: 'division', label: 'Division', type: 'select',
    options: [
      { value: 'PI', label: 'P&I' },
      { value: 'HM', label: 'H&M' },
    ],
  },
  {
    key: 'paymentType', label: 'Payment Type', type: 'select',
    options: [
      { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
      { value: 'RTGS',          label: 'RTGS'          },
      { value: 'SWIFT',         label: 'SWIFT'         },
      { value: 'CHEQUE',        label: 'Cheque'        },
      { value: 'CASH',          label: 'Cash'          },
    ],
  },
]

export function VoucherListClient() {
  const router      = useRouter()
  const queryClient = useQueryClient()
  const { canCreate, canEdit, canVerify } = useRole()
  const { success, error: toastError }    = useToast()
  const table        = useDataTable({ defaultPageSize: 25 })
  const approveModal = useModal<VoucherListItem>()

  // ── Typed query params ────────────────────────────────────────
  const voucherQueryParams = {
    page:           table.pagination.page,
    pageSize:       table.pagination.pageSize,
    search:         table.debouncedSearch || undefined,
    sortBy:         table.sort?.key,
    sortDir:        table.sort?.direction,
    status:         (table.activeFilters.status        as VoucherStatus     | undefined) || undefined,
    division:       (table.activeFilters.division       as Division          | undefined) || undefined,
    paymentType:    (table.activeFilters.paymentType    as VoucherPaymentType| undefined) || undefined,
  }

  const { data: result, isLoading, isError, refetch } = useQuery({
    queryKey: ['voucher-list', voucherQueryParams],
    queryFn:  () => fetchVoucherList(voucherQueryParams),
  })

  const data  = result?.data  ?? []
  const total = result?.pagination?.total ?? 0


  // ── Quick-approve from list ───────────────────────────────────
  // No dedicated /approve endpoint exists on the backend — use the
  // generic PATCH /vouchers/:id, same pattern as QS's approveQS().
  const approveMutation = useMutation({
    mutationFn: (id: string) => updateVoucher(id, { status: 'CLOSED' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      success('Voucher Approved', `${approveModal.data?.docNumber} has been approved.`)
      approveModal.close()
    },
    onError: () => {
      toastError('Approval failed', 'Could not approve the voucher. Please try again.')
    },
  })

  const columns = useMemo(() => buildVoucherColumns({
    onView:            (row) => router.push(`/dashboard/voucher/${row.id}`),
    onEdit:            (row) => router.push(`/dashboard/voucher/${row.id}/edit`),
    onApprove:         (row) => approveModal.open(row),
    onGeneratePayment: (row) => router.push(`/dashboard/payment/new?voucherId=${row.id}`),
    onDownload:        (_row) => { /* PDF download wired in detail page */ },
    canEdit,
    canVerify,
    canCreate,
  }), [canEdit, canVerify, canCreate, router, approveModal])

  return (
    <>
      <PageHeader
        title="Vouchers"
        description="Finance payment vouchers across P&I and H&M divisions"
        breadcrumbs={[{ label: 'Voucher' }]}
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<Download size={13} />}>Export</Button>
            {canCreate && (
              <Button
                variant="primary" size="sm" icon={<Plus size={13} />}
                onClick={() => router.push('/dashboard/voucher/new')}
              >
                New Voucher
              </Button>
            )}
          </>
        }
      />

      <div className="data-table-wrapper">
        <TableFilters
          searchValue={table.search}
          onSearchChange={table.setSearch}
          searchPlaceholder="Search voucher no., invoice ref., insured…"
          filters={VOUCHER_FILTERS}
          activeFilters={table.activeFilters}
          onFilterChange={table.onFilterChange}
          onClearFilters={table.onClearFilters}
        />
        {isError ? (
          <ErrorState
            message="Failed to load vouchers"
            description="An error occurred while loading data from the server. Please try again."
            onRetry={() => refetch()}
          />
        ) : (
          <DataTable<VoucherListItem>
            columns={columns}
            data={data}
            rowKey={(row) => row.id}
            loading={isLoading}
            sort={table.sort}
            onSortChange={table.onSortChange}
            pagination={table.fullPagination(total)}
            onPageChange={table.onPageChange}
            onPageSizeChange={table.onPageSizeChange}
            onRowDoubleClick={(row) => router.push(`/dashboard/voucher/${row.id}`)}
            emptyMessage="No vouchers found"
            emptyDescription="Try adjusting your search or filter criteria"
          />
        )}
      </div>

      {/* Approve from list */}
      <ConfirmModal
        open={approveModal.isOpen}
        onClose={approveModal.close}
        onConfirm={() => approveModal.data && approveMutation.mutate(approveModal.data.id)}
        title="Approve Voucher"
        description={`Approve ${approveModal.data?.docNumber}? This will authorise the payment to be processed.`}
        confirmLabel="Approve Voucher"
        cancelLabel="Cancel"
        variant="primary"
        loading={approveMutation.isPending}
      />

    </>
  )
}