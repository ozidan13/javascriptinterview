/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Image optimization settings
  images: {
    domains: ['clerk.dev', 'img.clerk.com'],
    // Only disable optimization if absolutely necessary
    unoptimized: false,
  },
  // Disable type checking during builds for better performance
  typescript: {
    ignoreBuildErrors: true,
  },
  // Output settings for Vercel
  output: 'standalone',
  // Tracing excludes moved from experimental
  outputFileTracingExcludes: {
    '*': ['node_modules/**/*'],
  },
  // Experimental features
  experimental: {
    // Enable optimized bundle splitting
    optimizeCss: true,
  },
};

module.exports = nextConfig; 