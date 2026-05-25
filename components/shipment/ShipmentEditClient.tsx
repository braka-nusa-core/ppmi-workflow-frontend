'use client'

import { useState }     from 'react'
import { useRouter }    from 'next/navigation'
import { Save, X }      from 'lucide-react'
import { Button }       from '@/components/ui/Button'
import { PageHeader }   from '@/components/layout/PageHeader'
import { FormField, FormSection } from '@/components/form/FormField'
import { Input, Textarea } from '@/components/ui/Input'
import type { ShipmentDocument } from '@/types/shipment'

export function ShipmentEditClient({ shp }: { shp: ShipmentDocument }) {
  const router  = useRouter()
  const [isSaving, setSaving] = useState(false)

  // Controlled fields
  const [fields, setFields] = useState({
    shipmentDate:    shp.shipmentDate?.slice(0, 10)    ?? '',
    portOfLoading:   shp.portOfLoading                 ?? '',
    portOfDischarge: shp.portOfDischarge               ?? '',
    blNumber:        shp.blNumber                      ?? '',
    containerNumber: shp.containerNumber               ?? '',
    voyageNumber:    shp.voyageNumber                  ?? '',
    internalNotes:   shp.internalNotes                 ?? '',
  })

  const set = (key: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      router.push(`/dashboard/shipment/${shp.id}`)
    } finally { setSaving(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="page-container pb-0">
        <PageHeader
          title={`Edit ${shp.docNumber}`}
          description="Update shipment and document tracking information"
          breadcrumbs={[
            { label: 'Shipment', href: '/dashboard/shipment' },
            { label: shp.docNumber, href: `/dashboard/shipment/${shp.id}` },
            { label: 'Edit' },
          ]}
        />
      </div>

      <div className="flex-1 overflow-y-auto page-container pt-6">
        <div className="max-w-[720px] flex flex-col gap-0 divide-y divide-[#f0f4f7]">

          {/* Shipping Details */}
          <div className="pb-8">
            <FormSection title="Shipping Details" description="Vessel route and document reference numbers" columns={2}>
              <FormField label="Shipment Date">
                <Input type="date" value={fields.shipmentDate} onChange={set('shipmentDate')} />
              </FormField>
              <FormField label="B/L Number" hint="Bill of Lading reference">
                <Input placeholder="e.g. BL-2025-040-SMD" value={fields.blNumber} onChange={set('blNumber')} />
              </FormField>
              <FormField label="Port of Loading">
                <Input placeholder="e.g. Tanjung Priok, Jakarta" value={fields.portOfLoading} onChange={set('portOfLoading')} />
              </FormField>
              <FormField label="Port of Discharge">
                <Input placeholder="e.g. Port Klang, Malaysia" value={fields.portOfDischarge} onChange={set('portOfDischarge')} />
              </FormField>
              <FormField label="Container Number">
                <Input placeholder="e.g. MSCU1234567" value={fields.containerNumber} onChange={set('containerNumber')} />
              </FormField>
              <FormField label="Voyage Number">
                <Input placeholder="e.g. SMD-V025-2025" value={fields.voyageNumber} onChange={set('voyageNumber')} />
              </FormField>
            </FormSection>
          </div>

          {/* Notes */}
          <div className="py-8">
            <FormSection title="Internal Notes" description="For internal operations team use only">
              <FormField label="Notes">
                <Textarea
                  rows={4}
                  placeholder="Document receipt notes, forwarding instructions, client communications..."
                  value={fields.internalNotes}
                  onChange={set('internalNotes')}
                />
              </FormField>
            </FormSection>
          </div>
        </div>
        <div className="h-20" />
      </div>

      {/* Sticky footer */}
      <div
        className="sticky bottom-0 z-30 flex items-center justify-between px-6 py-3"
        style={{
          background:     'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(8px)',
          borderTop:      '1px solid #d5e3ef',
          boxShadow:      '0 -4px 16px rgba(7,25,52,0.06)',
        }}
      >
        <Button
          variant="ghost" size="sm" icon={<X size={13} />}
          onClick={() => router.push(`/dashboard/shipment/${shp.id}`)}
        >
          Cancel
        </Button>
        <Button
          variant="primary" size="sm" icon={<Save size={13} />}
          loading={isSaving} onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}
