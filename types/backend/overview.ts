/**
 * Raw backend Overview response types.
 * Reconstructed from usage in lib/adapters/overview.ts and lib/api/overview.ts —
 * this file was empty, which broke every consumer as a non-module.
 *
 * Used ONLY in lib/adapters/overview.ts and lib/api/overview.ts.
 */

// ─── GET /overview/stats ──────────────────────────────────────────
export interface BackendStatCount {
  total: number
}

export interface BackendStats {
  quotation_sheets:    BackendStatCount
  active_invoices:     BackendStatCount
  pending_payments:    BackendStatCount
  overdue_payments:    BackendStatCount
  completed_shipments: BackendStatCount
}

export interface BackendStatsEnvelope {
  success:     boolean
  status_code: number
  data:        BackendStats
}

// ─── GET /overview/workspace .data.workflows ─────────────────────
export interface BackendWorkflowStage {
  stage:       string   // human-readable label e.g. "Quotation Sheet"
  total:       number
  completed:   number
  pending:     number
  in_progress: number
  overdue:     number
}

// ─── GET /overview/workspace .data.recents ───────────────────────
export interface BackendActivityItem {
  id:               string
  action:           string               // "CREATE" | "UPDATE" | "DELETE"
  reference_type:   string | null        // "QS" | "INVOICE" | "VOUCHER" | "PAYMENT" | "SHIPMENT" | "RECEIPT"
  reference_number: string | null
  title:            string | null
  description:      string
  actor:            string
  division_code:    string | null
  created_at:       string | Date
}

// ─── GET /overview/workspace .data.finances ──────────────────────
export interface BackendFinanceMetric {
  count:  number
  amount: number
}

export interface BackendFinances {
  unpaid_invoices:     BackendFinanceMetric
  overdue_payments:    BackendFinanceMetric
  due_within_7_days:   BackendFinanceMetric
  active_installments: {
    plans:                number
    pending_installments: number
  }
}

// ─── GET /overview/workspace .data.payments.{overdue,upcoming} ──
export interface BackendPaymentItem {
  payment_id:     string
  invoice_number: string
  vendor_name:    string
  amount:         number
  due_date:       string | Date
  overdue_days?:  number
  due_in_days?:   number
  payment_status: string   // "UNPAID" | "INSTALLMENT" | "PAID"
}

export interface BackendWorkspacePayments {
  overdue_payments:  BackendPaymentItem[]
  upcoming_payments: BackendPaymentItem[]
}

export interface BackendWorkspace {
  workflows: BackendWorkflowStage[]
  recents:   BackendActivityItem[]
  finances:  BackendFinances
  payments:  BackendWorkspacePayments
}

export interface BackendWorkspaceEnvelope {
  success:     boolean
  status_code: number
  data:        BackendWorkspace
}