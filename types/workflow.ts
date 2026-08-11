// ─── Workflow Stage ──────────────────────────────────────────────
// Full pipeline per latest API Specifications:
// QS → Policy Placement → RFI → Voucher Invoice → Invoice
//   → Incoming Payment → Outgoing Payment → Shipment
export type WorkflowStage =
  | 'QS'
  | 'POLICY'
  | 'RFI'
  | 'VOUCHER_INVOICE'
  | 'INVOICE'
  | 'INCOMING_PAYMENT'
  | 'OUTGOING_PAYMENT'
  | 'SHIPMENT'

// ─── Document Status ──────────────────────────────────────────────
// Generic cross-module status vocabulary used by shared workflow
// utilities/components. Module-specific status enums (e.g. QSStatus)
// remain defined in their own module's types file and are separate
// from this shared shape.
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
export type Division = 'PI' | 'HM' | 'CARGO'

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
// Single source of truth for stage label/order. Shared workflow
// components (WorkflowStepper, LinkedWorkflowNavigator,
// StatusTransitionButton) must consume this rather than redefining
// their own local stage lists.
export interface StageConfig {
  key: WorkflowStage
  label: string
  shortLabel: string
  order: number
}

export const STAGE_CONFIG: Record<WorkflowStage, StageConfig> = {
  QS:                { key: 'QS',                label: 'Quotation Sheet',   shortLabel: 'QS',       order: 1 },
  POLICY:            { key: 'POLICY',             label: 'Policy Placement', shortLabel: 'Policy',   order: 2 },
  RFI:               { key: 'RFI',                label: 'Request For Invoice', shortLabel: 'RFI',   order: 3 },
  VOUCHER_INVOICE:   { key: 'VOUCHER_INVOICE',    label: 'Voucher Invoice',  shortLabel: 'Voucher',  order: 4 },
  INVOICE:           { key: 'INVOICE',            label: 'Invoice',          shortLabel: 'Invoice',  order: 5 },
  INCOMING_PAYMENT:  { key: 'INCOMING_PAYMENT',   label: 'Incoming Payment', shortLabel: 'Incoming', order: 6 },
  OUTGOING_PAYMENT:  { key: 'OUTGOING_PAYMENT',   label: 'Outgoing Payment', shortLabel: 'Outgoing', order: 7 },
  SHIPMENT:          { key: 'SHIPMENT',           label: 'Shipment',         shortLabel: 'Shipment', order: 8 },
}

export const WORKFLOW_STAGES: WorkflowStage[] = [
  'QS', 'POLICY', 'RFI', 'VOUCHER_INVOICE', 'INVOICE',
  'INCOMING_PAYMENT', 'OUTGOING_PAYMENT', 'SHIPMENT',
]