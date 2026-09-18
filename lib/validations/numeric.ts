import { z } from 'zod'

/**
 * An optional, non-negative number field for native
 * `<input type="number">` HTML controls registered with React Hook
 * Form's `valueAsNumber: true`.
 *
 * WHY THIS EXISTS (bug found during Phase 3C audit):
 * `input.valueAsNumber` is the browser's native way of reading a
 * number input's value — and for an EMPTY number input, the native
 * value is `NaN`, not `undefined`. Plain `z.number().optional()`
 * treats `NaN` as an invalid number (confirmed: `z.number().optional()
 * .safeParse(NaN)` fails), not as "field not provided" — so simply
 * leaving Rate/Premium/Deductible/Brokerage/Coverage Value blank was
 * silently blocking form submission with a validation error the user
 * had no way to understand, on every quotation form (Phase 3A create/
 * edit) and the Coverage form (Phase 3B).
 *
 * This preprocesses `NaN` (and `null`) to `undefined` before the
 * number check runs, so an empty field is correctly treated as "not
 * provided" and omitted from the payload — never coerced to `0`,
 * since `z.number()` still runs normally on any other value and will
 * reject genuinely invalid non-numeric input.
 */
export const optionalNonNegativeNumber = z.preprocess(
  (val) => (typeof val === 'number' && Number.isNaN(val)) || val === null ? undefined : val,
  z.number().nonnegative().optional()
)