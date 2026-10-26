// FILE: components/quotation-templates/templateModule.ts
// What the generic workspace needs from an insurer template. Each insurer
// supplies its own wording, data shape, editor, preview and PDF renderer;
// the workspace (save/open, pinned version, validation, preview/export,
// responsive layout) is shared.

import type { ComponentType } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'
import type { TemplateRepository } from '@/lib/quotation-templates/shared/localMockRepository'

export interface TemplateModule<TData extends FieldValues, TTemplate extends { templateId: string; templateVersion: string }, TDoc> {
  code: string
  label: string
  templateId: string
  repo: () => TemplateRepository<TData, TTemplate>
  createBlank: () => TData
  buildDocument: (template: TTemplate, data: TData) => TDoc
  validate: (data: TData) => string[]
  Editor: ComponentType<{ template: TTemplate; form: UseFormReturn<TData> }>
  Preview: ComponentType<{ document: TDoc }>
  renderPdf: (document: TDoc) => Promise<Blob>
  fileName: (data: TData) => string
  insurerName: (template: TTemplate) => string
  /** One-line label for the "Open saved" list. */
  savedLabel: (data: TData) => string
}