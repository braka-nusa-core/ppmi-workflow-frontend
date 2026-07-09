import {
  Package, Truck, FileText, ExternalLink,
} from 'lucide-react'
import Link         from 'next/link'
import { cn }       from '@/lib/utils'
import { formatDate } from '@/lib/format'
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
// Only the fields that actually exist on the backend DocumentShipment
// model (courier, tracking_number, shipping_date). Port of loading/
// discharge, BL number, container/voyage number, insured/vessel info,
// insurance type, and premium amount were previously shown here but
// have no backing column anywhere in the backend — removed.
export function ShipmentInfoPanel({ shp }: { shp: ShipmentDocument }) {
  return (
    <DetailSection icon={Package} title="Shipment Information" id="shipment-info">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <FieldRow label="Shipment Number" value={shp.docNumber} mono emphasis="strong" />
        <FieldRow label="Shipping Date"   value={formatDate(shp.shippingDate)} />
        <FieldRow label="Courier"         value={shp.courier} emphasis="strong" />
        <FieldRow label="Tracking Number" value={shp.trackingNumber} mono />
      </dl>
    </DetailSection>
  )
}

// ─── Linked Documents ────────────────────────────────────────────
export function ShipmentLinkedDocsPanel({ shp }: { shp: ShipmentDocument }) {
  return (
    <DetailSection icon={FileText} title="Linked Documents" id="linked-docs">
      <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
        <div className="flex flex-col gap-0.5">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Invoice</dt>
          <dd>
            <Link
              href={`/dashboard/invoice/${shp.invoiceId}`}
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#123d6b] font-mono hover:underline"
            >
              {shp.invoiceNumber || shp.invoiceId}
              <ExternalLink size={11} />
            </Link>
          </dd>
        </div>
        {shp.paymentId && (
          <div className="flex flex-col gap-0.5">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-[#7a8fa3]">Payment</dt>
            <dd>
              <Link
                href={`/dashboard/payment/${shp.paymentId}`}
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#123d6b] font-mono hover:underline"
              >
                {shp.paymentId}
                <ExternalLink size={11} />
              </Link>
            </dd>
          </div>
        )}
        {shp.shippingProofFileName && (
          <FieldRow
            label="Shipping Proof"
            value={
              shp.shippingProofFileUrl ? (
                <a href={shp.shippingProofFileUrl} target="_blank" rel="noreferrer" className="text-[#123d6b] hover:underline">
                  {shp.shippingProofFileName}
                </a>
              ) : shp.shippingProofFileName
            }
            colSpan
          />
        )}
      </dl>
    </DetailSection>
  )
}