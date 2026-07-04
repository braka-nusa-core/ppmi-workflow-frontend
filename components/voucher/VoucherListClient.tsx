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
import { fetchVoucherList, approveVoucher, advanceToPayment } from '@/lib/api/voucher'
import type { VoucherListItem, VoucherStatus, VoucherPaymentType } from '@/types/voucher'
import type { Division } from '@/types/workflow'

const VOUCHER_FILTERS: FilterDef[] = [
  {
    key: 'status', label: 'Status', type: 'select',
    options: [
      { value: 'DRAFT',            label: 'Draft'            },
      { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
      { value: 'APPROVED',         label: 'Approved'         },
      { value: 'PROCESSED',        label: 'Processed'        },
      { value: 'CANCELLED',        label: 'Cancelled'        },
    ],
  },
  {
    key: 'approvalStatus', label: 'Approval', type: 'select',
    options: [
      { value: 'WAITING',  label: 'Waiting'  },
      { value: 'APPROVED', label: 'Approved' },
      { value: 'REJECTED', label: 'Rejected' },
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
  const paymentModal = useModal<VoucherListItem>()

  // ── Typed query params ────────────────────────────────────────
  const voucherQueryParams = {
    page:           table.pagination.page,
    pageSize:       table.pagination.pageSize,
    search:         table.debouncedSearch || undefined,
    sortBy:         table.sort?.key,
    sortDir:        table.sort?.direction,
    status:         (table.activeFilters.status        as VoucherStatus     | undefined) || undefined,
    approvalStatus: (table.activeFilters.approvalStatus                     as string   | undefined) || undefined,
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
  const approveMutation = useMutation({
    mutationFn: (id: string) => approveVoucher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      success('Voucher Approved', `${approveModal.data?.docNumber} has been approved.`)
      approveModal.close()
    },
    onError: () => {
      toastError('Approval failed', 'Could not approve the voucher. Please try again.')
    },
  })

  // ── Advance to payment from list ──────────────────────────────
  const paymentMutation = useMutation({
    mutationFn: (id: string) => advanceToPayment(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['voucher-list'] })
      success('Payment Generated', 'Payment record has been created.')
      paymentModal.close()
      if (res.data?.paymentId) {
        router.push(`/dashboard/payment/${res.data.paymentId}`)
      } else {
        router.push('/dashboard/payment')
      }
    },
    onError: () => {
      toastError('Failed', 'Could not generate payment. Please try again.')
      paymentModal.close()
    },
  })

  const columns = useMemo(() => buildVoucherColumns({
    onView:            (row) => router.push(`/dashboard/voucher/${row.id}`),
    onEdit:            (row) => router.push(`/dashboard/voucher/${row.id}/edit`),
    onApprove:         (row) => approveModal.open(row),
    onGeneratePayment: (row) => paymentModal.open(row),
    onDownload:        (_row) => { /* PDF download wired in detail page */ },
    canEdit,
    canVerify,
    canCreate,
  }), [canEdit, canVerify, canCreate, router, approveModal, paymentModal])

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

      {/* Generate Payment */}
      <ConfirmModal
        open={paymentModal.isOpen}
        onClose={paymentModal.close}
        onConfirm={() => paymentModal.data && paymentMutation.mutate(paymentModal.data.id)}
        title="Generate Payment"
        description={`Generate a payment record from ${paymentModal.data?.docNumber}? This advances the workflow to the Payment stage.`}
        confirmLabel="Generate Payment"
        cancelLabel="Cancel"
        variant="primary"
        loading={paymentMutation.isPending}
      />
    </>
  )
}