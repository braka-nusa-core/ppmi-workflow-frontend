import { z } from 'zod'

export const createQSSchema = z.object({
  // Policy
  type:     z.enum(['NEW', 'RENEW'], { required_error: 'QS type is required' }),
  division: z.enum(['PI', 'HM'],    { required_error: 'Division is required' }),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  expiryDate:    z.string().min(1, 'Expiry date is required'),
  broker:        z.string().optional(),

  // Insured
  insuredName:    z.string().min(1, 'Insured name is required'),
  insuredAddress: z.string().optional(),
  insuredContact: z.string().optional(),

  // Vessel
  vesselName:     z.string().min(1, 'Vessel name is required'),
  vesselFlag:     z.string().optional(),
  vesselType:     z.string().optional(),
  vesselGRT:      z.number({ invalid_type_error: 'Must be a number' }).optional(),
  vesselBuiltYear:z.number({ invalid_type_error: 'Must be a number' }).optional(),
  imoNumber:      z.string().optional(),

  // Insurance
  insuranceType:   z.enum(['P&I', 'H&M', 'FD&D', 'War Risk', 'Cargo', 'Liability'], {
    required_error: 'Insurance type is required',
  }),
  coverageDetail: z.string().optional(),
  deductible:     z.number().optional(),

  // Premium
  currency:      z.enum(['IDR', 'USD']),
  premiumAmount: z.number({ invalid_type_error: 'Premium amount is required' })
    .min(1, 'Premium amount must be greater than 0'),
  exchangeRate:  z.number().optional(),

  // Notes
  internalNotes: z.string().optional(),
}).refine(
  (data) => {
    if (!data.effectiveDate || !data.expiryDate) return true
    return new Date(data.expiryDate) > new Date(data.effectiveDate)
  },
  { message: 'Expiry date must be after effective date', path: ['expiryDate'] }
)

export type CreateQSFormData = z.infer<typeof createQSSchema>
