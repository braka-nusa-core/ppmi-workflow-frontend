// FILE: lib/quotation-templates/shared/repositoryTypes.ts
// The data-source adapter boundary shared by every insurer template.
// The workspace talks ONLY to `TemplateRepository`. Implementations:
//   • LocalMockTemplateRepository  — localStorage prototype (shared/localMockRepository.ts)
//   • PniBackendTemplateRepository — the real P&I API   (shared/pniBackendRepository.ts)
// Kept in its own module so the backend-backed flow does not import (even as
// a type) the local-storage prototype code.

export interface SavedTemplateQuotation<TData> {
  id: string
  templateId: string
  /** Pinned at creation; opening/saving never silently switches it. */
  templateVersion: string
  data: TData
  savedAt: string
  /** Backend-backed repositories only. */
  quotationNumber?: string
  status?: string
  /** Something was saved but not everything (shown to the user, never swallowed). */
  warning?: string
}

export interface TemplateSaveInput<TData> {
  id?: string
  templateId: string
  templateVersion: string
  data: TData
}

export interface TemplateRepository<TData, TTemplate> {
  /** Where saved quotations live; drives the workspace wording. Omitted = local mock. */
  readonly persistence?: 'local-mock' | 'backend'
  /** `version` omitted → latest available; given → exactly that version or null. */
  getTemplate(templateId: string, version?: string): Promise<TTemplate | null>
  listQuotations(): Promise<SavedTemplateQuotation<TData>[]>
  getQuotation(id: string): Promise<SavedTemplateQuotation<TData> | null>
  saveQuotation(input: TemplateSaveInput<TData>): Promise<SavedTemplateQuotation<TData>>
}
