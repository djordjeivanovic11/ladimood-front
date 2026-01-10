/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ladimood.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ladimood.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.ladimood.com/:path*',
      },
    ];
  },
};

export default nextConfig;
