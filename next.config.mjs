/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is default in Next.js 14
  experimental: {
    typedRoutes: false,
  },
  // Output standalone for Docker/server deployment
  // output: 'standalone',
}

export default nextConfig
