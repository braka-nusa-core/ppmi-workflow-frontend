// FILE: lib/demo/demoMode.ts
// ═══════════════════════════════════════════════════════════════
// DEMO MODE SWITCH
//
// Single, explicit switch for the client-demo layer. Demo mode is
// OFF unless NEXT_PUBLIC_DEMO_MODE is exactly the string "true" at
// build/start time (set it in .env.local). A production build that
// does not set the variable can never render demo data.
//
// Everything demo-related lives under lib/demo/ and components/demo/.
// Real API hooks (hooks/*, lib/api/*) never import from here.
// ═══════════════════════════════════════════════════════════════

export const IS_DEMO_MODE: boolean = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
