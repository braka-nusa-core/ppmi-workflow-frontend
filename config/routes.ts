// FILE: config/routes.ts
// ─── ROUTES ──────────────────────────────────────────────────────
// Single source of truth for every application route path.
// config/navigation.ts and any non-navigation component that needs
// a route must import from here rather than hardcoding path strings.

export const ROUTES = {
  overview: '/dashboard/overview',

  /**
   * @deprecated LEGACY — targets the old `/qs` backend resource, which
   * no longer exists on the current backend (current backend only has
   * `/quotations`, `/pni`, `/hm`, `/cargo`). Kept only because
   * `app/dashboard/qs/*` and `components/qs/*` still reference it and
   * have not been removed — `components/policy/PolicyCreateClient.tsx`
   * still reads a legacy QS doc via `lib/api/qs.ts` for its
   * "linked QS" display, so that one API module can't be deleted yet.
   * Do NOT link to this from new navigation, dashboard cards, or any
   * new QS work — use `ROUTES.quotations` below instead.
   */
  qs: {
    list: '/dashboard/qs',
    new:  '/dashboard/qs/new',
    detail: (id: string) => `/dashboard/qs/${id}`,
    edit:   (id: string) => `/dashboard/qs/${id}/edit`,
  },

  // New quotation domain (backend resource: /quotations). Deliberately
  // separate from `qs` above — that's the legacy module's routes and
  // targets a different, incompatible backend resource.
  quotations: {
    list:   '/dashboard/quotations',
    new:    '/dashboard/quotations/new',
    detail: (id: string) => `/dashboard/quotations/${id}`,
    edit:   (id: string) => `/dashboard/quotations/${id}/edit`,
    // P&I-specific create/edit (Phase 2B) — the generic `new`/`edit`
    // above post to POST/PATCH /quotations and cannot represent a P&I
    // quotation's nested vessels/insurance blocks/etc. `detail` above
    // is still the shared landing page after a P&I save, per the
    // existing quotation detail architecture (base Quotation id).
    pniNew:  '/dashboard/quotations/pni/new',
    pniEdit: (id: string) => `/dashboard/quotations/pni/${id}/edit`,
    // H&M-specific create/edit (Phase 3B) — two-step create
    // (POST /quotations then POST /hm/quotations/:id) behind one form.
    hmNew:   '/dashboard/quotations/hm/new',
    hmEdit:  (id: string) => `/dashboard/quotations/hm/${id}/edit`,
  },

  policy: {
    list: '/dashboard/policy',
    new:  '/dashboard/policy/new',
    detail: (id: string) => `/dashboard/policy/${id}`,
    edit:   (id: string) => `/dashboard/policy/${id}/edit`,
  },

  rfi: {
    list: '/dashboard/rfi',
    new:  '/dashboard/rfi/new',
    detail: (id: string) => `/dashboard/rfi/${id}`,
    edit:   (id: string) => `/dashboard/rfi/${id}/edit`,
  },

  invoice: {
    list: '/dashboard/invoice',
    new:  '/dashboard/invoice/new',
    detail: (id: string) => `/dashboard/invoice/${id}`,
    edit:   (id: string) => `/dashboard/invoice/${id}/edit`,
  },

  voucher: {
    list: '/dashboard/voucher',
    new:  '/dashboard/voucher/new',
    detail: (id: string) => `/dashboard/voucher/${id}`,
    edit:   (id: string) => `/dashboard/voucher/${id}/edit`,
  },

  payment: {
    list: '/dashboard/payment',
    new:  '/dashboard/payment/new',
    detail: (id: string) => `/dashboard/payment/${id}`,
  },

  outgoingPayment: {
    list: '/dashboard/outgoing-payment',
    new:  '/dashboard/outgoing-payment/new',
    detail: (id: string) => `/dashboard/outgoing-payment/${id}`,
  },

  shipment: {
    list: '/dashboard/shipment',
    new:  '/dashboard/shipment/new',
    detail: (id: string) => `/dashboard/shipment/${id}`,
    edit:   (id: string) => `/dashboard/shipment/${id}/edit`,
  },

  finance: {
    monitor:      '/dashboard/finance',
    overdue:      '/dashboard/finance/overdue',
    verification: '/dashboard/finance/verification',
  },

  reports: '/dashboard/reports',

  admin: '/dashboard/admin',
} as const