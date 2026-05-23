import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── ENTERPRISE COLOR PALETTE ───────────────────────────────
      colors: {
        // Navy — primary brand / accent
        navy: {
          50:  '#f0f4f8',
          100: '#d9e4ef',
          200: '#b3c9df',
          300: '#7fa3c4',
          400: '#4d7ea8',
          500: '#2d5f8a',
          600: '#1e4a70',
          700: '#163858',
          800: '#0f2840',
          900: '#091a2b',
          950: '#050f1a',
        },
        // Gray — backgrounds, borders, surfaces
        gray: {
          50:  '#f8f9fa',
          100: '#f1f3f5',
          150: '#eaecef',
          200: '#e2e5e9',
          300: '#ced3d9',
          400: '#9aa3ad',
          500: '#6b7785',
          600: '#4d5966',
          700: '#363f4a',
          800: '#232b34',
          900: '#141920',
        },
        // Status colors — semantic workflow states
        status: {
          // Draft / Pending
          draft:        { bg: '#f1f3f5', text: '#4d5966', border: '#ced3d9' },
          // Active / In Progress
          active:       { bg: '#e8f4fd', text: '#1e4a70', border: '#b3c9df' },
          // Approved
          approved:     { bg: '#e8f7ee', text: '#1a6b3a', border: '#a3d9b8' },
          // Rejected
          rejected:     { bg: '#fdecea', text: '#9b2020', border: '#f5b4b4' },
          // Warning / Overdue
          warning:      { bg: '#fff8e6', text: '#7a4f00', border: '#fcd97a' },
          // Completed
          completed:    { bg: '#e8f4fd', text: '#1e4a70', border: '#b3c9df' },
        },
        // Semantic aliases
        primary:    '#1e4a70',    // Navy 600
        'primary-hover': '#163858', // Navy 700
        'primary-light': '#e8f4fd',
        surface:    '#ffffff',    // Card background
        background: '#f1f3f5',   // Page background
        border:     '#e2e5e9',   // Default border
        'border-strong': '#ced3d9',
        muted:      '#9aa3ad',   // Secondary text
        'text-primary':   '#232b34',
        'text-secondary': '#4d5966',
        'text-muted':     '#9aa3ad',
      },

      // ─── TYPOGRAPHY ─────────────────────────────────────────────
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      fontSize: {
        'xs':   ['11px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm':   ['12px', { lineHeight: '18px', letterSpacing: '0.005em' }],
        'base': ['13px', { lineHeight: '20px', letterSpacing: '0' }],
        'md':   ['14px', { lineHeight: '22px', letterSpacing: '0' }],
        'lg':   ['15px', { lineHeight: '24px', letterSpacing: '-0.01em' }],
        'xl':   ['17px', { lineHeight: '26px', letterSpacing: '-0.01em' }],
        '2xl':  ['20px', { lineHeight: '30px', letterSpacing: '-0.015em' }],
        '3xl':  ['24px', { lineHeight: '34px', letterSpacing: '-0.02em' }],
        '4xl':  ['30px', { lineHeight: '40px', letterSpacing: '-0.025em' }],
      },
      fontWeight: {
        normal:   '400',
        medium:   '500',
        semibold: '600',
        bold:     '700',
      },

      // ─── SPACING SYSTEM ─────────────────────────────────────────
      // Enterprise-calibrated — denser than consumer defaults
      spacing: {
        '0.5': '2px',
        '1':   '4px',
        '1.5': '6px',
        '2':   '8px',
        '2.5': '10px',
        '3':   '12px',
        '3.5': '14px',
        '4':   '16px',
        '5':   '20px',
        '6':   '24px',
        '7':   '28px',
        '8':   '32px',
        '9':   '36px',
        '10':  '40px',
        '11':  '44px',
        '12':  '48px',
        '14':  '56px',
        '16':  '64px',
        '18':  '72px',
        '20':  '80px',
        '24':  '96px',
      },

      // ─── LAYOUT DIMENSIONS ──────────────────────────────────────
      width: {
        'sidebar':        '240px',
        'sidebar-compact': '64px',
        'detail-panel':   '520px',
        'modal-sm':       '400px',
        'modal-md':       '640px',
        'modal-lg':       '800px',
        'modal-xl':       '960px',
      },
      height: {
        'topbar':       '56px',
        'table-row':    '48px',
        'table-row-compact': '40px',
        'page-header':  '64px',
      },

      // ─── BORDERS ────────────────────────────────────────────────
      borderRadius: {
        'none': '0',
        'sm':   '3px',
        'DEFAULT': '4px',
        'md':   '6px',
        'lg':   '8px',
        'xl':   '12px',
        'full': '9999px',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
      },

      // ─── SHADOWS ────────────────────────────────────────────────
      // Enterprise: subtle, functional — no dramatic shadows
      boxShadow: {
        'none':   'none',
        'xs':     '0 1px 2px 0 rgba(20, 25, 32, 0.05)',
        'sm':     '0 1px 3px 0 rgba(20, 25, 32, 0.08), 0 1px 2px -1px rgba(20, 25, 32, 0.06)',
        'DEFAULT':'0 2px 4px 0 rgba(20, 25, 32, 0.08), 0 1px 3px -1px rgba(20, 25, 32, 0.06)',
        'md':     '0 4px 8px -1px rgba(20, 25, 32, 0.10), 0 2px 4px -2px rgba(20, 25, 32, 0.06)',
        'lg':     '0 8px 16px -2px rgba(20, 25, 32, 0.12), 0 4px 8px -4px rgba(20, 25, 32, 0.08)',
        'modal':  '0 16px 32px -4px rgba(20, 25, 32, 0.16), 0 8px 16px -8px rgba(20, 25, 32, 0.12)',
        'inset':  'inset 0 1px 2px 0 rgba(20, 25, 32, 0.06)',
      },

      // ─── TRANSITIONS ────────────────────────────────────────────
      transitionDuration: {
        '75':   '75ms',
        '100':  '100ms',
        '150':  '150ms',
        '200':  '200ms',
        '300':  '300ms',
      },
      transitionTimingFunction: {
        'enterprise': 'cubic-bezier(0.2, 0, 0, 1)',
        'snap':       'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      // ─── Z-INDEX ────────────────────────────────────────────────
      zIndex: {
        'sidebar':    '40',
        'topbar':     '50',
        'dropdown':   '100',
        'modal-backdrop': '200',
        'modal':      '210',
        'toast':      '300',
        'tooltip':    '400',
      },
    },
  },
  plugins: [],
}

export default config
