// FILE: next.config.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// ─── Demo mode (NEXT_PUBLIC_DEMO_MODE=true) ─────────────────────────
// Downstream modules whose BACKEND is not confirmed live. In demo mode the
// import '@/lib/api/<module>' is replaced at build time with
// lib/demo/api/<module>.ts, a facade that serves the local demo registry for
// READ calls and re-exports the real module for everything else. Components
// are untouched; with the flag off no plugin is registered, so the real API
// layer is used exactly as before. QS/quotation modules (lib/api/quotations,
// pni, hm, cargo, …) are deliberately NOT listed and are never replaced.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
const DEMO_API_MODULES = [
  'policy',
  'rfi',
  'voucher',
  'invoice',
  'payment',
  'outgoingPayment',
  'shipment',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is default in Next.js 14
  experimental: {
    typedRoutes: false,
  },
  // Always inline an explicit 'true' / 'false' so the bundler can fold demo-only
  // branches away at build time (an unset variable would not be inlined).
  env: {
    NEXT_PUBLIC_DEMO_MODE: DEMO_MODE ? 'true' : 'false',
  },
  webpack: (config, { webpack }) => {
    if (DEMO_MODE) {
      const demoImport = new RegExp(`^@/lib/api/(${DEMO_API_MODULES.join('|')})$`)
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(demoImport, (resource) => {
          const name = resource.request.replace('@/lib/api/', '')
          resource.request = path.join(projectRoot, 'lib', 'demo', 'api', `${name}.ts`)
        })
      )
    }
    return config
  },
  // Output standalone for Docker/server deployment
  // output: 'standalone',
}

export default nextConfig