// FILE: lib/quotation-templates/cargo/repository.ts
// Cargo backend repository — talks to CargoQuotation API.

import type { TemplateRepository, SavedTemplateQuotation } from '@/lib/quotation-templates/shared/repositoryTypes'
import type { CargoFormData, CargoTemplate } from './types'
import { createQuotation, updateQuotation, fetchQuotation, fetchQuotations } from '@/lib/api/quotations'
import { createCargoQuotation, updateCargoQuotation, fetchCargoQuotation } from '@/lib/api/cargo'
import { quotationTermsApi } from '@/lib/api/quotations'
import { percentageToDecimal, decimalToPercentage } from './format'

export interface CargoRepositoryConfig<TData, TTemplate> {
  template: TTemplate
  context: CargoContextBridge
  codec: {
    toData: (saved: any) => TData
    labelData: (data: any) => Partial<TData>
    buildCreate: (data: TData, context: CargoContextBridge) => any
    buildUpdate: (data: TData, context: CargoContextBridge) => any
  }
}

export interface CargoContextBridge {
  actorId: string
  tenantId: string
  clientId: string
  insuranceTypeId: string
}

/**
 * Cargo template repository — backend API integration.
 * Implements two-step create/update flow:
 * 1. POST/PATCH /quotations (base fields)
 * 2. POST/PATCH /cargo/quotations/:id (Cargo-specific fields)
 * 3. Sync QuotationTerms (additional clauses)
 */
export class CargoTemplateRepository<TData extends CargoFormData, TTemplate extends CargoTemplate>
  implements TemplateRepository<TData, TTemplate>
{
  constructor(private config: CargoRepositoryConfig<TData, TTemplate>) {}

  async getTemplate(): Promise<TTemplate> {
    // ponytail: fetch backend template with real clause wording when available
    return this.config.template
  }

  async listQuotations(): Promise<Array<SavedTemplateQuotation<TData>>> {
    const quotations = await fetchQuotations()
    // Filter Cargo quotations only
    return quotations
      .filter((q) => q.cargoQuotation !== null)
      .map((q) => ({
        id: q.id,
        templateId: 'cargo',
        templateVersion: '1.0.0',
        quotationNumber: q.quotationNumber,
        status: q.status,
        savedAt: q.createdAt,
        data: this.config.codec.toData(q) as TData,
      }))
  }

  async getQuotation(id: string): Promise<SavedTemplateQuotation<TData> | null> {
    try {
      const quotation = await fetchQuotation(id)
      const cargoDetail = await fetchCargoQuotation(id)
      
      // Convert rate from decimal to percentage for display
      const formData = this.config.codec.toData({ ...quotation, cargoQuotation: cargoDetail })
      if (quotation.rate) {
        ;(formData as any).rate = decimalToPercentage(quotation.rate)
      }

      return {
        id: quotation.id,
        templateId: 'cargo',
        templateVersion: '1.0.0',
        quotationNumber: quotation.quotationNumber,
        status: quotation.status,
        savedAt: quotation.createdAt,
        data: formData as TData,
      }
    } catch (error) {
      console.error('Failed to fetch Cargo quotation:', error)
      return null
    }
  }

  async saveQuotation(input: {
    id?: string
    data: TData
  }): Promise<SavedTemplateQuotation<TData>> {
    const { id, data } = input
    const isUpdate = !!id

    // Convert rate from percentage to decimal before save
    const rateDecimal = data.rate != null ? percentageToDecimal(data.rate as number) : null

    // Step 1: Create/Update base Quotation
    const basePayload: any = {
      clientId: this.config.context.clientId,
      insuranceTypeId: this.config.context.insuranceTypeId,
      quotationDate: data.quotationDate || new Date().toISOString(),
      recipient: data.recipient,
      attentionTo: data.attentionTo,
      insured: data.insured,
      address: data.insuredAddress,
      sumInsured: data.sumInsured,
      sumInsuredCurrency: data.sumInsuredCurrency || 'USD',
      rate: rateDecimal,
      deductible: data.deductible,
      deductibleText: data.deductibleText,
      deductibleBasis: data.deductibleBasis,
      brokerage: data.brokerage,
      confirmedAcceptedBy: data.confirmedAcceptedBy,
    }

    let quotation
    if (isUpdate) {
      quotation = await updateQuotation(id, basePayload)
    } else {
      quotation = await createQuotation(basePayload)
    }

    // Step 2: Create/Update CargoQuotation detail
    const cargoPayload: any = {
      interestInsured: data.interestInsured,
      voyageFrom: data.voyageFrom,
      voyageTo: data.voyageTo,
      etd: data.etd,
      eta: data.eta,
      conveyance: data.conveyance,
      instituteCargoClause: data.instituteCargoClause,
    }

    if (isUpdate) {
      await updateCargoQuotation(quotation.id, cargoPayload)
    } else {
      await createCargoQuotation(quotation.id, cargoPayload)
    }

    // Step 3: Sync additional clauses (QuotationTerms)
    // ponytail: implement full sync when additional clauses backend support confirmed
    // For now, create new terms only (no delete/update logic)
    if (data.additionalClauses && (data.additionalClauses as any[]).length > 0) {
      const existingTerms = isUpdate ? await quotationTermsApi.list(quotation.id) : []
      const existingCodes = new Set(existingTerms.map((t) => t.description))

      for (const clause of data.additionalClauses as any[]) {
        if (!existingCodes.has(clause.code)) {
          await quotationTermsApi.create(quotation.id, {
            description: clause.code,
            section: 'TERMS_CONDITIONS',
            isSelected: true,
            isEditable: false,
            isRemovable: true,
          })
        }
      }
    }

    return {
      id: quotation.id,
      templateId: 'cargo',
      templateVersion: '1.0.0',
      quotationNumber: quotation.quotationNumber,
      status: quotation.status,
      savedAt: quotation.createdAt,
      data,
    }
  }
}
