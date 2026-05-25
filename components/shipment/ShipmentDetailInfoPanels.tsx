import {
  Package, Ship, FileText, CreditCard,
  Receipt, Wallet, CheckCircle, Circle,
  StickyNote, ExternalLink,
} from 'lucide-react'
import Link         from 'next/link'
import { cn }       from '@/lib/utils'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/format'
import type { ShipmentDocument } from '@/types/shipment'

// ─── Shared ──────────────────────────────────────────────────────
function FieldRow({
  label, value, mono, emphasis, colSpan,
}: {
  label:     string
  value:     React.ReactNode
  mono?:     boolean
  emphasis?: 'strong' | 'muted' | 'positive' | 'danger'
  colSpan?:  boolean
}) {
  const cls = {
    strong:  'text-[#18273a] font-semibold',
    muted:   'text-[#7a8fa3]',
    positive:'text-[#1a5c38] font-semibold',
    danger:  'text-[#8c1f1f] font-semibold',
    default: 'text-[#18273a]',
  }[emphasis ?? 'default']
  return (
    <div className={cn('flex flex-col gap-0.5', colSpan && 'col-span-2')}>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">{label}</dt>
      <dd className={cn('text-[13px] leading-snug', cls, mono && 'font-mono tracking-tight')}>
        {value ?? <span className="text-[#b5cede]">—</span>}
      </dd>
    </div>
  )
}

function DetailSection({
  icon: Icon, title, children, id,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; id?: string
}) {
  return (
    <section id={id} className="card">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[#e8f3fb]">
            <Icon size={12} className="text-[#123d6b]" strokeWidth={1.8} />
          </div>
          <h3 className="text-[13px] font-semibold text-[#18273a]">{title}</h3>
        </div>
      </div>
      <div className="card-body">{children}</div>
    </section>
  )
}

// ─── Shipment Information ────────────────────────────────────────
export function ShipmentInfoPanel({ shp }: { shp: ShipmentDocument }) {
  return (
    <DetailSection icon={Package} title="Shipment Information" id="shipment-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Shipment Number" value={shp.docNumber} mono emphasis="strong" />
        <FieldRow label="Division"        value={shp.division === 'PI' ? 'P&I (Protection & Indemnity)' : 'H&M (Hull & Machinery)'} />
        <FieldRow label="Insured"         value={shp.insuredName}  emphasis="strong" colSpan />
        {shp.vesselName  && <FieldRow label="Vessel Name"  value={shp.vesselName}  />}
        {shp.vesselFlag  && <FieldRow label="Vessel Flag"  value={shp.vesselFlag}  />}
        {shp.shipmentDate && <FieldRow label="Shipment Date" value={formatDate(shp.shipmentDate)} />}
        {shp.insuranceType && (
          <FieldRow label="Insurance Type" value={shp.insuranceType} />
        )}
        {shp.premiumAmount != null && shp.currency && (
          <FieldRow
            label="Premium Amount"
            value={formatCurrency(shp.premiumAmount, shp.currency)}
            mono
          />
        )}
      </dl>
    </DetailSection>
  )
}

// ─── Shipping Details ────────────────────────────────────────────
export function ShippingDetailsPanel({ shp }: { shp: ShipmentDocument }) {
  const hasAny = shp.portOfLoading || shp.portOfDischarge || shp.blNumber ||
                 shp.containerNumber || shp.voyageNumber

  if (!hasAny) return null

  return (
    <DetailSection icon={Ship} title="Shipping Details" id="shipping-details">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        {shp.blNumber       && <FieldRow label="B/L Number"          value={shp.blNumber}       mono emphasis="strong" />}
        {shp.voyageNumber   && <FieldRow label="Voyage Number"        value={shp.voyageNumber}   mono />}
        {shp.portOfLoading  && <FieldRow label="Port of Loading"      value={shp.portOfLoading}  />}
        {shp.portOfDischarge&& <FieldRow label="Port of Discharge"    value={shp.portOfDischarge}/>}
        {shp.containerNumber&& <FieldRow label="Container Number"     value={shp.containerNumber}mono />}
      </dl>
    </DetailSection>
  )
}

// ─── Document Tracking Panel ─────────────────────────────────────
function DocStep({
  label, done, actor, date, note,
}: {
  label: string; done: boolean; actor?: string; date?: string; note?: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={cn(
        'flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0 mt-0.5',
        done ? 'bg-[#eaf6f0]' : 'bg-[#f0f4f7]'
      )}>
        {done
          ? <CheckCircle size={14} className="text-[#1a5c38]" strokeWidth={2} />
          : <Circle      size={14} className="text-[#b5cede]" strokeWidth={2} />
        }
      </div>
      <div className="flex-1">
        <p className={cn(
          'text-[13px] font-semibold leading-tight',
          done ? 'text-[#18273a]' : 'text-[#7a8fa3]'
        )}>
          {label}
        </p>
        {done && actor && (
          <p className="text-[11px] text-[#3a5068] mt-0.5">{actor}</p>
        )}
        {done && date && (
          <p className="text-[10px] text-[#7a8fa3] mt-0.5">{formatDateTime(date)}</p>
        )}
        {!done && (
          <p className="text-[10px] text-[#b5cede] mt-0.5 italic">Pending</p>
        )}
        {note && (
          <p className="text-[11px] text-[#3a5068] mt-1 bg-[#f7f9fb] border border-[#edf1f5] rounded px-2 py-1">
            {note}
          </p>
        )}
      </div>
    </div>
  )
}

export function DocumentTrackingPanel({ shp }: { shp: ShipmentDocument }) {
  return (
    <DetailSection icon={FileText} title="Document Tracking" id="document-tracking">
      <div className="flex flex-col gap-5">
        <DocStep
          label="Documents Received from Broker"
          done={shp.documentsReceived}
          actor={shp.documentsReceivedBy}
          date={shp.documentsReceivedDate}
        />
        <DocStep
          label="Documents Forwarded to Insured"
          done={shp.documentsForwarded}
          actor={shp.documentsForwardedBy
            ? `${shp.documentsForwardedBy} → ${shp.documentsForwardedTo ?? ''}`
            : undefined
          }
          date={shp.documentsForwardedDate}
        />
      </div>
    </DetailSection>
  )
}

// ─── Linked Documents ────────────────────────────────────────────
export function ShipmentLinkedDocsPanel({ shp }: { shp: ShipmentDocument }) {
  const links = [
    { label: 'Payment', number: shp.paymentNumber, href: `/dashboard/payment/${shp.paymentId}`,   icon: CreditCard, bg: 'bg-[#e8f3fb]', color: 'text-[#123d6b]' },
    { label: 'Voucher', number: shp.voucherNumber, href: `/dashboard/voucher/${shp.voucherId}`,   icon: Wallet,     bg: 'bg-[#edf5fb]', color: 'text-[#2d6495]' },
    { label: 'Invoice', number: shp.invoiceNumber, href: `/dashboard/invoice/${shp.invoiceId}`,   icon: Receipt,    bg: 'bg-[#e8f3fb]', color: 'text-[#174e87]' },
    { label: 'QS',      number: shp.qsNumber,      href: `/dashboard/qs/${shp.qsId}`,             icon: FileText,   bg: 'bg-[#f0f4f7]', color: 'text-[#3a5068]' },
  ]

  return (
    <DetailSection icon={Receipt} title="Linked Documents" id="linked-docs">
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#d5e3ef] hover:border-[#93c4e5] hover:bg-[#f7f9fb] transition-colors duration-100 group"
          >
            <div className={cn('flex items-center justify-center w-6 h-6 rounded-md flex-shrink-0', link.bg)}>
              <link.icon size={12} className={link.color} strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-[#7a8fa3] font-medium uppercase tracking-wide">{link.label}</p>
              <p className="text-[11px] font-semibold text-[#18273a] font-mono truncate">{link.number}</p>
            </div>
            <ExternalLink size={11} className="text-[#b5cede] group-hover:text-[#123d6b] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </DetailSection>
  )
}

// ─── Notes ───────────────────────────────────────────────────────
export function ShipmentNotesPanel({ shp }: { shp: ShipmentDocument }) {
  return (
    <DetailSection icon={StickyNote} title="Internal Notes" id="notes">
      {shp.internalNotes ? (
        <p className="text-[13px] text-[#18273a] leading-relaxed whitespace-pre-wrap bg-[#f7f9fb] border border-[#edf1f5] rounded-md px-3 py-3">
          {shp.internalNotes}
        </p>
      ) : (
        <p className="text-[12px] text-[#7a8fa3]">No internal notes</p>
      )}
    </DetailSection>
  )
}
