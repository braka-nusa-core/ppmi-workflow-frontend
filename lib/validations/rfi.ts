import { z } from 'zod'

/**
 * Matches POST /api/v1/request-for-invoices request body: { policyId }.
 */
export const createRfiSchema = z.object({
  policyId: z.string().min(1, 'Policy is required'),
})

export type CreateRfiFormData = z.infer<typeof createRfiSchema>

export const updateRfiSchema = z.object({
  policyId: z.string().min(1, 'Policy is required').optional(),
})

export type UpdateRfiFormData = z.infer<typeof updateRfiSchema>