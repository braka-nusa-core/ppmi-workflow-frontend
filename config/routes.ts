// ─── ROUTES ──────────────────────────────────────────────────────
// Single source of truth for every application route path.
// config/navigation.ts and any non-navigation component that needs
// a route must import from here rather than hardcoding path strings.

export const ROUTES = {
  overview: '/dashboard/overview',

  qs: {
    list: '/dashboard/qs',
    new:  '/dashboard/qs/new',
    detail: (id: string) => `/dashboard/qs/${id}`,
    edit:   (id: string) => `/dashboard/qs/${id}/edit`,
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