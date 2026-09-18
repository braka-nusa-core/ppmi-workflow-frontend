import { get } from './client'
import { fromWire } from './wireMapper'
import type { InsuranceType } from '@/types/insuranceTypes'

interface Envelope<T> {
  success: boolean
  data: T
}

export async function fetchInsuranceTypes(): Promise<InsuranceType[]> {
  const res = await get<Envelope<unknown[]>>('/insurance-types')
  return fromWire<InsuranceType[]>(res.data)
}