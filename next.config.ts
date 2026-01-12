import type { NextConfig } from "next";

// ============================================================================
// PERFORMANCE OPTIMIZATION CONFIGURATION (T17)
// ============================================================================

/**
 * Bundle Analyzer Configuration
 *
 * Run with: npx @next/bundle-analyzer
 * or add to package.json: "analyze": "ANALYZE=true next build"
 */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Next.js Configuration with Performance Optimizations
 *
 * Optimizations included:
 * - T17.1: Code splitting and lazy loading configuration
 * - T17.4: Image optimization settings
 * - T17.6: Bundle size optimization
 *
 * @see https://nextjs.org/docs/app/api-reference/next-config-js
 */
const nextConfig: NextConfig = {
  // Core settings
  // NOTE: Strict mode disabled to prevent double-rendering race conditions
  // with TanStack Query and Zustand persist middleware
  reactStrictMode: false,
  typescript: {
    // Disable type checking during build for speed
    // Run type checking separately with 'npm run type-check'
    ignoreBuildErrors: false,
  },

  // T17.1: Code Splitting Configuration
  experimental: {
    // Optimize package imports for tree-shaking
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'recharts',
      'date-fns',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
    ],
  },

  // T17.6: Bundle Size Optimization
  // Note: Next.js 15 has excellent automatic chunking. Custom splitChunks config
  // can break the build manifest and cause 404s. We rely on:
  // - Route-based splitting (automatic with app router)
  // - optimizePackageImports (above) for tree-shaking
  // - dynamic() imports for heavy components (Recharts, Framer Motion)
  webpack: (config, { isServer }) => {
    // Reduce size of three.js by only including needed modules
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    return config;
  },

  // T17.4: Image Optimization
  images: {
    // Enable modern image formats
    formats: ['image/avif', 'image/webp'],
    // Remote image patterns (for Gamma API images)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.polymarket.com',
      },
      {
        protocol: 'https',
        hostname: '**.gamma.io',
      },
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL (in seconds)
    minimumCacheTTL: 60,
  },

  // Compression for production
  compress: true,

  // Performance budgets for CI/CD
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // T17.6: Modularize imports for smaller bundle
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
  },

  // Headers for caching and performance
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif)',
        locale: false,
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
