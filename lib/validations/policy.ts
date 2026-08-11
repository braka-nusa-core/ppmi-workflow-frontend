import { z } from 'zod'

/**
 * Matches POST /api/v1/policies request body per the latest Policy API
 * Specification: { quotationId, policyNumber, policyDate }.
 */
export const createPolicySchema = z.object({
  quotationId:  z.string().min(1, 'Quotation is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  policyDate:   z.string().min(1, 'Policy date is required'),
})

export type CreatePolicyFormData = z.infer<typeof createPolicySchema>

export const updatePolicySchema = z.object({
  quotationId:  z.string().min(1, 'Quotation is required').optional(),
  policyNumber: z.string().min(1, 'Policy number is required').optional(),
  policyDate:   z.string().min(1, 'Policy date is required').optional(),
})

export type UpdatePolicyFormData = z.infer<typeof updatePolicySchema>

/**
 * Matches POST /api/v1/policies/:id/leader and /members request bodies:
 * { insuranceCompanyId, sharePercentage }.
 */
export const addParticipantSchema = z.object({
  insuranceCompanyId: z.string().min(1, 'Insurance company is required'),
  sharePercentage: z
    .number({ invalid_type_error: 'Share percentage is required' })
    .gt(0, 'Share must be greater than 0')
    .lte(100, 'Share cannot exceed 100'),
})

export type AddParticipantFormData = z.infer<typeof addParticipantSchema>

export const updateParticipantSchema = z.object({
  sharePercentage: z
    .number({ invalid_type_error: 'Share percentage is required' })
    .gt(0, 'Share must be greater than 0')
    .lte(100, 'Share cannot exceed 100'),
})

export type UpdateParticipantFormData = z.infer<typeof updateParticipantSchema>