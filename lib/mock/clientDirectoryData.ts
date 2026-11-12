// FILE: lib/mock/clientDirectoryData.ts
// MOCK / DEMO DATA — supplied sample row only. Not from the backend.
// Do not add invented clients here; replace via the repository boundary.
import type { DirectoryClient, DirectoryPolicyRecord } from '@/types/clientDirectory'

export const MOCK_DIRECTORY_CLIENTS: DirectoryClient[] = [
  {
    id: 'mock-client-001',
    clientCode: 'CLI-001',
    name: 'PT. AGUNG SUKSES LANCARA QQ PT SENTOSA SAMUDRA JAYA',
    address: 'Jakarta, Indonesia',
    phone: '021-1234567',
    email: 'contact@agung.co.id',
    contactPerson: 'John Doe',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    deletedAt: null,
  },
]

export const MOCK_DIRECTORY_RECORDS: DirectoryPolicyRecord[] = [
  {
    id: 'mock-record-001',
    clientId: 'mock-client-001',
    sourceMonth: 'September',
    sourceRecordNo: 79,
    policyNumber: '50020907-2',
    periodStart: '2026-09-01',
    periodEnd: '2027-09-01',
    vesselName: 'BIMA SAKTI',
    vesselType: 'TUG BOAT',
    yearBuilt: 1982,
    grossTonnage: 85,
    classification: 'BKI',
    insurer: 'MSIG',
    remark: 'NEW VESSEL',
  },
]
