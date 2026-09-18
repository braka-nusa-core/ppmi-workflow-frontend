import { useQuery } from '@tanstack/react-query'
import { fetchClients } from '@/lib/api/clients'

export const clientKeys = { all: ['clients'] as const }

/** Used by the quotation form's "existing client" selector. */
export function useClients() {
  return useQuery({
    queryKey: clientKeys.all,
    queryFn:  fetchClients,
  })
}