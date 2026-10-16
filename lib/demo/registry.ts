// FILE: lib/demo/registry.ts
// ═══════════════════════════════════════════════════════════════
// DEMO DATA REGISTRY — NOT REAL DATA
//
// One list of "deals" (a client programme followed through the PPMI
// workflow) from which EVERY downstream demo record is derived:
//
//   Quotation (real system, referenced by number only)
//     → Policy / Placement → RFI → Voucher → Invoice
//     → Incoming Payment → Outgoing Payment (insurers) → Shipment
//
// Because all modules are built from the same deal rows, client names,
// quotation / policy / RFI / voucher / invoice / payment numbers,
// amounts, dates and statuses always agree across lists, detail pages,
// cross-links and the Overview. Dates are relative to "now" so the demo
// never looks stale; document numbers are fixed.
//
// Used only by lib/demo/api/* (facades swapped in at build time when
// NEXT_PUBLIC_DEMO_MODE=true — see next.config.mjs) and by
// lib/demo/overviewDemoData.ts. Never imported by real-API code.
// ═══════════════════════════════════════════════════════════════

import type { Division } from '@/types/workflow'
import type {
  PolicyDocument, PolicyHistoryEvent, PolicyParticipant, PolicyStatus,
} from '@/types/policy'
import type { RfiDocument, RfiHistoryEvent, RfiStatus } from '@/types/rfi'
import type {
  VoucherActivity, VoucherDocument, VoucherListItem, VoucherPaymentType, VoucherStatus,
} from '@/types/voucher'
import type {
  InvoiceActivity, InvoiceDocument, InvoiceListItem, InvoicePaymentStatus, InvoiceStatus,
} from '@/types/invoice'
import type {
  PaymentActivity, PaymentDocument, PaymentInstallment, PaymentListItem, PaymentStatus,
  PaymentVerificationStatus,
} from '@/types/payment'
import type { OutgoingPaymentDocument, OutgoingPaymentStatus } from '@/types/outgoingPayment'
import type { ShipmentDocument, ShipmentListItem } from '@/types/shipment'
import type { BackendRfiChecklist } from '@/types/backend/rfi'
import { mapChecklist } from '@/lib/adapters/rfi'

const DAY = 86_400_000

// ─── Reference data ────────────────────────────────────────────────
export const DEMO_INSURERS = [
  { id: 'demo-ins-bahari',  name: 'PT Asuransi Bahari Nusantara' },
  { id: 'demo-ins-samudra', name: 'PT Asuransi Samudra Mandiri' },
  { id: 'demo-ins-tirta',   name: 'PT Asuransi Tirta Lestari' },
  { id: 'demo-ins-marlin',  name: 'PT Asuransi Marlin Jaya' },
] as const

const TEKNIK  = ['Dewi Anggraini', 'Rina Kusuma']
const FINANCE = ['Hendra Wijaya', 'Siti Maharani']
const ADMIN   = 'Bagus Santoso'

// ─── Deal definition (all "days" are relative to now) ─────────────
type Share = [insurerIndex: number, percent: number]

interface DealInstallment { amount: number; due: number; paidAgo?: number }

interface Deal {
  client:        string
  division:      Division
  insuranceType: string
  vessel:        string
  qs:            string
  pol: {
    no: string; status: PolicyStatus; created: number; completed?: number
    leader?: Share; members?: Share[]
  }
  rfi?: {
    no: string; status: RfiStatus; created: number; submitted?: number
    checklist: [boolean, boolean, boolean, boolean, boolean]; files: string[]
  }
  vch?: {
    no: string; status: VoucherStatus; ago: number; amount: number
    type: VoucherPaymentType; bank: string
  }
  inv?: {
    no: string; issued: number; due: number; amount: number; terms: number
    pay: string; paid: number; paidAgo?: number; verified: boolean; flagged?: boolean
    installments?: DealInstallment[]
  }
  ap?:  { no: string; insurer: number; amount: number; status: OutgoingPaymentStatus; ago: number; ref: string }[]
  shp?: { no: string; courier: string; tracking: string; ago: number }
}

const CHECKLIST_ALL: [boolean, boolean, boolean, boolean, boolean] = [true, true, true, true, true]

const DEALS: Deal[] = [
  { // 1 — placement just completed, RFI submitted to Finance
    client: 'PT Samudera Bahari Nusantara', division: 'HM', insuranceType: 'Hull & Machinery',
    vessel: 'MV Samudera Kencana', qs: 'QS-2026-0136',
    pol: { no: 'POL-2026-0118', status: 'PLACEMENT_COMPLETED', created: 6, completed: 1.2, leader: [0, 50], members: [[1, 30], [2, 20]] },
    rfi: { no: 'RFI-2026-0094', status: 'WAITING_FINANCE', created: 1, submitted: 0.09, checklist: [true, true, true, false, true],
           files: ['Policy Insurance MV Samudera Kencana.pdf', 'Signed Quotation Slip QS-2026-0136.pdf'] },
  },
  { // 2 — placement in progress (leader only so far)
    client: 'PT Bahtera Lintas Samudra', division: 'PI', insuranceType: 'Protection & Indemnity',
    vessel: 'MT Bahtera Sejati', qs: 'QS-2026-0139',
    pol: { no: 'POL-2026-0121', status: 'PLACEMENT_IN_PROGRESS', created: 3, leader: [1, 60] },
  },
  { // 3 — invoice overdue (12 days), nothing paid
    client: 'PT Karya Bahtera Mandiri', division: 'HM', insuranceType: 'Hull & Machinery',
    vessel: 'MV Karya Bahtera 7', qs: 'QS-2026-0071',
    pol: { no: 'POL-2026-0087', status: 'PLACEMENT_COMPLETED', created: 72, completed: 67, leader: [0, 55], members: [[3, 45]] },
    rfi: { no: 'RFI-2026-0062', status: 'PROCESSED', created: 62, submitted: 61, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance MV Karya Bahtera 7.pdf', 'Signed Quotation Slip QS-2026-0071.pdf'] },
    vch: { no: 'VCH-2026-0054', status: 'CLOSED', ago: 57, amount: 512_400_000, type: 'BANK_TRANSFER', bank: 'Bank Mandiri' },
    inv: { no: 'INV-2026-0388', issued: 52, due: -12, amount: 512_400_000, terms: 40, pay: 'PAY-2026-0212', paid: 0, verified: false },
  },
  { // 4 — instalment plan, 1 of 4 paid, 2nd overdue (8 days)
    client: 'PT Nusa Tenggara Maritim', division: 'PI', insuranceType: 'Protection & Indemnity',
    vessel: 'KM Nusa Dharma', qs: 'QS-2026-0066',
    pol: { no: 'POL-2026-0083', status: 'PLACEMENT_COMPLETED', created: 80, completed: 75, leader: [2, 60], members: [[0, 40]] },
    rfi: { no: 'RFI-2026-0058', status: 'PROCESSED', created: 68, submitted: 67, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance KM Nusa Dharma.pdf', 'Signed Renewal 2026.pdf', 'Attachment Checklist.pdf'] },
    vch: { no: 'VCH-2026-0051', status: 'CLOSED', ago: 63, amount: 398_000_000, type: 'RTGS', bank: 'Bank Negara Indonesia' },
    inv: { no: 'INV-2026-0371', issued: 58, due: -8, amount: 398_000_000, terms: 50, pay: 'PAY-2026-0198', paid: 99_500_000, paidAgo: 31, verified: true,
           installments: [
             { amount: 99_500_000, due: -30, paidAgo: 31 },
             { amount: 99_500_000, due: -8 },
             { amount: 99_500_000, due: 22 },
             { amount: 99_500_000, due: 52 },
           ] },
  },
  { // 5 — cargo, invoice overdue (3 days)
    client: 'PT Armada Lintas Pulau', division: 'CARGO', insuranceType: 'Marine Cargo',
    vessel: 'KM Armada Express', qs: 'QS-2026-0089',
    pol: { no: 'POL-2026-0090', status: 'PLACEMENT_COMPLETED', created: 62, completed: 59, leader: [3, 70], members: [[1, 30]] },
    rfi: { no: 'RFI-2026-0068', status: 'PROCESSED', created: 54, submitted: 53, checklist: CHECKLIST_ALL,
           files: ['Open Cargo Policy 2026.pdf', 'Signed Quotation Slip QS-2026-0089.pdf'] },
    vch: { no: 'VCH-2026-0060', status: 'CLOSED', ago: 49, amount: 252_000_000, type: 'BANK_TRANSFER', bank: 'Bank Central Asia' },
    inv: { no: 'INV-2026-0402', issued: 44, due: -3, amount: 252_000_000, terms: 41, pay: 'PAY-2026-0225', paid: 0, verified: false },
  },
  { // 9 — paid in full yesterday, awaiting Finance verification
    client: 'PT Bahtera Lintas Samudra', division: 'PI', insuranceType: 'Protection & Indemnity',
    vessel: 'MT Bahtera Mulia', qs: 'QS-2026-0097',
    pol: { no: 'POL-2026-0092', status: 'PLACEMENT_COMPLETED', created: 54, completed: 51, leader: [1, 60], members: [[2, 40]] },
    rfi: { no: 'RFI-2026-0074', status: 'PROCESSED', created: 46, submitted: 45, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance MT Bahtera Mulia.pdf', 'Signed Quotation Slip QS-2026-0097.pdf'] },
    vch: { no: 'VCH-2026-0066', status: 'CLOSED', ago: 41, amount: 218_000_000, type: 'SWIFT', bank: 'Bank Negara Indonesia' },
    inv: { no: 'INV-2026-0414', issued: 36, due: 6, amount: 218_000_000, terms: 42, pay: 'PAY-2026-0233', paid: 218_000_000, paidAgo: 1, verified: false },
  },
  { // 10 — partial transfer received, awaiting Finance verification
    client: 'PT Mutiara Segara Pelayaran', division: 'PI', insuranceType: 'Protection & Indemnity',
    vessel: 'MV Mutiara Timur', qs: 'QS-2026-0099',
    pol: { no: 'POL-2026-0095', status: 'PLACEMENT_COMPLETED', created: 51, completed: 48, leader: [0, 50], members: [[3, 50]] },
    rfi: { no: 'RFI-2026-0077', status: 'PROCESSED', created: 43, submitted: 42, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance MV Mutiara Timur.pdf', 'Signed Quotation Slip QS-2026-0099.pdf'] },
    vch: { no: 'VCH-2026-0069', status: 'CLOSED', ago: 38, amount: 287_000_000, type: 'RTGS', bank: 'Bank Central Asia' },
    inv: { no: 'INV-2026-0419', issued: 33, due: 5, amount: 287_000_000, terms: 38, pay: 'PAY-2026-0238', paid: 100_000_000, paidAgo: 2, verified: false },
  },
  { // 8 — transfer received but flagged by Finance (amount differs); balance due in 3 days
    client: 'PT Samudera Bahari Nusantara', division: 'HM', insuranceType: 'Hull & Machinery',
    vessel: 'MV Samudera Persada', qs: 'QS-2026-0105',
    pol: { no: 'POL-2026-0098', status: 'PLACEMENT_COMPLETED', created: 48, completed: 45, leader: [0, 60], members: [[1, 25], [2, 15]] },
    rfi: { no: 'RFI-2026-0081', status: 'PROCESSED', created: 40, submitted: 39, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance MV Samudera Persada.pdf', 'Signed Quotation Slip QS-2026-0105.pdf'] },
    vch: { no: 'VCH-2026-0072', status: 'CLOSED', ago: 35, amount: 421_400_000, type: 'BANK_TRANSFER', bank: 'Bank Mandiri' },
    inv: { no: 'INV-2026-0425', issued: 30, due: 3, amount: 421_400_000, terms: 33, pay: 'PAY-2026-0244', paid: 400_000_000, paidAgo: 3, verified: false, flagged: true },
  },
  { // 6 — cargo, due in 2 days
    client: 'PT Tirta Kencana Logistik', division: 'CARGO', insuranceType: 'Marine Cargo',
    vessel: 'KM Tirta Kencana', qs: 'QS-2026-0111',
    pol: { no: 'POL-2026-0102', status: 'READY_FOR_RFI', created: 45, completed: 42, leader: [3, 60], members: [[0, 40]] },
    rfi: { no: 'RFI-2026-0085', status: 'PROCESSED', created: 37, submitted: 36, checklist: CHECKLIST_ALL,
           files: ['Open Cargo Policy 2026.pdf', 'Signed Quotation Slip QS-2026-0111.pdf'] },
    vch: { no: 'VCH-2026-0076', status: 'CLOSED', ago: 32, amount: 612_500_000, type: 'BANK_TRANSFER', bank: 'Bank Rakyat Indonesia' },
    inv: { no: 'INV-2026-0431', issued: 27, due: 2, amount: 612_500_000, terms: 29, pay: 'PAY-2026-0251', paid: 0, verified: false },
  },
  { // 7 — fully paid, insurers paid, documents shipped
    client: 'PT Mutiara Segara Pelayaran', division: 'PI', insuranceType: 'Protection & Indemnity',
    vessel: 'MV Mutiara Segara', qs: 'QS-2026-0048',
    pol: { no: 'POL-2026-0076', status: 'PLACEMENT_COMPLETED', created: 98, completed: 95, leader: [1, 60], members: [[2, 40]] },
    rfi: { no: 'RFI-2026-0046', status: 'PROCESSED', created: 90, submitted: 89, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance MV Mutiara Segara.pdf', 'Signed Quotation Slip QS-2026-0048.pdf'] },
    vch: { no: 'VCH-2026-0041', status: 'CLOSED', ago: 85, amount: 345_000_000, type: 'BANK_TRANSFER', bank: 'Bank Central Asia' },
    inv: { no: 'INV-2026-0358', issued: 80, due: -50, amount: 345_000_000, terms: 30, pay: 'PAY-2026-0194', paid: 345_000_000, paidAgo: 52, verified: true },
    ap:  [
      { no: 'AP-2026-0017', insurer: 1, amount: 207_000_000, status: 'FULLY_PAID', ago: 48, ref: 'TRX-ASM-20260412' },
      { no: 'AP-2026-0018', insurer: 2, amount: 138_000_000, status: 'FULLY_PAID', ago: 48, ref: 'TRX-ATL-20260413' },
    ],
    shp: { no: 'SHP-2026-0029', courier: 'JNE Express', tracking: 'JNE0098123456', ago: 45 },
  },
  { // 11 — cargo, fully paid, shipped
    client: 'PT Tirta Kencana Logistik', division: 'CARGO', insuranceType: 'Marine Cargo',
    vessel: 'KM Tirta Bahari', qs: 'QS-2026-0033',
    pol: { no: 'POL-2026-0064', status: 'PLACEMENT_COMPLETED', created: 118, completed: 115, leader: [0, 70], members: [[3, 30]] },
    rfi: { no: 'RFI-2026-0038', status: 'PROCESSED', created: 110, submitted: 109, checklist: CHECKLIST_ALL,
           files: ['Open Cargo Policy 2025.pdf', 'Signed Renewal 2026.pdf'] },
    vch: { no: 'VCH-2026-0033', status: 'CLOSED', ago: 105, amount: 428_000_000, type: 'RTGS', bank: 'Bank Mandiri' },
    inv: { no: 'INV-2026-0344', issued: 100, due: -70, amount: 428_000_000, terms: 30, pay: 'PAY-2026-0187', paid: 428_000_000, paidAgo: 72, verified: true },
    ap:  [
      { no: 'AP-2026-0011', insurer: 0, amount: 299_600_000, status: 'FULLY_PAID', ago: 68, ref: 'TRX-ABN-20260203' },
      { no: 'AP-2026-0012', insurer: 3, amount: 128_400_000, status: 'FULLY_PAID', ago: 68, ref: 'TRX-AMJ-20260204' },
    ],
    shp: { no: 'SHP-2026-0024', courier: 'SiCepat Ekspres', tracking: '000481237654', ago: 65 },
  },
  { // 12 — hull, fully paid, insurer payments partly settled, shipped
    client: 'PT Nusa Tenggara Maritim', division: 'HM', insuranceType: 'Hull & Machinery',
    vessel: 'KM Nusa Bakti', qs: 'QS-2026-0021',
    pol: { no: 'POL-2026-0058', status: 'PLACEMENT_COMPLETED', created: 138, completed: 135, leader: [2, 50], members: [[1, 30], [3, 20]] },
    rfi: { no: 'RFI-2026-0031', status: 'PROCESSED', created: 130, submitted: 129, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance KM Nusa Bakti.pdf', 'Signed Quotation Slip QS-2026-0021.pdf'] },
    vch: { no: 'VCH-2026-0027', status: 'CLOSED', ago: 125, amount: 560_000_000, type: 'BANK_TRANSFER', bank: 'Bank Negara Indonesia' },
    inv: { no: 'INV-2026-0331', issued: 120, due: -90, amount: 560_000_000, terms: 30, pay: 'PAY-2026-0176', paid: 560_000_000, paidAgo: 93, verified: true },
    ap:  [
      { no: 'AP-2026-0006', insurer: 2, amount: 280_000_000, status: 'FULLY_PAID',      ago: 88, ref: 'TRX-ATL-20260110' },
      { no: 'AP-2026-0007', insurer: 1, amount: 84_000_000,  status: 'PARTIAL_PAYMENT', ago: 88, ref: 'TRX-ASM-20260111' },
    ],
    shp: { no: 'SHP-2026-0019', courier: 'DHL Express', tracking: '7421958340', ago: 85 },
  },
  { // 14 — RFI processed, voucher awaiting approval
    client: 'PT Armada Lintas Pulau', division: 'HM', insuranceType: 'Hull & Machinery',
    vessel: 'MV Armada Jaya', qs: 'QS-2026-0124',
    pol: { no: 'POL-2026-0110', status: 'PLACEMENT_COMPLETED', created: 20, completed: 16, leader: [0, 60], members: [[2, 40]] },
    rfi: { no: 'RFI-2026-0089', status: 'PROCESSED', created: 14, submitted: 13, checklist: CHECKLIST_ALL,
           files: ['Policy Insurance MV Armada Jaya.pdf', 'Signed Quotation Slip QS-2026-0124.pdf'] },
    vch: { no: 'VCH-2026-0079', status: 'PENDING', ago: 1, amount: 330_000_000, type: 'BANK_TRANSFER', bank: 'Bank Rakyat Indonesia' },
  },
  { // 15 — ready for RFI, RFI still a draft
    client: 'PT Mutiara Segara Pelayaran', division: 'CARGO', insuranceType: 'Marine Cargo',
    vessel: 'KM Mutiara Cargo', qs: 'QS-2026-0128',
    pol: { no: 'POL-2026-0114', status: 'READY_FOR_RFI', created: 12, completed: 9, leader: [3, 100] },
    rfi: { no: 'RFI-2026-0091', status: 'DRAFT', created: 7, checklist: [true, false, false, false, false],
           files: ['Open Cargo Policy 2026.pdf'] },
  },
  { // 13 — policy created, placement not started
    client: 'PT Karya Bahtera Mandiri', division: 'PI', insuranceType: 'Protection & Indemnity',
    vessel: 'MT Karya Samudra', qs: 'QS-2026-0142',
    pol: { no: 'POL-2026-0125', status: 'POLICY_CREATED', created: 0.2 },
  },
]

// ─── Dataset ─────────────────────────────────────────────────────
export interface DemoDataset {
  policies:      PolicyDocument[]
  policyHistory: Record<string, PolicyHistoryEvent[]>
  rfis:          RfiDocument[]
  rfiHistory:    Record<string, RfiHistoryEvent[]>
  vouchers:      VoucherDocument[]
  voucherList:   VoucherListItem[]
  invoices:      InvoiceDocument[]
  invoiceList:   InvoiceListItem[]
  payments:      PaymentDocument[]
  paymentList:   PaymentListItem[]
  outgoing:      OutgoingPaymentDocument[]
  shipments:     ShipmentDocument[]
  shipmentList:  ShipmentListItem[]
}

export function getDemoDataset(now: Date = new Date()): DemoDataset {
  const t   = now.getTime()
  const iso = (agoDays: number) => new Date(t - agoDays * DAY).toISOString()

  const ds: DemoDataset = {
    policies: [], policyHistory: {}, rfis: [], rfiHistory: {}, vouchers: [], voucherList: [],
    invoices: [], invoiceList: [], payments: [], paymentList: [], outgoing: [], shipments: [], shipmentList: [],
  }

  DEALS.forEach((d, i) => {
    const teknik  = TEKNIK[i % TEKNIK.length]
    const finance = FINANCE[i % FINANCE.length]

    // ── Policy ────────────────────────────────────────────────
    const participant = (share: Share, id: string, role: 'leader' | 'member'): PolicyParticipant => ({
      id,
      insuranceCompanyId:   DEMO_INSURERS[share[0]].id,
      insuranceCompanyName: DEMO_INSURERS[share[0]].name,
      role,
      sharePercentage:      share[1],
    })
    const leader  = d.pol.leader ? participant(d.pol.leader, `${d.pol.no}-L`, 'leader') : null
    const members = (d.pol.members ?? []).map((m, k) => participant(m, `${d.pol.no}-M${k + 1}`, 'member'))
    const participants = [...(leader ? [leader] : []), ...members]
    const totalShare = participants.reduce((s, p) => s + p.sharePercentage, 0)
    const polUpdated = d.pol.completed ?? d.pol.created

    ds.policies.push({
      id: d.pol.no, quotationId: `demo-${d.qs}`, quotationNumber: d.qs, policyNumber: d.pol.no,
      policyDate: iso(d.pol.created), insured: d.client, status: d.pol.status, totalShare,
      createdAt: iso(d.pol.created), updatedAt: iso(polUpdated),
      leader, members, participants,
    })

    const polHistory: PolicyHistoryEvent[] = [
      { id: `${d.pol.no}-h1`, action: 'Policy Created', description: `Policy created from ${d.qs}`, performedBy: teknik, createdAt: iso(d.pol.created) },
    ]
    if (leader) polHistory.push({
      id: `${d.pol.no}-h2`, action: 'Leader Added', description: `${leader.insuranceCompanyName} — ${leader.sharePercentage}%`,
      performedBy: teknik, createdAt: iso(d.pol.created - 0.1),
    })
    members.forEach((m, k) => polHistory.push({
      id: `${d.pol.no}-h${3 + k}`, action: 'Member Added', description: `${m.insuranceCompanyName} — ${m.sharePercentage}%`,
      performedBy: teknik, createdAt: iso(d.pol.created - 0.2 - k * 0.1),
    }))
    if (d.pol.completed !== undefined) polHistory.push({
      id: `${d.pol.no}-hc`, action: 'Placement Completed', description: 'Placement validated — total share 100%',
      performedBy: teknik, createdAt: iso(d.pol.completed),
    })
    ds.policyHistory[d.pol.no] = polHistory.reverse()

    // ── RFI ───────────────────────────────────────────────────
    if (d.rfi) {
      const [a, b, c, e, f] = d.rfi.checklist
      const checklist: BackendRfiChecklist = {
        policyInsurance: a, signedQuotation: b, signedRenewal: c, cnDn: e, attachmentChecklist: f,
      }
      ds.rfis.push({
        id: d.rfi.no, policyId: d.pol.no, policyNumber: d.pol.no, quotationNumber: d.qs, insured: d.client,
        status: d.rfi.status, requestedBy: teknik, submittedAt: d.rfi.submitted !== undefined ? iso(d.rfi.submitted) : undefined,
        createdAt: iso(d.rfi.created), updatedAt: iso(d.rfi.submitted ?? d.rfi.created),
        leader, members, totalShare,
        checklist: mapChecklist(checklist),
        attachments: d.rfi.files.map((fileName, k) => ({
          id: `${d.rfi!.no}-A${k + 1}`, fileName, fileUrl: '#', uploadedBy: teknik, uploadedAt: iso(d.rfi!.created - 0.1 * (k + 1)),
        })),
      })
      const h: RfiHistoryEvent[] = [
        { id: `${d.rfi.no}-h1`, action: 'Create RFI', description: `RFI created for ${d.pol.no}`, performedBy: teknik, createdAt: iso(d.rfi.created) },
        { id: `${d.rfi.no}-h2`, action: 'Attachment Uploaded', description: d.rfi.files[0], performedBy: teknik, createdAt: iso(d.rfi.created - 0.1) },
        { id: `${d.rfi.no}-h3`, action: 'Checklist Updated', description: 'Checklist updated', performedBy: teknik, createdAt: iso(d.rfi.created - 0.2) },
      ]
      if (d.rfi.submitted !== undefined) h.push({
        id: `${d.rfi.no}-h4`, action: 'Submit', description: 'Submitted to Finance', performedBy: teknik, createdAt: iso(d.rfi.submitted),
      })
      if (d.rfi.status === 'PROCESSED') h.push({
        id: `${d.rfi.no}-h5`, action: 'Finance Processed', description: 'Processed by Finance', performedBy: finance,
        createdAt: iso((d.rfi.submitted ?? d.rfi.created) - 0.5),
      })
      ds.rfiHistory[d.rfi.no] = h.reverse()
    }

    // ── Voucher ───────────────────────────────────────────────
    if (d.vch && d.rfi) {
      const closed  = d.vch.status === 'CLOSED'
      const hasPay  = !!d.inv
      const swift   = d.vch.type === 'SWIFT'
      const activity: VoucherActivity[] = [
        { id: `${d.vch.no}-a1`, type: 'created',   description: 'Voucher created from RFI ' + d.rfi.no, actor: finance, timestamp: iso(d.vch.ago + 0.3) },
        { id: `${d.vch.no}-a2`, type: 'submitted', description: 'Submitted for approval', actor: finance, timestamp: iso(d.vch.ago + 0.2) },
      ]
      if (closed) activity.push(
        { id: `${d.vch.no}-a3`, type: 'approved',  description: `Approved by ${ADMIN}`, actor: ADMIN, timestamp: iso(d.vch.ago + 0.1) },
        { id: `${d.vch.no}-a4`, type: 'processed', description: 'Voucher processed', actor: finance, timestamp: iso(d.vch.ago) },
      )
      const doc: VoucherDocument = {
        id: d.vch.no, docNumber: d.vch.no, division: d.division, status: d.vch.status,
        rfiId: d.rfi.no, rfiNumber: d.rfi.no,
        paymentId: hasPay ? d.inv!.pay : undefined, paymentNumber: hasPay ? d.inv!.pay : undefined,
        insuredName: d.client, vesselName: d.vessel,
        paymentType: d.vch.type, currency: 'IDR', amount: d.vch.amount,
        bankName: d.vch.bank, bankBranch: 'Jakarta Pusat',
        accountNumber: `1200${String(70000 + i * 137).padStart(6, '0')}`,
        accountName: leader?.insuranceCompanyName ?? d.client,
        swiftCode: swift ? 'BNINIDJA' : undefined,
        processingDate: closed ? iso(d.vch.ago + 0.1) : undefined,
        processedDate:  closed ? iso(d.vch.ago) : undefined,
        processedBy:    closed ? finance : undefined,
        approvalPIC: ADMIN,
        approvedBy: closed ? ADMIN : undefined, approvedAt: closed ? iso(d.vch.ago + 0.1) : undefined,
        internalNotes: `Premium ${d.insuranceType} — ${d.vessel}`,
        attachments: [],
        createdBy: finance, createdAt: iso(d.vch.ago + 0.3), updatedBy: finance, updatedAt: iso(d.vch.ago),
        activity,
      }
      ds.vouchers.push(doc)
      ds.voucherList.push({
        id: doc.id, docNumber: doc.docNumber, division: doc.division, rfiNumber: doc.rfiNumber,
        insuredName: doc.insuredName, paymentType: doc.paymentType, bankName: doc.bankName,
        currency: doc.currency, amount: doc.amount, status: doc.status,
        hasPayment: hasPay, paymentNumber: doc.paymentNumber, createdAt: doc.createdAt,
      })
    }

    // ── Invoice + Incoming Payment ───────────────────────────
    if (d.inv && d.vch && d.rfi) {
      const inv       = d.inv
      const remaining = inv.amount - inv.paid
      const invStatus: InvoiceStatus = remaining === 0 ? 'PAID' : inv.paid > 0 ? 'PARTIAL' : 'UNPAID'   // issued invoices awaiting payment are UNPAID
      const invPay: InvoicePaymentStatus = remaining === 0 ? 'PAID' : inv.paid > 0 ? 'PARTIAL' : 'UNPAID'
      const overdue   = remaining > 0 && inv.due < 0
      const payStatus: PaymentStatus = remaining === 0 ? 'PAID' : overdue ? 'OVERDUE' : inv.paid > 0 ? 'PARTIAL' : 'UNPAID'
      const verification: PaymentVerificationStatus = inv.flagged ? 'FLAGGED' : inv.verified ? 'VERIFIED' : 'UNVERIFIED'
      const hasShip   = !!d.shp

      const invActivity: InvoiceActivity[] = [
        { id: `${inv.no}-a1`, type: 'issued', description: 'Invoice issued', actor: finance, timestamp: iso(inv.issued) },
        { id: `${inv.no}-a2`, type: 'sent',   description: 'Invoice sent to client', actor: finance, timestamp: iso(inv.issued - 0.1) },
      ]
      if (inv.paid > 0 && inv.paidAgo !== undefined) invActivity.push({
        id: `${inv.no}-a3`, type: remaining === 0 ? 'payment_received' : 'payment_partial',
        description: remaining === 0 ? 'Payment received in full' : inv.installments ? 'Instalment received' : 'Partial payment received',
        actor: finance, timestamp: iso(inv.paidAgo), meta: { amount: inv.paid, currency: 'IDR' },
      })
      if (overdue) invActivity.push({
        id: `${inv.no}-a4`, type: 'overdue_flagged', description: 'Flagged as overdue', actor: 'System', timestamp: iso(-inv.due),
      })

      const invDoc: InvoiceDocument = {
        id: inv.no, docNumber: inv.no, division: d.division, status: invStatus, paymentStatus: invPay,
        voucherInvoiceId: d.vch.no, voucherInvoiceNumber: d.vch.no,
        policyNumber: d.pol.no, premium: inv.amount,
        insuranceCompanyName: leader?.insuranceCompanyName,
        leaderName: leader?.insuranceCompanyName, memberNames: members.map((m) => m.insuranceCompanyName ?? ''),
        insuredName: d.client, vesselName: d.vessel,
        billingAddress: 'Jakarta, Indonesia', billingContact: 'Finance Department',
        currency: 'IDR', subtotal: inv.amount, totalAmount: inv.amount, paidAmount: inv.paid, remainingAmount: remaining,
        issueDate: iso(inv.issued), dueDate: iso(-inv.due), sentDate: iso(inv.issued - 0.1),
        paidDate: remaining === 0 && inv.paidAgo !== undefined ? iso(inv.paidAgo) : undefined,
        paymentTerms: `Net ${inv.terms} days`,
        bankInfo: { bankName: 'Bank Mandiri', accountNumber: '1230099887766', accountName: 'PT Pandi Proteksi Marine Indonesia', bankBranch: 'Jakarta Kuningan' },
        internalNotes: `${d.insuranceType} — ${d.vessel} (${d.qs})`,
        attachments: [],
        createdBy: finance, createdAt: iso(inv.issued), updatedBy: finance, updatedAt: iso(inv.paidAgo ?? inv.issued),
        activity: invActivity.reverse(),
      }
      ds.invoices.push(invDoc)
      ds.invoiceList.push({
        id: invDoc.id, docNumber: invDoc.docNumber, division: invDoc.division, voucherInvoiceNumber: invDoc.voucherInvoiceNumber,
        insuredName: invDoc.insuredName, vesselName: invDoc.vesselName, currency: invDoc.currency,
        totalAmount: invDoc.totalAmount, paidAmount: invDoc.paidAmount, remainingAmount: invDoc.remainingAmount,
        dueDate: invDoc.dueDate, status: invDoc.status, paymentStatus: invDoc.paymentStatus, createdAt: invDoc.createdAt,
      })

      // Incoming payment
      let installments: PaymentInstallment[] | undefined
      if (inv.installments) {
        installments = inv.installments.map((s, k) => ({
          id: `${inv.pay}-I${k + 1}`, installmentNumber: k + 1, dueDate: iso(-s.due), amount: s.amount,
          paidDate: s.paidAgo !== undefined ? iso(s.paidAgo) : undefined,
          paidAmount: s.paidAgo !== undefined ? s.amount : undefined,
          status: s.paidAgo !== undefined ? 'PAID' : s.due < 0 ? 'OVERDUE' : 'UNPAID',
          paymentMethod: s.paidAgo !== undefined ? 'BANK_TRANSFER' : undefined,
          referenceNumber: s.paidAgo !== undefined ? `BNK-${inv.pay.slice(-4)}-${k + 1}` : undefined,
        }))
      }
      const payActivity: PaymentActivity[] = []
      if (installments) {
        installments.filter((s) => s.paidDate).forEach((s) => payActivity.push({
          id: `${inv.pay}-p${s.installmentNumber}`, action: 'Payment Recorded',
          description: `Instalment ${s.installmentNumber} of ${installments!.length} received`,
          performedBy: finance, createdAt: s.paidDate!, meta: { installmentNumber: s.installmentNumber },
        }))
      } else if (inv.paid > 0 && inv.paidAgo !== undefined) {
        payActivity.push({
          id: `${inv.pay}-p1`, action: 'Payment Recorded',
          description: inv.flagged
            ? 'Partial payment received — flagged for review (amount differs from the expected transfer)'
            : (remaining === 0 ? 'Full payment received' : 'Partial payment received') + (inv.verified ? ' and verified' : ' — awaiting verification'),
          performedBy: finance, createdAt: iso(inv.paidAgo), meta: { fromStatus: 'UNPAID', toStatus: remaining === 0 ? 'PAID' : 'PARTIAL' },
        })
      }

      const payDoc: PaymentDocument = {
        id: inv.pay, docNumber: inv.pay, division: d.division, paymentStatus: payStatus, verificationStatus: verification,
        invoiceId: inv.no, invoiceNumber: inv.no, voucherId: d.vch.no, voucherNumber: d.vch.no,
        shipmentId: d.shp?.no, shipmentNumber: d.shp?.no,
        insuredName: d.client, vesselName: d.vessel, currency: 'IDR',
        totalAmount: inv.amount, paidAmount: inv.paid, remainingAmount: remaining,
        dueDate: iso(-inv.due), paidDate: remaining === 0 && inv.paidAgo !== undefined ? iso(inv.paidAgo) : undefined,
        isInstallment: !!installments, installments,
        lastPaymentDate: inv.paidAgo !== undefined ? iso(inv.paidAgo) : undefined,
        lastPaymentAmount: inv.paidAgo !== undefined ? (installments ? installments[0].amount : inv.paid) : undefined,
        lastPaymentMethod: inv.paidAgo !== undefined ? 'BANK_TRANSFER' : undefined,
        lastReferenceNumber: inv.paidAgo !== undefined ? `BNK-${inv.pay.slice(-4)}-1` : undefined,
        internalNotes: inv.flagged ? 'Flagged for review: the received transfer does not match the expected amount.' : undefined,
        createdBy: finance, createdAt: iso(inv.issued), updatedAt: iso(inv.paidAgo ?? inv.issued),
        activity: payActivity.reverse(),
      }
      ds.payments.push(payDoc)
      ds.paymentList.push({
        id: payDoc.id, docNumber: payDoc.docNumber, division: payDoc.division, invoiceId: payDoc.invoiceId,
        invoiceNumber: payDoc.invoiceNumber, voucherNumber: payDoc.voucherNumber, insuredName: payDoc.insuredName,
        vesselName: payDoc.vesselName, currency: payDoc.currency, totalAmount: payDoc.totalAmount,
        paidAmount: payDoc.paidAmount, remainingAmount: payDoc.remainingAmount, dueDate: payDoc.dueDate,
        paymentStatus: payDoc.paymentStatus, verificationStatus: payDoc.verificationStatus,
        isInstallment: payDoc.isInstallment, installmentCount: installments?.length,
        hasShipment: hasShip, shipmentNumber: d.shp?.no, createdAt: payDoc.createdAt,
      })

      // Outgoing payments (to insurers)
      d.ap?.forEach((ap) => ds.outgoing.push({
        id: ap.no, docNumber: ap.no, invoiceId: inv.no, invoiceNumber: inv.no, insuredName: d.client,
        insuranceCompanyId: DEMO_INSURERS[ap.insurer].id, insuranceCompanyName: DEMO_INSURERS[ap.insurer].name,
        paymentDate: iso(ap.ago), amount: ap.amount, bankReference: ap.ref, status: ap.status,
        createdAt: iso(ap.ago), createdBy: finance, updatedAt: iso(ap.ago),
      }))

      // Shipment
      if (d.shp) {
        const sh: ShipmentDocument = {
          id: d.shp.no, docNumber: d.shp.no, invoiceId: inv.no, invoiceNumber: inv.no, paymentId: inv.pay,
          courier: d.shp.courier, trackingNumber: d.shp.tracking, shippingDate: iso(d.shp.ago),
          division: d.division, createdAt: iso(d.shp.ago), updatedAt: iso(d.shp.ago),
        }
        ds.shipments.push(sh)
        ds.shipmentList.push({
          id: sh.id, docNumber: sh.docNumber, invoiceId: sh.invoiceId, invoiceNumber: sh.invoiceNumber,
          paymentId: sh.paymentId, courier: sh.courier, trackingNumber: sh.trackingNumber,
          shippingDate: sh.shippingDate, createdAt: sh.createdAt,
        })
      }
    }
  })

  // Newest first — what the real backend lists return by default.
  const byNewest = <T extends { createdAt: string }>(rows: T[]) =>
    rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  byNewest(ds.policies); byNewest(ds.rfis); byNewest(ds.vouchers); byNewest(ds.voucherList)
  byNewest(ds.invoices); byNewest(ds.invoiceList); byNewest(ds.payments); byNewest(ds.paymentList)
  byNewest(ds.outgoing); byNewest(ds.shipments); byNewest(ds.shipmentList)

  return ds
}