// FILE: lib/quotation-templates/insurers.ts
// Which insurer templates the prototype supports. Codes are the existing
// backend club codes (GET /pni/clubs). MSIG and Eagle are implemented;
// Inigo is not (next phase).

export interface TemplateInsurer {
  code: 'MSIG' | 'EOM' | 'INIGO'
  label: string
  supported: boolean
}

export const TEMPLATE_INSURERS: TemplateInsurer[] = [
  { code: 'MSIG', label: 'MSIG Specialty Marine NV', supported: true },
  { code: 'EOM', label: 'Eagle Ocean Marine', supported: true },
  { code: 'INIGO', label: 'Inigo Syndicate 1301', supported: false },
]