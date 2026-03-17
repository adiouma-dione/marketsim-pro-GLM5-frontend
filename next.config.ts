// ============================================================
// MarketSim Pro - Next.js Configuration
// ============================================================

import type { NextConfig } from 'next';

const allowedDevOrigins = Array.from(
  new Set(
    (process.env.NEXT_ALLOWED_DEV_ORIGINS || '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
      .map((origin) => {
        try {
          return new URL(origin).hostname;
        } catch {
          return origin
            .replace(/^https?:\/\//i, '')
            .split('/')[0]
            .split(':')[0];
        }
      })
      .filter(Boolean)
  )
);

const nextConfig: NextConfig = {
  // Output mode for production deployment
  output: 'standalone',

  // React strict mode for better development experience
  reactStrictMode: true,

  // Allow dev origins from env (useful when accessing via LAN IP)
  allowedDevOrigins: allowedDevOrigins.length ? allowedDevOrigins : undefined,

  // TypeScript configuration
  typescript: {
    // Don't ignore build errors in production
    ignoreBuildErrors: false,
  },

  // Experimental features
  experimental: {
    // Optimize package imports for faster builds
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@tanstack/react-table',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-popover',
      '@radix-ui/react-progress',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-separator',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-switch',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'z-cdn.chatglm.cn',
      },
    ],
  },

  // Environment variables validation at build time
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Redirects and rewrites
  async redirects() {
    return [
      // Redirect old routes to new ones if needed
    ];
  },

  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    return [
      // Proxy SSE endpoints to add authentication
      {
        source: '/api/sse/:path*',
        destination: `${apiUrl}/api/v1/sessions/:path*/sse`,
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;
