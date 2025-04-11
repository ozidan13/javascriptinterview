/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Convert Image components to img tags for better compatibility
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig; 