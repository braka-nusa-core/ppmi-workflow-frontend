// FILE: lib/quotation-templates/shared/pniBackendRepository.ts
// ═══════════════════════════════════════════════════════════════
// DATA-SOURCE ADAPTER: THE REAL P&I API
//
// Implements the same `TemplateRepository` the editors already talk to, but
// every call goes to the backend through the existing API client:
//   list   → GET   /pni/quotations                  (filtered to this insurer's club)
//   open   → GET   /pni/quotations/:quotationId
//   create → POST  /pni/quotations
//   update → PATCH /pni/quotations/:quotationId
//   + the free-text Period → PATCH /quotations/:id  (`periodText`, not accepted by the P&I endpoints)
// Nothing is stored in the browser. The pinned template version is kept in
// `quotation.templateVersion`; the template itself is the bundled module
// (the backend defines no template content schema yet).
// ═══════════════════════════════════════════════════════════════

import { createPniQuotation, fetchPniQuotation, fetchPniQuotations, updatePniQuotation } from '@/lib/api/pni'
import { updateQuotation } from '@/lib/api/quotations'
import type { CreatePniQuotationPayload, PniQuotationDetail, UpdatePniQuotationPayload } from '@/types/pni'
import { clean, quotationText } from './fromPni'
import type { SavedTemplateQuotation, TemplateRepository, TemplateSaveInput } from './repositoryTypes'
import type { PniClientContext } from './toPni'

export interface PniWriteResult { payload: Record<string, unknown>; periodText: string | undefined }

/** Everything insurer-specific the generic repository needs. */
export interface PniTemplateCodec<TData> {
  /** Backend club code (`pni.club.code`) this insurer's paper belongs to. */
  clubCode: string
  toData(d: PniQuotationDetail): TData
  /** Placeholder data for the “open saved” list: only what savedLabel() prints. */
  labelData(item: { reference: string; insured: string }): TData
  buildCreate(data: TData, ctx: PniClientContext, templateVersion: string): PniWriteResult
  buildUpdate(data: TData, ctx: PniClientContext, templateVersion: string, original: PniQuotationDetail): PniWriteResult
}

/** The UI owns the client / insurance-type choice; the repository reads it at save time and reports what it loaded. */
export interface PniContextBridge {
  get(): PniClientContext
  loaded(detail: PniQuotationDetail): void
}

const message = (e: unknown) => (e instanceof Error ? e.message : String(e))

export class PniBackendTemplateRepository<TData, TTemplate extends { templateId: string; templateVersion: string }>
  implements TemplateRepository<TData, TTemplate> {
  readonly persistence = 'backend' as const
  /** Last server state of each opened/saved quotation — update payloads are diffed against it. */
  private readonly saved = new Map<string, PniQuotationDetail>()

  constructor(private readonly o: { template: TTemplate; codec: PniTemplateCodec<TData>; context: PniContextBridge }) {}

  async getTemplate(templateId: string, version?: string): Promise<TTemplate | null> {
    const t = this.o.template
    if (templateId !== t.templateId) return null
    return version && version !== t.templateVersion ? null : t
  }

  async listQuotations(): Promise<SavedTemplateQuotation<TData>[]> {
    const items = await fetchPniQuotations()
    return items
      .filter((i) => i.pniQuotation.club.code === this.o.codec.clubCode)
      .map((i) => ({
        id: i.id,
        templateId: this.o.template.templateId,
        templateVersion: typeof i.templateVersion === 'string' && i.templateVersion ? i.templateVersion : this.o.template.templateVersion,
        data: this.o.codec.labelData({ reference: i.pniQuotation.referenceNumber ?? '', insured: typeof i.insured === 'string' ? i.insured : '' }),
        savedAt: typeof i.updatedAt === 'string' ? i.updatedAt : i.createdAt,
        quotationNumber: i.quotationNumber,
        status: i.status,
      }))
  }

  async getQuotation(id: string): Promise<SavedTemplateQuotation<TData> | null> {
    let detail: PniQuotationDetail
    try { detail = await fetchPniQuotation(id) } catch (e) {
      if ((e as { status?: number })?.status === 404) return null
      throw e
    }
    if (detail.club.code !== this.o.codec.clubCode) return null
    return this.remember(detail)
  }

  async saveQuotation(input: TemplateSaveInput<TData>): Promise<SavedTemplateQuotation<TData>> {
    const { codec, context } = this.o
    const ctx = context.get()
    let id: string
    let periodText: string | undefined
    if (!input.id) {
      const w = codec.buildCreate(input.data, ctx, input.templateVersion)
      id = (await createPniQuotation(w.payload as unknown as CreatePniQuotationPayload)).quotationId
      periodText = w.periodText
    } else {
      id = input.id
      const original = this.saved.get(id) ?? (await fetchPniQuotation(id))
      const w = codec.buildUpdate(input.data, ctx, input.templateVersion, original)
      await updatePniQuotation(id, w.payload as unknown as UpdatePniQuotationPayload)
      periodText = w.periodText
    }

    let warning: string | undefined
    if (periodText !== undefined) {
      try { await updateQuotation(id, { periodText }) } catch (e) {
        warning = `The quotation was saved, but its Period text could not be: ${message(e)}`
      }
    }
    const fresh = await fetchPniQuotation(id)
    return { ...this.remember(fresh), warning }
  }

  private remember(detail: PniQuotationDetail): SavedTemplateQuotation<TData> {
    this.saved.set(detail.quotationId, detail)
    this.o.context.loaded(detail)
    return {
      id: detail.quotationId,
      templateId: this.o.template.templateId,
      templateVersion: clean(quotationText(detail, 'templateVersion')) || this.o.template.templateVersion,
      data: this.o.codec.toData(detail),
      savedAt: quotationText(detail, 'updatedAt') ?? '',
      quotationNumber: detail.quotation.quotationNumber,
      status: detail.quotation.status,
    }
  }
}
