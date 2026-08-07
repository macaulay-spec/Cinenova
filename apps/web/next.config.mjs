/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    '@cinenova/config',
    '@cinenova/contracts',
    '@cinenova/domain',
    '@cinenova/observability',
    '@cinenova/provider-sdk',
    '@cinenova/ui'
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'commondatastorage.googleapis.com'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(self), fullscreen=(self)'
          }
        ]
      }
    ];
  }
};

export default nextConfig;
