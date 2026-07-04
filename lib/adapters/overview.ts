/**
 * Overview adapters — map raw backend response fields to the frontend
 * OverviewData shape expected by page.tsx and all overview components.
 *
 * All transformation logic lives here. Components are never touched.
 */

import type { OverviewData, WorkflowStageCount, ActivityItem, ActivityType, FinanceSummary, OverdueItem, UpcomingPaymentItem } from '@/types/overview'
import type { WorkflowStage }  from '@/types/workflow'
import type { BackendStats, BackendWorkspace, BackendWorkflowStage, BackendActivityItem, BackendPaymentItem, BackendFinances } from '@/types/backend/overview'

// ─── Workflow stage label → WorkflowStage enum key ───────────────
// Backend returns human-readable label strings, not enum codes.
const STAGE_LABEL_MAP: Record<string, WorkflowStage> = {
  'Quotation Sheet': 'QS',
  'Invoice':         'INVOICE',
  'Voucher':         'VOUCHER',
  'Payment':         'PAYMENT',
  'Shipment':        'SHIPMENT',
}

// ─── ActivityType derivation ─────────────────────────────────────
// Backend provides action ("CREATE"|"UPDATE"|...) + reference_type
// ("QS"|"INVOICE"|...). Derive the frontend ActivityType union value.
// Falls back to 'qs_created' for unmappable combinations so the
// ActivityFeed component never receives an undefined config key.
function deriveActivityType(
  action: string,
  referenceType: string | null
): ActivityType {
  const key = `${action}__${referenceType ?? 'UNKNOWN'}`
  const map: Record<string, ActivityType> = {
    'CREATE__QS':       'qs_created',
    'UPDATE__QS':       'qs_approved',
    'CREATE__INVOICE':  'invoice_created',
    'UPDATE__INVOICE':  'invoice_approved',
    'CREATE__VOUCHER':  'voucher_created',
    'UPDATE__VOUCHER':  'voucher_created',
    'CREATE__PAYMENT':  'installment_recorded',
    'UPDATE__PAYMENT':  'payment_verified',
    'CREATE__SHIPMENT': 'shipment_completed',
    'UPDATE__SHIPMENT': 'shipment_completed',
    'CREATE__RECEIPT':  'shipment_completed',
    'DELETE__INVOICE':  'document_rejected',
    'DELETE__VOUCHER':  'document_rejected',
  }
  return map[key] ?? 'qs_created'
}

// ─── division_code → Division ────────────────────────────────────
// Backend stores division codes as "PPMID-XXXX" (auto-generated).
// The mapping to 'PI'|'HM' requires knowing seeded values.
// TODO: Replace with runtime lookup via GET /divisions once confirmed.
// For now we pass undefined and the ActivityFeed handles null safely.
function normalizeDivisionCode(
  _code: string | null
): 'PI' | 'HM' | undefined {
  // UNVERIFIED: actual PPMID-XXXX codes for P&I and H&M are not known
  // from source code alone. They depend on seeded division records.
  // Returning undefined causes ActivityFeed to skip the DivisionBadge.
  return undefined
}

// ─── Date → ISO string ────────────────────────────────────────────
// Prisma DateTime fields may serialize as Date objects or strings
// depending on the JSON transport layer. Normalise to ISO string.
function toISOString(value: string | Date | null | undefined): string {
  if (!value) return new Date().toISOString()
  if (value instanceof Date) return value.toISOString()
  return value
}

// ─── PaymentStatus mapping ────────────────────────────────────────
// Backend enum: UNPAID | INSTALLMENT | PAID
// Frontend enum: UNPAID | PARTIAL | PAID | OVERDUE
// INSTALLMENT → PARTIAL
// OVERDUE is derived from context (due_date < now), not a backend enum
function mapPaymentStatus(
  backendStatus: string,
  isOverdue: boolean
): 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' {
  if (isOverdue) return 'OVERDUE'
  if (backendStatus === 'INSTALLMENT') return 'PARTIAL'
  if (backendStatus === 'PAID') return 'PAID'
  return 'UNPAID'
}

// ════════════════════════════════════════════════════════════════
// PUBLIC ADAPTER FUNCTIONS
// ════════════════════════════════════════════════════════════════

/** Map GET /overview/stats response → OverviewData.summary */
export function mapStats(stats: BackendStats): OverviewData['summary'] {
  return {
    totalQS:            stats.quotation_sheets.total,
    activeInvoices:     stats.active_invoices.total,
    pendingPayments:    stats.pending_payments.total,
    overduePayments:    stats.overdue_payments.total,
    completedShipments: stats.completed_shipments.total,
  }
}

/** Map GET /overview/workspace .data.workflows → OverviewData.workflowPipeline */
export function mapWorkflowStages(
  stages: BackendWorkflowStage[]
): WorkflowStageCount[] {
  return stages
    .map((s): WorkflowStageCount | null => {
      const stage = STAGE_LABEL_MAP[s.stage]
      if (!stage) return null   // unknown stage label — skip safely
      return {
        stage,
        total:      s.total,
        completed:  s.completed,
        pending:    s.pending,
        inProgress: s.in_progress,
        overdue:    s.overdue,
      }
    })
    .filter((s): s is WorkflowStageCount => s !== null)
}

/** Map GET /overview/workspace .data.recents → OverviewData.recentActivity */
export function mapRecentActivity(items: BackendActivityItem[]): ActivityItem[] {
  return items.map((item): ActivityItem => ({
    id:          item.id,
    type:        deriveActivityType(item.action, item.reference_type),
    title:       item.title ?? item.action,
    description: item.description,
    actor:       item.actor,
    division:    normalizeDivisionCode(item.division_code),
    docNumber:   item.reference_number ?? '',
    timestamp:   toISOString(item.created_at),
  }))
}

/** Map GET /overview/workspace .data.finances → OverviewData.finance */
export function mapFinanceMonitor(finances: BackendFinances): FinanceSummary {
  return {
    unpaidInvoices:     finances.unpaid_invoices.count,
    unpaidTotal:        finances.unpaid_invoices.amount,
    overduePayments:    finances.overdue_payments.count,
    overdueTotal:       finances.overdue_payments.amount,
    upcomingDue7d:      finances.due_within_7_days.count,
    upcomingDue7dTotal: finances.due_within_7_days.amount,
    activeInstallments: finances.active_installments.plans,
    installmentsPending:finances.active_installments.pending_installments,
    // Backend does not return a currency field. Defaulting to IDR.
    // TODO: revisit once multi-currency finance monitor is implemented.
    currency:           'IDR',
  }
}

/** Map GET /overview/workspace .data.payments.overdue_payments → OverviewData.overdueItems */
export function mapOverdueItems(items: BackendPaymentItem[]): OverdueItem[] {
  return items.map((item): OverdueItem => ({
    id:           item.payment_id,
    docNumber:    item.invoice_number,   // backend returns invoice number (not payment number)
    clientName:   item.vendor_name,
    division:     undefined,             // not in backend response
    amount:       item.amount,
    currency:     'IDR',                 // backend does not return currency per item
    dueDate:      toISOString(item.due_date),
    daysOverdue:  item.overdue_days ?? 0,
    paymentStatus: mapPaymentStatus(item.payment_status, true),
  }))
}

/** Map GET /overview/workspace .data.payments.upcoming_payments → OverviewData.upcomingPayments */
export function mapUpcomingItems(items: BackendPaymentItem[]): UpcomingPaymentItem[] {
  return items.map((item): UpcomingPaymentItem => ({
    id:         item.payment_id,
    docNumber:  item.invoice_number,   // backend returns invoice number
    clientName: item.vendor_name,
    division:   undefined,             // not in backend response
    amount:     item.amount,
    currency:   'IDR',
    dueDate:    toISOString(item.due_date),
    daysLeft:   item.due_in_days ?? 0,
  }))
}

/**
 * Combine stats + workspace into the full OverviewData shape.
 * Called by page.tsx after both API calls complete.
 */
export function buildOverviewData(
  stats: BackendStats,
  workspace: BackendWorkspace
): OverviewData {
  return {
    summary:         mapStats(stats),
    workflowPipeline:mapWorkflowStages(workspace.workflows),
    recentActivity:  mapRecentActivity(workspace.recents),
    finance:         mapFinanceMonitor(workspace.finances),
    overdueItems:    mapOverdueItems(workspace.payments.overdue_payments),
    upcomingPayments:mapUpcomingItems(workspace.payments.upcoming_payments),
    divisionSummary: [],   // no backend source — DivisionOverview renders null safely
  }
}
