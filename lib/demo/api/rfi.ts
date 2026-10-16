// FILE: lib/demo/api/rfi.ts
// DEMO FACADE for lib/api/rfi.ts — see lib/demo/api/policy.ts for the mechanism.
import * as real from '../../api/rfi'
import { demoFind, demoList } from '../query'
import { getDemoDataset } from '../registry'

export * from '../../api/rfi'

export const fetchRfiList: typeof real.fetchRfiList = async (filters = {}) =>
  demoList(getDemoDataset().rfis, filters, {
    searchFields: ['id', 'policyNumber', 'quotationNumber', 'insured', 'requestedBy'],
    filters:      { status: 'status' },
  }) as unknown as Awaited<ReturnType<typeof real.fetchRfiList>>

export const fetchRfiDetail: typeof real.fetchRfiDetail = async (id) =>
  demoFind(getDemoDataset().rfis, id, 'RFI')

export const fetchRfiChecklist: typeof real.fetchRfiChecklist = async (id) =>
  demoFind(getDemoDataset().rfis, id, 'RFI').checklist

export const fetchRfiAttachments: typeof real.fetchRfiAttachments = async (id) =>
  demoFind(getDemoDataset().rfis, id, 'RFI').attachments

export const fetchRfiHistory: typeof real.fetchRfiHistory = async (id) =>
  getDemoDataset().rfiHistory[id] ?? []