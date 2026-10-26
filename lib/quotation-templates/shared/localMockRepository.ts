// FILE: lib/quotation-templates/shared/localMockRepository.ts
// ═══════════════════════════════════════════════════════════════
// DATA-SOURCE ADAPTER BOUNDARY (MOCK) — shared by every insurer template.
//
// The UI talks only to `TemplateRepository`. This implementation is a LOCAL
// MOCK: the template is the bundled module, saved quotations live in this
// browser's localStorage. No HTTP call is made and no endpoint is assumed.
// A future API-backed repository implements the same interface; nothing in
// components/ or the renderers should need to change.
// ═══════════════════════════════════════════════════════════════

export interface SavedTemplateQuotation<TData> {
  id: string
  templateId: string
  /** Pinned at creation; opening/saving never silently switches it. */
  templateVersion: string
  data: TData
  savedAt: string
}

export interface TemplateSaveInput<TData> {
  id?: string
  templateId: string
  templateVersion: string
  data: TData
}

export interface TemplateRepository<TData, TTemplate> {
  /** `version` omitted → latest available; given → exactly that version or null. */
  getTemplate(templateId: string, version?: string): Promise<TTemplate | null>
  listQuotations(): Promise<SavedTemplateQuotation<TData>[]>
  getQuotation(id: string): Promise<SavedTemplateQuotation<TData> | null>
  saveQuotation(input: TemplateSaveInput<TData>): Promise<SavedTemplateQuotation<TData>>
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

let idSeq = 0
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++idSeq}`

export class LocalMockTemplateRepository<TData, TTemplate extends { templateId: string; templateVersion: string }>
  implements TemplateRepository<TData, TTemplate> {
  private mem: SavedTemplateQuotation<TData>[] | null = null

  constructor(
    private readonly opts: {
      storeKey: string
      idPrefix: string
      template: TTemplate
      seed: () => SavedTemplateQuotation<TData>[]
    },
  ) {}

  private read(): SavedTemplateQuotation<TData>[] {
    if (this.mem) return this.mem
    let list: SavedTemplateQuotation<TData>[] | null = null
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(this.opts.storeKey) : null
      if (raw) list = JSON.parse(raw) as SavedTemplateQuotation<TData>[]
    } catch { /* storage unavailable or corrupt → fall back to seed */ }
    this.mem = list ?? this.opts.seed()
    return this.mem
  }

  private write(): void {
    try { if (typeof window !== 'undefined') window.localStorage.setItem(this.opts.storeKey, JSON.stringify(this.mem)) } catch { /* best effort */ }
  }

  async getTemplate(templateId: string, version?: string) {
    const t = this.opts.template
    if (templateId !== t.templateId) return null
    if (version && version !== t.templateVersion) return null
    return clone(t)
  }

  async listQuotations() { return clone(this.read()) }

  async getQuotation(id: string) {
    const found = this.read().find((q) => q.id === id)
    return found ? clone(found) : null
  }

  async saveQuotation(input: TemplateSaveInput<TData>) {
    const list = this.read()
    const record: SavedTemplateQuotation<TData> = {
      id: input.id ?? newId(this.opts.idPrefix),
      templateId: input.templateId,
      templateVersion: input.templateVersion,
      data: clone(input.data),
      savedAt: new Date().toISOString(),
    }
    const i = list.findIndex((q) => q.id === record.id)
    if (i >= 0) list[i] = record
    else list.push(record)
    this.write()
    return clone(record)
  }
}