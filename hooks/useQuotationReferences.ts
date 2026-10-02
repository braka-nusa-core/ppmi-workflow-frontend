import { useQuery } from '@tanstack/react-query'
import {
  fetchQuotationAdjusters,
  fetchQuotationSurveyors,
  fetchQuotationTemplate,
} from '@/lib/api/quotationReferences'

export const quotationReferenceKeys = {
  adjusters: ['quotation-references', 'adjusters'] as const,
  surveyors: ['quotation-references', 'surveyors'] as const,
  template:  (domain: 'HULL_MACHINERY' | 'CARGO') =>
    ['quotation-references', 'template', domain] as const,
}

/** Used by H&M/Cargo forms' adjuster multi-select (Phase 2). */
export function useQuotationAdjusters() {
  return useQuery({
    queryKey: quotationReferenceKeys.adjusters,
    queryFn:  fetchQuotationAdjusters,
  })
}

/** Used by H&M/Cargo forms' surveyor multi-select (Phase 2). */
export function useQuotationSurveyors() {
  return useQuery({
    queryKey: quotationReferenceKeys.surveyors,
    queryFn:  fetchQuotationSurveyors,
  })
}

/** Used by H&M/Cargo forms to load the standing template (Phase 2). Not for P&I — see fetchQuotationTemplate's note. */
export function useQuotationTemplate(domain: 'HULL_MACHINERY' | 'CARGO') {
  return useQuery({
    queryKey: quotationReferenceKeys.template(domain),
    queryFn:  () => fetchQuotationTemplate(domain),
  })
}