import { get } from './client'
import type { BackendStatsEnvelope, BackendWorkspaceEnvelope } from '@/types/backend/overview'

/**
 * GET /overview/stats
 * Requires: Bearer JWT (via axios interceptor)
 * Returns the full { success, status_code, data } envelope.
 * Access the payload at .data
 */
export async function fetchOverviewStats(): Promise<BackendStatsEnvelope> {
  return get<BackendStatsEnvelope>('/overview/stats')
}

/**
 * GET /overview/workspace
 * Requires: Bearer JWT (via axios interceptor)
 * Returns the full { success, status_code, data } envelope.
 * Access the payload at .data.{ workflows, recents, finances, payments }
 */
export async function fetchOverviewWorkspace(): Promise<BackendWorkspaceEnvelope> {
  return get<BackendWorkspaceEnvelope>('/overview/workspace')
}
