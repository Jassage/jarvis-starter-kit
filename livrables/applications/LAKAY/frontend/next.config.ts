import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4003';
const isDev = process.env.NODE_ENV !== 'production';

// Origines backend à autoriser pour fetch/XHR/WebSocket
const apiOrigin = new URL(API_URL).origin;
const socketOrigin = new URL(SOCKET_URL).origin;
const wsApi = apiOrigin.replace(/^http/, 'ws');
const wsSocket = socketOrigin.replace(/^http/, 'ws');

const connectSrc = ["'self'", apiOrigin, socketOrigin, wsApi, wsSocket].join(' ');

// Next.js impose 'unsafe-inline' (styles + certains scripts inline) et 'unsafe-eval' en dev.
// La CSP restreint quand même toutes les origines externes (scripts/frames/objets tiers).
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline' https://unpkg.com`,
  `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.tile.openstreetmap.org https://unpkg.com`,
  `font-src 'self' data:`,
  `connect-src ${connectSrc}`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
].join('; ');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4003/api',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4003',
    NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ];
  },
};

export default nextConfig;
