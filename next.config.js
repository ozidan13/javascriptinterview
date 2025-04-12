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
  // Experimental features
  experimental: {
    // Enable optimized bundle splitting
    optimizeCss: true,
  },
  // Add webpack configuration
  webpack: (config, { isServer }) => {
    // Explicitly include source-map
    config.resolve.alias['next/dist/compiled/source-map'] = require.resolve('source-map');
    
    // Enable source maps in production
    if (!isServer) {
      config.devtool = 'source-map';
    }
    
    return config;
  }
};

module.exports = nextConfig; 