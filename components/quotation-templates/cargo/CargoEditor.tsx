// FILE: components/quotation-templates/cargo/CargoEditor.tsx
// Cargo form editor — left panel in TemplateWorkspace.

'use client'

import type { UseFormReturn } from 'react-hook-form'
import type { CargoFormData, CargoTemplate } from '@/lib/quotation-templates/cargo/types'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { CurrencyInput } from '@/components/form/CurrencyInput'
import { CargoClauseSelector } from './CargoClauseSelector'

interface CargoEditorProps {
  template: CargoTemplate
  form: UseFormReturn<CargoFormData>
}

/**
 * Cargo quotation editor — 18 fields across 6 sections.
 * Section 1: Header (quotationNumber, quotationDate, recipient, attentionTo)
 * Section 2: Insurance Details (insured, insuredAddress, sumInsured, rate, deductible, brokerage)
 * Section 3: Cargo Details (interestInsured, voyage, ETD/ETA, conveyance)
 * Section 4: Main Clause (6 radio options)
 * Section 5: Additional Clauses (39 checkboxes + search)
 * Section 6: Signature (confirmedAcceptedBy)
 */
export function CargoEditor({ template, form }: CargoEditorProps) {
  const { register, formState: { errors }, watch, setValue } = form

  const sumInsuredCurrency = watch('sumInsuredCurrency') || 'USD'

  return (
    <div className="space-y-8 p-6">
      {/* Section 1: Header */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0d2847] border-b border-[#e2e8f0] pb-2">
          Informasi Umum
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="quotationNumber" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Nomor Quotation
            </label>
            <Input
              id="quotationNumber"
              {...register('quotationNumber')}
              error={!!errors.quotationNumber}
              placeholder="Auto-generated"
              disabled
              className="bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="quotationDate" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Tanggal Quotation
            </label>
            <Input
              id="quotationDate"
              type="date"
              {...register('quotationDate')}
              error={!!errors.quotationDate}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Kepada (To)
            </label>
            <Input
              id="recipient"
              {...register('recipient')}
              error={!!errors.recipient}
              placeholder="Nama perusahaan atau person"
            />
          </div>

          <div>
            <label htmlFor="attentionTo" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Attn
            </label>
            <Input
              id="attentionTo"
              {...register('attentionTo')}
              error={!!errors.attentionTo}
              placeholder="Nama contact person"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Insurance Details */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0d2847] border-b border-[#e2e8f0] pb-2">
          Detail Asuransi
        </h2>

        <div>
          <label htmlFor="insured" className="block text-sm font-medium text-[#0d2847] mb-1.5">
            The Insured
          </label>
          <Input
            id="insured"
            {...register('insured')}
            error={!!errors.insured}
            placeholder="Nama tertanggung"
          />
        </div>

        <div>
          <label htmlFor="insuredAddress" className="block text-sm font-medium text-[#0d2847] mb-1.5">
            Alamat Tertanggung
          </label>
          <Textarea
            id="insuredAddress"
            {...register('insuredAddress')}
            error={!!errors.insuredAddress}
            placeholder="Alamat lengkap"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="sumInsuredCurrency" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Mata Uang
            </label>
            <Select
              id="sumInsuredCurrency"
              {...register('sumInsuredCurrency')}
              error={!!errors.sumInsuredCurrency}
              options={[
                { value: 'USD', label: 'USD' },
                { value: 'IDR', label: 'IDR' },
              ]}
            />
          </div>

          <div>
            <label htmlFor="sumInsured" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Sum Insured
            </label>
            <CurrencyInput
              id="sumInsured"
              value={watch('sumInsured') as number || 0}
              onChange={(value) => setValue('sumInsured', value as any)}
              error={!!errors.sumInsured}
              currency={sumInsuredCurrency as 'USD' | 'IDR'}
              placeholder={sumInsuredCurrency === 'IDR' ? '0' : '0.00'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="rate" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Rate (%)
            </label>
            <Input
              id="rate"
              type="number"
              step="0.0001"
              {...register('rate', { valueAsNumber: true })}
              error={!!errors.rate}
              placeholder="0.0000"
            />
            <p className="text-xs text-[#64748b] mt-1">
              Masukkan sebagai persentase (contoh: 1.25 untuk 1.25%)
            </p>
          </div>

          <div>
            <label htmlFor="brokerage" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Brokerage (%)
            </label>
            <Input
              id="brokerage"
              type="number"
              step="0.01"
              {...register('brokerage', { valueAsNumber: true })}
              error={!!errors.brokerage}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="deductible" className="block text-sm font-medium text-[#0d2847] mb-1.5">
            Deductible
          </label>
          <Input
            id="deductible"
            type="number"
            {...register('deductible', { valueAsNumber: true })}
            error={!!errors.deductible}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="deductibleText" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Deductible Text
            </label>
            <Input
              id="deductibleText"
              {...register('deductibleText')}
              error={!!errors.deductibleText}
              placeholder="Keterangan deductible"
            />
          </div>

          <div>
            <label htmlFor="deductibleBasis" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Deductible Basis
            </label>
            <Input
              id="deductibleBasis"
              {...register('deductibleBasis')}
              error={!!errors.deductibleBasis}
              placeholder="Each and every loss"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Cargo Details */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0d2847] border-b border-[#e2e8f0] pb-2">
          Detail Kargo
        </h2>

        <div>
          <label htmlFor="interestInsured" className="block text-sm font-medium text-[#0d2847] mb-1.5">
            Interest Insured
          </label>
          <Input
            id="interestInsured"
            {...register('interestInsured')}
            error={!!errors.interestInsured}
            placeholder="Jenis barang yang diasuransikan"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="voyageFrom" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Voyage From
            </label>
            <Input
              id="voyageFrom"
              {...register('voyageFrom')}
              error={!!errors.voyageFrom}
              placeholder="Pelabuhan asal"
            />
          </div>

          <div>
            <label htmlFor="voyageTo" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              Voyage To
            </label>
            <Input
              id="voyageTo"
              {...register('voyageTo')}
              error={!!errors.voyageTo}
              placeholder="Pelabuhan tujuan"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="etd" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              ETD (Estimated Time of Departure)
            </label>
            <Input
              id="etd"
              type="date"
              {...register('etd')}
              error={!!errors.etd}
            />
          </div>

          <div>
            <label htmlFor="eta" className="block text-sm font-medium text-[#0d2847] mb-1.5">
              ETA (Estimated Time of Arrival)
            </label>
            <Input
              id="eta"
              type="date"
              {...register('eta')}
              error={!!errors.eta}
            />
          </div>
        </div>

        <div>
          <label htmlFor="conveyance" className="block text-sm font-medium text-[#0d2847] mb-1.5">
            Conveyance
          </label>
          <Input
            id="conveyance"
            {...register('conveyance')}
            error={!!errors.conveyance}
            placeholder="Nama kapal/pesawat/kendaraan"
          />
        </div>
      </section>

      {/* Section 4 & 5: Clauses */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0d2847] border-b border-[#e2e8f0] pb-2">
          Klausul Asuransi
        </h2>
        <CargoClauseSelector
          mainClauses={template.mainClauses as any}
          additionalClauses={template.additionalClauses as any}
          value={{
            mainClause: watch('instituteCargoClause'),
            additionalClauses: watch('additionalClauses')?.map((c: any) => c.code) || [],
          }}
          onChange={(value) => {
            if (value.mainClause !== undefined) {
              setValue('instituteCargoClause', value.mainClause as any)
            }
            if (value.additionalClauses !== undefined) {
              setValue('additionalClauses', value.additionalClauses.map((code) => ({ code })) as any)
            }
          }}
        />
      </section>

      {/* Section 6: Signature */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[#0d2847] border-b border-[#e2e8f0] pb-2">
          Konfirmasi
        </h2>

        <div>
          <label htmlFor="confirmedAcceptedBy" className="block text-sm font-medium text-[#0d2847] mb-1.5">
            Confirmed / Accepted By
          </label>
          <Input
            id="confirmedAcceptedBy"
            {...register('confirmedAcceptedBy')}
            error={!!errors.confirmedAcceptedBy}
            placeholder="Nama penandatangan"
          />
        </div>
      </section>
    </div>
  )
}
