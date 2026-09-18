import { useQuery } from '@tanstack/react-query'
import { fetchInsuranceTypes } from '@/lib/api/insuranceTypes'

export const insuranceTypeKeys = { all: ['insurance-types'] as const }

/** Used by the quotation form's insurance-type selector. */
export function useInsuranceTypes() {
  return useQuery({
    queryKey: insuranceTypeKeys.all,
    queryFn:  fetchInsuranceTypes,
  })
}