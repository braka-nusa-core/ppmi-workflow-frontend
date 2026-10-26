// FILE: lib/quotation-templates/insurers.ts
// Which insurer templates the prototype supports. Codes are the existing
// PniClubFormat values (types/pni.ts). MSIG and Eagle are implemented;
// Inigo is not (next phase).

export interface TemplateInsurer {
  code: 'MSIG_SPECIALTY_MARINE_NV' | 'EAGLE_OCEAN_MARINE' | 'INIGO_SYNDICATE_1301'
  label: string
  supported: boolean
}

export const TEMPLATE_INSURERS: TemplateInsurer[] = [
  { code: 'MSIG_SPECIALTY_MARINE_NV', label: 'MSIG Specialty Marine NV', supported: true },
  { code: 'EAGLE_OCEAN_MARINE', label: 'Eagle Ocean Marine', supported: true },
  { code: 'INIGO_SYNDICATE_1301', label: 'Inigo Syndicate 1301', supported: false },
]