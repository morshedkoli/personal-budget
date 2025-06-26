/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['personal-budget-ten-ecru.vercel.app'],
  },
  // Optimize for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'bcryptjs'],
  },
  // Ensure proper build output
  output: 'standalone',
  // Handle environment variables properly
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Optimize bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig