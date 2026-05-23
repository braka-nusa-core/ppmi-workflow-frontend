// ─── Workflow Stage ──────────────────────────────────────────────
export type WorkflowStage =
  | 'QS'
  | 'INVOICE'
  | 'VOUCHER'
  | 'PAYMENT'
  | 'SHIPMENT'

// ─── Document Status ─────────────────────────────────────────────
export type DocumentStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'OVERDUE'

// ─── Payment Status ──────────────────────────────────────────────
export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIAL'
  | 'PAID'
  | 'OVERDUE'

// ─── Division ────────────────────────────────────────────────────
export type Division = 'PI' | 'HM'

// ─── Workflow Document Base ──────────────────────────────────────
export interface WorkflowDocument {
  id: string
  docNumber: string
  division: Division
  stage: WorkflowStage
  status: DocumentStatus
  createdAt: string
  updatedAt: string
  createdBy: string
}

// ─── Workflow Transition ─────────────────────────────────────────
export interface WorkflowTransition {
  from: WorkflowStage
  to: WorkflowStage
  label: string
  requiresRole: UserRole[]
}

// ─── User Role ───────────────────────────────────────────────────
export type UserRole = 'viewer' | 'editor' | 'finance' | 'administrator'

// ─── Stage Display Config ────────────────────────────────────────
export interface StageConfig {
  key: WorkflowStage
  label: string
  shortLabel: string
  order: number
}

export const STAGE_CONFIG: Record<WorkflowStage, StageConfig> = {
  QS:       { key: 'QS',       label: 'Quotation Sheet', shortLabel: 'QS',       order: 1 },
  INVOICE:  { key: 'INVOICE',  label: 'Invoice',          shortLabel: 'Invoice',  order: 2 },
  VOUCHER:  { key: 'VOUCHER',  label: 'Voucher',           shortLabel: 'Voucher',  order: 3 },
  PAYMENT:  { key: 'PAYMENT',  label: 'Payment',           shortLabel: 'Payment',  order: 4 },
  SHIPMENT: { key: 'SHIPMENT', label: 'Shipment',          shortLabel: 'Shipment', order: 5 },
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  'QS', 'INVOICE', 'VOUCHER', 'PAYMENT', 'SHIPMENT'
]
