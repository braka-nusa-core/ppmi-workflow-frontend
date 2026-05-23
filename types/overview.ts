import type { Division, WorkflowStage, DocumentStatus, PaymentStatus } from './workflow'

// ─── Summary KPI Card ────────────────────────────────────────────
export interface SummaryMetric {
  label:      string
  value:      number
  subValue?:  string
  trend?:     { value: number; positive: boolean; label: string }
  status?:    'normal' | 'warning' | 'danger'
}

// ─── Workflow Stage Count ────────────────────────────────────────
export interface WorkflowStageCount {
  stage:      WorkflowStage
  pending:    number
  inProgress: number
  completed:  number
  overdue:    number
  total:      number
}

// ─── Activity Feed Item ──────────────────────────────────────────
export type ActivityType =
  | 'qs_created'
  | 'qs_approved'
  | 'invoice_created'
  | 'invoice_approved'
  | 'voucher_created'
  | 'payment_verified'
  | 'payment_overdue'
  | 'shipment_completed'
  | 'installment_recorded'
  | 'document_rejected'

export interface ActivityItem {
  id:         string
  type:       ActivityType
  title:      string
  description:string
  actor:      string
  division:   Division
  docNumber:  string
  timestamp:  string
}

// ─── Finance Summary ─────────────────────────────────────────────
export interface FinanceSummary {
  unpaidInvoices:        number
  unpaidTotal:           number
  overduePayments:       number
  overdueTotal:          number
  upcomingDue7d:         number
  upcomingDue7dTotal:    number
  activeInstallments:    number
  installmentsPending:   number
  currency:              'IDR' | 'USD'
}

// ─── Overdue Payment Item ────────────────────────────────────────
export interface OverdueItem {
  id:           string
  docNumber:    string
  clientName:   string
  division:     Division
  amount:       number
  currency:     'IDR' | 'USD'
  dueDate:      string
  daysOverdue:  number
  paymentStatus:PaymentStatus
}

// ─── Upcoming Payment Item ───────────────────────────────────────
export interface UpcomingPaymentItem {
  id:         string
  docNumber:  string
  clientName: string
  division:   Division
  amount:     number
  currency:   'IDR' | 'USD'
  dueDate:    string
  daysLeft:   number
}

// ─── Division Summary ────────────────────────────────────────────
export interface DivisionSummary {
  division:           Division
  activeWorkflows:    number
  pendingInvoices:    number
  completedPayments:  number
  overdueItems:       number
  totalValueIDR:      number
}

// ─── Full Overview Data ──────────────────────────────────────────
export interface OverviewData {
  summary:        {
    totalQS:            number
    activeInvoices:     number
    pendingPayments:    number
    overduePayments:    number
    completedShipments: number
  }
  workflowPipeline: WorkflowStageCount[]
  recentActivity:   ActivityItem[]
  finance:          FinanceSummary
  overdueItems:     OverdueItem[]
  upcomingPayments: UpcomingPaymentItem[]
  divisionSummary:  DivisionSummary[]
}
