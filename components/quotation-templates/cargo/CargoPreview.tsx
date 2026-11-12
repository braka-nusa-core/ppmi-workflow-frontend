// FILE: components/quotation-templates/cargo/CargoPreview.tsx
// Cargo document preview — right panel in TemplateWorkspace.

'use client'

import type { CargoDocument } from '@/lib/quotation-templates/cargo/types'

interface CargoPreviewProps {
  document: CargoDocument
}

/**
 * Cargo document preview — 3-page HTML preview matching official paper.
 * Page 1: Header + Insurance Details (11 fields)
 * Page 2: Terms & Conditions (main clause + additional clauses)
 * Page 3: Signature areas (static placeholders)
 */
export function CargoPreview({ document }: CargoPreviewProps) {
  const { pages, template, formData } = document
  const ratePercent = formData.rate != null ? (parseFloat(formData.rate as any) * 100).toFixed(4) : ''

  return (
    <div className="h-full overflow-y-auto bg-gray-200 p-8">
      {/* Page 1 */}
      <div className="a4-page mx-auto mb-8 bg-white shadow-lg text-sm">
        {/* Page Header */}
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h1 className="text-lg font-bold text-[#0d2847]">QUOTATION</h1>
          <p className="text-xs text-gray-600">Marine Cargo Insurance</p>
        </div>

        {/* Header Info */}
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Quotation Number</p>
              <p className="font-medium text-[#0d2847]">
                {formData.quotationNumber || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quotation Date</p>
              <p className="font-medium text-[#0d2847]">
                {formData.quotationDate ? new Date(formData.quotationDate as any).toLocaleDateString('en-GB') : '-'}
              </p>
            </div>
          </div>

          <div className="mt-2">
            <p className="text-xs text-gray-500">To</p>
            <p className="font-medium text-[#0d2847]">{formData.recipient || '-'}</p>
          </div>

          <div className="mt-1">
            <p className="text-xs text-gray-500">Attn</p>
            <p className="font-medium text-[#0d2847]">{formData.attentionTo || '-'}</p>
          </div>
        </div>

        {/* Insurance Details */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-[#0d2847] border-b border-gray-300 pb-1">
            Insurance Details
          </h3>

          <div>
            <p className="text-xs text-gray-500">The Insured</p>
            <p className="font-medium text-[#0d2847]">{formData.insured || '-'}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p className="text-[#0d2847]">{formData.insuredAddress || '-'}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-gray-500">Interest Insured</p>
              <p className="font-medium text-[#0d2847]">{formData.interestInsured || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sum Insured</p>
              <p className="font-medium text-[#0d2847]">
                {formData.sumInsuredCurrency} {formData.sumInsured?.toLocaleString() || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Rate</p>
              <p className="font-medium text-[#0d2847]">{ratePercent || '-'}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Brokerage</p>
              <p className="font-medium text-[#0d2847]">{formData.brokerage || '-'}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Deductible</p>
              <p className="font-medium text-[#0d2847]">
                {formData.deductibleText || '-'} {formData.deductible ? `(${formData.deductible.toLocaleString()})` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Voyage Info */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Voyage From</p>
            <p className="font-medium text-[#0d2847]">{formData.voyageFrom || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Voyage To</p>
            <p className="font-medium text-[#0d2847]">{formData.voyageTo || '-'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">ETD</p>
            <p className="font-medium text-[#0d2847]">
              {formData.etd ? new Date(formData.etd as any).toLocaleDateString('en-GB') : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ETA</p>
            <p className="font-medium text-[#0d2847]">
              {formData.eta ? new Date(formData.eta as any).toLocaleDateString('en-GB') : '-'}
            </p>
          </div>
        </div>

        <div className="mt-1">
          <p className="text-xs text-gray-500">Conveyance</p>
          <p className="font-medium text-[#0d2847]">{formData.conveyance || '-'}</p>
        </div>

        {/* Premium Calculation */}
        <div className="mt-4 border-t border-gray-800 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-gray-500">Premium</p>
              <p className="font-medium text-[#0d2847]">
                {formData.sumInsuredCurrency}{' '}
                {formData.sumInsured && formData.rate
                  ? (parseFloat(formData.sumInsured as any) * (parseFloat(formData.rate as any) / 100)).toLocaleString()
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Brokerage</p>
              <p className="font-medium text-[#0d2847]">
                {formData.sumInsuredCurrency}{' '}
                {formData.sumInsured && formData.rate && formData.brokerage
                  ? (parseFloat(formData.sumInsured as any) * (parseFloat(formData.rate as any) / 100) * (parseFloat(formData.brokerage as any) / 100)).toLocaleString()
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-8 border-t border-gray-800 pt-2 text-center text-xs text-gray-500">
          Page 1 of 3
        </div>
      </div>

      {/* Page 2 */}
      <div className="a4-page mx-auto mb-8 bg-white shadow-lg text-sm">
        {/* Page Header */}
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h1 className="text-lg font-bold text-[#0d2847]">QUOTATION</h1>
          <p className="text-xs text-gray-600">Marine Cargo Insurance</p>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-[#0d2847] border-b border-gray-300 pb-1">
            Terms & Conditions
          </h3>

          {/* Main Clause */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#0d2847]">Institute Cargo Clause</p>
            <div className="ml-4">
              {template.mainClauses.find((c: any) => c.code === formData.instituteCargoClause) ? (
                <p className="font-medium text-[#0d2847]">
                  {template.mainClauses.find((c: any) => c.code === formData.instituteCargoClause)?.label}
                </p>
              ) : (
                <p className="text-[#0d2847]">-</p>
              )}
            </div>
          </div>

          {/* Additional Clauses */}
          {formData.additionalClauses && (formData.additionalClauses as any[]).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[#0d2847]">Additional Clauses</p>
              <div className="ml-4 space-y-1">
                {(formData.additionalClauses as any[]).map((clause: any) => {
                  const clauseDef = template.additionalClauses.find((c: any) => c.code === clause.code)
                  return (
                    <p key={clause.code} className="text-[#0d2847]">
                      • {clauseDef?.label || clause.code}
                    </p>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-gray-300 pt-4">
            <p className="text-xs text-gray-500 italic">
              Please refer to the full policy wording for complete terms and conditions.
            </p>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-8 border-t border-gray-800 pt-2 text-center text-xs text-gray-500">
          Page 2 of 3
        </div>
      </div>

      {/* Page 3 */}
      <div className="a4-page mx-auto bg-white shadow-lg text-sm">
        {/* Page Header */}
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h1 className="text-lg font-bold text-[#0d2847]">QUOTATION</h1>
          <p className="text-xs text-gray-600">Marine Cargo Insurance</p>
        </div>

        {/* Signature Area */}
        <div className="space-y-8">
          <h3 className="text-base font-semibold text-[#0d2847] border-b border-gray-300 pb-1">
            Confirmation
          </h3>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Confirmed / Accepted By</p>
              <p className="font-medium text-[#0d2847] h-8">
                {formData.confirmedAcceptedBy || '___________________________'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs text-gray-500">For and on behalf of</p>
                <p className="font-medium text-[#0d2847] mt-4 h-8">
                  PT Pandi Proteksi Marine Indonesia
                </p>
                <p className="text-xs text-gray-500 mt-2">Authorized Signatory</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-[#0d2847] mt-4 h-8">
                  {new Date().toLocaleDateString('en-GB')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-4">
            <p className="text-xs text-gray-500 italic">
              This quotation is issued subject to the terms and conditions of the
              policy. Premium is due upon acceptance.
            </p>
          </div>
        </div>

        {/* Page Footer */}
        <div className="mt-8 border-t border-gray-800 pt-2 text-center text-xs text-gray-500">
          Page 3 of 3
        </div>
      </div>
    </div>
  )
}
