import { z } from 'zod'

/**
 * Matches backend createShipmentSchema (shipments.validation.ts):
 *   invoice_id       required, non-empty string
 *   courier          required, non-empty string
 *   tracking_number  required, non-empty string
 *   shipping_date    required, full ISO-8601 datetime
 *   payment_id       optional
 *   shipping_proof_id optional
 *
 * shippingDate is validated as a non-empty string here (the RHF form
 * collects a plain <input type="date"> value); the adapter's
 * dateInputToISO() is responsible for the actual ISO-8601 conversion
 * before the request is sent, same as QS/Invoice/Voucher/Payment.
 */
export const createShipmentSchema = z.object({
  invoiceId:        z.string().min(1, 'Invoice is required'),
  courier:          z.string().min(1, 'Courier is required'),
  trackingNumber:   z.string().min(1, 'Tracking number is required'),
  shippingDate:     z.string().min(1, 'Shipping date is required'),
  paymentId:        z.string().optional(),
  shippingProofId:  z.string().optional(),
})

export type CreateShipmentFormData = z.infer<typeof createShipmentSchema>

/**
 * Matches backend updateShipmentSchema — same fields, all optional.
 */
export const updateShipmentSchema = z.object({
  invoiceId:        z.string().min(1, 'Invoice is required').optional(),
  courier:          z.string().min(1, 'Courier is required').optional(),
  trackingNumber:   z.string().min(1, 'Tracking number is required').optional(),
  shippingDate:     z.string().min(1, 'Shipping date is required').optional(),
  paymentId:        z.string().optional(),
  shippingProofId:  z.string().optional(),
})

export type UpdateShipmentFormData = z.infer<typeof updateShipmentSchema>