// FILE: lib/quotation-templates/shared/types.ts
// Types genuinely shared by every insurer template: the PPMI page footer is
// the same artwork + three text columns on every paper (its wording differs
// per insurer and lives in each template).

export interface PdfFooterSegment { text: string; sup?: boolean }
export interface PdfFooterColumn { heading: string; lines: PdfFooterSegment[][] }