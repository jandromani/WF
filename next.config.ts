import type { NextConfig } from 'next';

const contentSecurityPolicy = [
  "default-src 'self'",
  "img-src 'self' data: https://static.usernames.app-backend.toolsforhumanity.com https://images.worldapp.world",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self'",
  "connect-src 'self' https://worldchain-mainnet.g.alchemy.com https://developer.worldcoin.org",
  "font-src 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  images: {
    domains: [
      'static.usernames.app-backend.toolsforhumanity.com',
      'images.worldapp.world',
    ],
  },
  allowedDevOrigins: ['*'], // Add your dev origin here
  reactStrictMode: false,
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: contentSecurityPolicy,
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
      ],
    },
  ],
};

export default nextConfig;
